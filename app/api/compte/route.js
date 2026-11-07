import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/config';
import { bearerToken, corsHeaders, originAllowed } from '@/lib/app-origin.mjs';
import { isOpen } from '@/lib/abonnement.mjs';
import { stripeClient } from '@/lib/stripe';

// Suppression du compte par son titulaire, depuis le site (cookie de session) ou l'application
// (en-tête Authorization). Exigée par l'App Store (règle 5.1.1 v) et par le RGPD (droit à l'effacement).
// Effacés : le compte, ses appareils, ses outils de marge, ses recettes et factures lues (effacement en cascade
// par la base), son auto-diagnostic s'il n'y a pas eu de mission. Un abonnement Recettes Pro en cours est résilié
// chez Stripe avant l'effacement, pour qu'aucun prélèvement ne suive (variable STRIPE_SECRET_KEY).
// Conservés, détachés du compte : le dossier d'une mission et ses documents (obligations contractuelles
// et comptables), comme l'explique la politique de confidentialité.
// Variable Netlify : SUPABASE_SERVICE_ROLE_KEY.
export const dynamic = 'force-dynamic';

const json = (body, status, origin) => NextResponse.json(body, { status, headers: corsHeaders(origin) });

export function OPTIONS(request) {
  const origin = request.headers.get('origin');
  const headers = corsHeaders(origin);
  return new Response(null, { status: Object.keys(headers).length ? 204 : 403, headers });
}

async function currentUser(request) {
  const token = bearerToken(request.headers.get('authorization'));
  if (token) {
    const anon = createAdminClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await anon.auth.getUser(token);
    return data?.user || null;
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function DELETE(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!originAllowed(origin, host)) return json({ error: 'Origine refusée' }, 403, origin);

  const user = await currentUser(request);
  if (!user) return json({ error: 'Connexion requise' }, 401, origin);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return json({ error: 'Suppression indisponible pour le moment. Écrivez à contact@equimarge.fr.' }, 503, origin);

  const db = createAdminClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: admin } = await db.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (admin) return json({ error: 'Le compte administrateur ne se supprime pas depuis cet écran.' }, 409, origin);

  // Abonnement encore ouvert chez Stripe : résilié tout de suite, sinon le compte n'est pas supprimé
  const { data: sub } = await db.from('subscriptions').select('stripe_subscription_id,status').eq('user_id', user.id).maybeSingle();
  if (isOpen(sub)) {
    if (!process.env.STRIPE_SECRET_KEY) {
      return json({ error: 'Votre abonnement doit être résilié avant la suppression du compte. Écrivez à contact@equimarge.fr.' }, 409, origin);
    }
    try {
      await stripeClient().subscriptions.cancel(sub.stripe_subscription_id);
    } catch (e) {
      if (e.code !== 'resource_missing') {
        console.error('Résiliation Stripe', e.type, e.message);
        return json({ error: "Résiliation de l'abonnement impossible pour le moment. Réessayez." }, 502, origin);
      }
    }
  }

  // Auto-diagnostic sans mission : effacé avec ses éventuels fichiers
  const { data: own } = await db.from('dossiers').select('id').eq('client_id', user.id).eq('status', 'Auto-diagnostic');
  const ids = (own || []).map((d) => d.id);
  if (ids.length) {
    const { data: docs } = await db.from('dossier_documents').select('path').in('dossier_id', ids);
    if (docs?.length) await db.storage.from('dossiers').remove(docs.map((d) => d.path));
    const { error } = await db.from('dossiers').delete().in('id', ids);
    if (error) {
      console.error('Suppression du dossier', error.message);
      return json({ error: 'Suppression impossible pour le moment. Réessayez.' }, 502, origin);
    }
  }

  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('Suppression du compte', error.message);
    return json({ error: 'Suppression impossible pour le moment. Réessayez.' }, 502, origin);
  }

  // Côté site : la session n'existe plus, on efface aussi ses cookies
  const res = json({ ok: true }, 200, origin);
  for (const c of request.cookies.getAll()) {
    if (c.name.startsWith('sb-')) res.cookies.set(c.name, '', { path: '/', maxAge: 0 });
  }
  return res;
}
