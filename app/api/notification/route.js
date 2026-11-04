import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from '@/lib/supabase/config';
import { apnsConfig, sendApns } from '@/lib/apns.mjs';
import { adminMessage, CLIENT_EVENTS, parseEvent } from '@/lib/notify.mjs';
import { sendAdminPush } from '@/lib/admin-push';

// Notifications des dossiers : appelée par la base (fonction notifier_dossier, voir supabase/schema.sql)
// à chaque demande, livrable ou message d'Equimarge (vers l'iPhone du client) et à chaque réponse,
// document ou message du client (vers le poste de travail).
// Variables Netlify : WEBHOOK_SECRET et SUPABASE_SERVICE_ROLE_KEY (obligatoires) ;
// iPhone : APNS_KEY_ID, APNS_TEAM_ID, APNS_PRIVATE_KEY (voir lib/apns.mjs) ; poste de travail : VAPID_PRIVATE_KEY.
export const dynamic = 'force-dynamic';

function sameSecret(a, b) {
  const x = Buffer.from(a || '');
  const y = Buffer.from(b || '');
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}

async function notifyClient(db, env, dossier, event) {
  if (!dossier.client_id) return 'dossier sans compte client';
  const config = apnsConfig(env);
  if (!config) return 'non configuré';
  const { data: devices, error } = await db.from('device_tokens').select('token').eq('user_id', dossier.client_id).eq('platform', 'ios');
  if (error) throw new Error('lecture des appareils : ' + error.message);
  if (!devices?.length) return 'aucun appareil';
  const r = await sendApns(config, devices.map((d) => d.token), CLIENT_EVENTS[event]);
  if (r.invalid.length) await db.from('device_tokens').delete().in('token', r.invalid);
  if (r.errors.length) console.error('APNs', r.errors.join(', '));
  return `${r.sent}/${devices.length} appareil(s)`;
}

export async function POST(request) {
  const env = process.env;
  if (!env.WEBHOOK_SECRET) return NextResponse.json({ error: 'Notifications non configurées' }, { status: 503 });
  if (!sameSecret(request.headers.get('x-webhook-secret'), env.WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Notifications non configurées' }, { status: 503 });
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
  const evt = parseEvent(payload);
  if (!evt) return NextResponse.json({ ignored: true });

  const db = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: dossier, error } = await db.from('dossiers').select('id, company, client_id').eq('id', evt.dossierId).maybeSingle();
  if (error) {
    console.error('Dossier', error.message);
    return NextResponse.json({ error: 'Lecture impossible' }, { status: 502 });
  }
  if (!dossier) return NextResponse.json({ ignored: true });

  try {
    const result =
      evt.audience === 'client'
        ? await notifyClient(db, env, dossier, evt.event)
        : await sendAdminPush(db, env, adminMessage(evt.event, dossier));
    return NextResponse.json({ notification: result });
  } catch (e) {
    console.error('Notification', e);
    return NextResponse.json({ notification: 'échec' }, { status: 502 });
  }
}
