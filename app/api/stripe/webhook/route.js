import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { SUPABASE_URL } from '@/lib/supabase/config';
import { SUBSCRIPTION_EVENTS, subscriptionRow } from '@/lib/abonnement.mjs';

// Événements envoyés par Stripe (création, changement, résiliation d'un abonnement). La signature est vérifiée
// avec STRIPE_WEBHOOK_SECRET ; l'état est enregistré par la fonction save_subscription (supabase/schema.sql),
// qui ignore les événements arrivés dans le désordre. Une erreur renvoie 500 : Stripe renvoie l'événement plus tard.
// Variables Netlify : STRIPE_WEBHOOK_SECRET et SUPABASE_SERVICE_ROLE_KEY.
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => NextResponse.json(body, { status });

export async function POST(request) {
  const env = process.env;
  if (!env.STRIPE_WEBHOOK_SECRET || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'Abonnements non configurés' }, 503);

  // La signature porte sur le corps exact reçu : il est lu en texte, sans transformation
  const body = await request.text();
  let event;
  try {
    event = await Stripe.webhooks.constructEventAsync(body, request.headers.get('stripe-signature') || '', env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return json({ error: 'Signature invalide' }, 400);
  }
  if (!SUBSCRIPTION_EVENTS.includes(event.type)) return json({ ignored: true });

  const row = subscriptionRow(event.data.object, event.created);
  if (!row) {
    console.warn('Stripe : abonnement sans compte Equimarge', event.data.object?.id);
    return json({ ignored: true });
  }
  const db = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await db.rpc('save_subscription', row);
  if (error) {
    console.error('Abonnement', error.message);
    return json({ error: 'Enregistrement impossible' }, 500);
  }
  return json({ received: true });
}
