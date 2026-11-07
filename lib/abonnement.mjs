// Abonnement « Recettes Pro » (Stripe) : règles isolées ici pour être testées (tests/abonnement.test.mjs).
// Aucun appel réseau dans ce fichier.
//
// Sans abonnement : recettes et matières illimitées, et quelques lectures de factures gratuites par mois.
// Avec l'abonnement : lectures de factures dans la limite anti-abus de la base (30 par jour, 300 par mois).
// Tant que Stripe n'est pas configuré (billingEnabled faux), aucune limite d'abonnement ne s'applique.

export const PLAN_NAME = 'Recettes Pro';
export const DEFAULT_FREE_READS = 3;

// Statuts Stripe qui donnent accès : actif, essai, et paiement en retard (le temps que Stripe relance la carte)
export const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];
// Événements Stripe traités par le webhook
export const SUBSCRIPTION_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.paused',
  'customer.subscription.resumed',
];

export const STATUS_LABELS = {
  active: 'Actif',
  trialing: "Période d'essai",
  past_due: 'Paiement en retard',
  unpaid: 'Impayé',
  paused: 'En pause',
  incomplete: 'Paiement à finaliser',
  incomplete_expired: 'Paiement non finalisé',
  canceled: 'Résilié',
};

export function billingEnabled(env) {
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_RECETTES);
}

// Lectures gratuites par mois (variable FACTURES_GRATUITES, 0 à 30, 3 par défaut)
export function freeReads(env) {
  const raw = env.FACTURES_GRATUITES;
  if (raw === undefined || raw === '') return DEFAULT_FREE_READS;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 && n <= 30 ? n : DEFAULT_FREE_READS;
}

export const isActive = (sub) => Boolean(sub && ACTIVE_STATUSES.includes(sub.status));

// Premier jour du mois en cours (UTC), point de départ du compteur de lectures gratuites
export function monthStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

// Lectures restantes ce mois-ci : Infinity pour un abonné ou quand l'abonnement n'est pas en service
export function readsLeft({ enabled, active, used, free }) {
  if (!enabled || active) return Infinity;
  return Math.max(0, free - used);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toIso = (seconds) => (Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000).toISOString() : null);

// Abonnement Stripe → paramètres de la fonction save_subscription (supabase/schema.sql).
// Le compte Equimarge est retrouvé par metadata.user_id, posé à la création (checkoutParams).
// Renvoie null si l'abonnement n'est pas rattaché à un compte.
export function subscriptionRow(sub, eventCreated) {
  const userId = sub?.metadata?.user_id;
  if (!sub?.id || !UUID.test(userId || '')) return null;
  const item = sub.items?.data?.[0];
  return {
    p_user_id: userId,
    p_customer: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id || '',
    p_subscription: sub.id,
    p_status: String(sub.status || 'incomplete'),
    p_price: item?.price?.id || null,
    // Depuis l'API Stripe 2025-03-31, la fin de période est portée par chaque élément de l'abonnement
    p_period_end: toIso(item?.current_period_end ?? sub.current_period_end),
    p_cancel: Boolean(sub.cancel_at_period_end || sub.cancel_at),
    p_event_at: toIso(eventCreated) || new Date().toISOString(),
  };
}

// Paramètres de la page de paiement Stripe (Checkout) pour un compte Equimarge
// taxRateId : taux de TVA Stripe (txr_…) à ajouter à un prix hors taxes, si l'entreprise facture la TVA
export function checkoutParams({ userId, email, customerId, priceId, taxRateId, origin }) {
  return {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1, ...(taxRateId && { tax_rates: [taxRateId] }) }],
    ...(customerId ? { customer: customerId, customer_update: { name: 'auto', address: 'auto' } } : { customer_email: email || undefined }),
    client_reference_id: userId,
    metadata: { user_id: userId },
    subscription_data: { metadata: { user_id: userId } },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    tax_id_collection: { enabled: true },
    locale: 'fr',
    success_url: `${origin}/tableau-de-bord/compte?abonnement=merci`,
    cancel_url: `${origin}/tableau-de-bord/compte?abonnement=annule`,
  };
}

// Message affiché quand les lectures gratuites du mois sont épuisées
export function quotaMessage(free) {
  return free > 0
    ? `Vos ${free} lecture${free > 1 ? 's' : ''} gratuite${free > 1 ? 's' : ''} du mois ${free > 1 ? 'sont utilisées' : 'est utilisée'}. Abonnez-vous à ${PLAN_NAME} pour lire toutes vos factures ; la saisie à la main reste gratuite.`
    : `La lecture des factures est réservée aux abonnés ${PLAN_NAME} ; la saisie à la main reste gratuite.`;
}

// L'abonnement existe encore chez Stripe (il peut encore être prélevé) : à résilier avant de supprimer le compte
export const isOpen = (sub) => Boolean(sub && !['canceled', 'incomplete_expired'].includes(sub.status));

// Prix Stripe → texte affiché (« 29 € HT / mois »). null si le prix n'est pas exploitable.
export function priceLabel(price) {
  if (!price || !Number.isFinite(price.unit_amount) || !price.currency) return null;
  const amount = (price.unit_amount / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: price.currency.toUpperCase(),
    minimumFractionDigits: price.unit_amount % 100 ? 2 : 0,
  });
  const tax = price.tax_behavior === 'inclusive' ? 'TTC' : 'HT';
  const r = price.recurring;
  const period = !r ? '' : r.interval === 'year' ? (r.interval_count > 1 ? ` / ${r.interval_count} ans` : ' / an') : r.interval_count > 1 ? ` / ${r.interval_count} mois` : ' / mois';
  return `${amount} ${tax}${period}`;
}
