import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { originAllowed, returnOrigin } from '@/lib/app-origin.mjs';
import { siteUrl } from '@/lib/site';
import { billingEnabled, checkoutParams, isActive } from '@/lib/abonnement.mjs';
import { stripeClient } from '@/lib/stripe';

// Ouvre la page de paiement Stripe (Checkout) pour l'abonnement Recettes Pro du compte connecté.
// L'abonnement n'est enregistré qu'à la réception de l'événement Stripe (/api/stripe/webhook).
// Variables Netlify : STRIPE_SECRET_KEY, STRIPE_PRICE_RECETTES ; facultatif : STRIPE_TAX_RATE.
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => NextResponse.json(body, { status });

export async function POST(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!originAllowed(request.headers.get('origin'), host)) return json({ error: 'Origine refusée' }, 403);
  if (!billingEnabled(process.env)) return json({ error: "L'abonnement n'est pas encore ouvert." }, 503);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: 'Connexion requise' }, 401);

  const { data: sub } = await supabase.from('subscriptions').select('stripe_customer_id,status').maybeSingle();
  if (isActive(sub)) return json({ error: 'Votre abonnement est déjà actif.' }, 409);

  try {
    const session = await stripeClient().checkout.sessions.create(
      checkoutParams({
        userId: user.id,
        email: user.email,
        customerId: sub?.stripe_customer_id,
        priceId: process.env.STRIPE_PRICE_RECETTES,
        taxRateId: process.env.STRIPE_TAX_RATE,
        origin: returnOrigin(request.headers.get('origin'), siteUrl()),
      })
    );
    return json({ url: session.url });
  } catch (e) {
    console.error('Stripe (paiement)', e.type, e.message);
    return json({ error: 'Le paiement est indisponible pour le moment. Réessayez dans quelques minutes.' }, 502);
  }
}
