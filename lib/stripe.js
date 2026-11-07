import Stripe from 'stripe';
import { billingEnabled } from '@/lib/abonnement.mjs';

// Client Stripe côté serveur. La clé secrète (STRIPE_SECRET_KEY) reste sur le serveur : ce fichier ne doit être
// importé que par des routes et des pages serveur, jamais par un composant 'use client'.
export function stripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY, { maxNetworkRetries: 1, timeout: 20000 });
}

// Prix de l'abonnement (STRIPE_PRICE_RECETTES), gardé 10 minutes en mémoire : affiché sur « Mon compte »
// et sur la page /artisans. null si Stripe n'est pas configuré ou ne répond pas.
let cache = { at: 0, price: null };
export async function recettesPrice() {
  if (!billingEnabled(process.env)) return null;
  if (cache.price && Date.now() - cache.at < 600000) return cache.price;
  try {
    const p = await stripeClient().prices.retrieve(process.env.STRIPE_PRICE_RECETTES);
    cache = { at: Date.now(), price: { unit_amount: p.unit_amount, currency: p.currency, tax_behavior: p.tax_behavior, recurring: p.recurring } };
  } catch (e) {
    console.error('Stripe (prix)', e.message);
  }
  return cache.price;
}
