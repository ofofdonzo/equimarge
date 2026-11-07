import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { originAllowed, returnOrigin } from '@/lib/app-origin.mjs';
import { siteUrl } from '@/lib/site';
import { stripeClient } from '@/lib/stripe';

// Ouvre l'espace client Stripe : carte bancaire, factures, résiliation de l'abonnement.
// Variable Netlify : STRIPE_SECRET_KEY. L'espace client se règle dans Stripe (Settings > Billing > Customer portal).
export const dynamic = 'force-dynamic';

const json = (body, status = 200) => NextResponse.json(body, { status });

export async function POST(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!originAllowed(request.headers.get('origin'), host)) return json({ error: 'Origine refusée' }, 403);
  if (!process.env.STRIPE_SECRET_KEY) return json({ error: "L'abonnement n'est pas encore ouvert." }, 503);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: 'Connexion requise' }, 401);

  const { data: sub } = await supabase.from('subscriptions').select('stripe_customer_id').maybeSingle();
  if (!sub?.stripe_customer_id) return json({ error: 'Aucun abonnement sur ce compte.' }, 404);

  try {
    const session = await stripeClient().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${returnOrigin(request.headers.get('origin'), siteUrl())}/tableau-de-bord/compte`,
      locale: 'fr',
    });
    return json({ url: session.url });
  } catch (e) {
    console.error('Stripe (espace client)', e.type, e.message);
    return json({ error: "L'espace de gestion est indisponible pour le moment. Réessayez dans quelques minutes." }, 502);
  }
}
