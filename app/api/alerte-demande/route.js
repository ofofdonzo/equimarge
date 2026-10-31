import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { poleOf } from '@/components/offers';
import { SUPABASE_URL } from '@/lib/supabase/config';
import { VAPID_PUBLIC_KEY } from '@/lib/push';

// Alerte immédiate à chaque nouvelle demande, même quand le poste de travail est fermé.
// Appelée par la base Supabase (déclencheur « alerte_nouvelle_demande », voir schema.sql et le README).
// Variables Netlify :
//   WEBHOOK_SECRET (obligatoire)
//   Notifications : VAPID_PRIVATE_KEY + SUPABASE_SERVICE_ROLE_KEY
//   E-mail (facultatif) : RESEND_API_KEY + ALERT_EMAIL (+ ALERT_FROM)
export const dynamic = 'force-dynamic';

function sameSecret(a, b) {
  const x = Buffer.from(a || '');
  const y = Buffer.from(b || '');
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}

const oneLine = (s, max = 120) => String(s ?? '').replace(/[\r\n]+/g, ' ').slice(0, max);

async function sendPush(r, env) {
  const { VAPID_PRIVATE_KEY, SUPABASE_SERVICE_ROLE_KEY, VAPID_SUBJECT } = env;
  if (!VAPID_PRIVATE_KEY || !SUPABASE_SERVICE_ROLE_KEY) return 'non configuré';

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: subs, error } = await db.from('push_subscriptions').select('endpoint, p256dh, auth');
  if (error) throw new Error('lecture des appareils : ' + error.message);
  if (!subs?.length) return 'aucun appareil abonné';

  webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:contact@equimarge.fr', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const payload = JSON.stringify({
    id: String(r.id || ''),
    title: `Nouvelle demande : ${oneLine(r.company, 80)}`,
    body: `${poleOf(r.offer)} · ${oneLine(r.contact_name, 80)}${r.message ? ' — ' + oneLine(r.message, 120) : ''}`,
  });

  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
          TTL: 60 * 60 * 24,
          urgency: 'high',
        });
        sent += 1;
      } catch (e) {
        // Appareil désabonné ou appli supprimée : on l'oublie.
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await db.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
        } else {
          console.error('Notification non envoyée', e?.statusCode, e?.body || e?.message);
        }
      }
    })
  );
  return `${sent}/${subs.length} appareil(s)`;
}

async function sendEmail(r, env, site) {
  const { RESEND_API_KEY, ALERT_EMAIL, ALERT_FROM } = env;
  if (!RESEND_API_KEY || !ALERT_EMAIL) return 'non configuré';

  const text = [
    `Nouvelle demande sur le site — pôle ${poleOf(r.offer)}`,
    '',
    `Entreprise : ${oneLine(r.company, 200)}`,
    `Demande : ${oneLine(r.offer)}${r.topics?.length ? ' — ' + oneLine(r.topics.join(', '), 500) : ''}`,
    `Contact : ${oneLine(r.contact_name, 200)} <${oneLine(r.email, 320)}>${r.phone ? ' · ' + oneLine(r.phone, 40) : ''}`,
    r.availability ? `Disponibilités : ${oneLine(r.availability, 200)}` : null,
    '',
    r.message ? `Message :\n${String(r.message).slice(0, 4000)}` : 'Pas de message.',
    '',
    `Ouvrir le poste de travail : ${site}/admin?demande=${encodeURIComponent(String(r.id || ''))}`,
  ].filter((l) => l !== null).join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: ALERT_FROM || 'Equimarge <onboarding@resend.dev>',
      to: [ALERT_EMAIL],
      reply_to: oneLine(r.email, 320),
      subject: `Nouvelle demande : ${oneLine(r.company, 80)} (${oneLine(r.offer, 40)})`,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status} ${await res.text()}`);
  return 'envoyé';
}

export async function POST(request) {
  const env = process.env;
  if (!env.WEBHOOK_SECRET) return NextResponse.json({ error: 'Alerte non configurée' }, { status: 503 });
  if (!sameSecret(request.headers.get('x-webhook-secret'), env.WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
  const r = payload?.record;
  if (payload?.type !== 'INSERT' || payload?.table !== 'diagnostic_requests' || !r) {
    return NextResponse.json({ ignored: true });
  }

  const site = (env.SITE_URL || new URL(request.url).origin).replace(/\/+$/, '');
  const [push, email] = await Promise.allSettled([sendPush(r, env), sendEmail(r, env, site)]);
  const result = {
    notification: push.status === 'fulfilled' ? push.value : 'échec',
    email: email.status === 'fulfilled' ? email.value : 'échec',
  };
  if (push.status === 'rejected') console.error('Notification', push.reason);
  if (email.status === 'rejected') console.error('E-mail', email.reason);

  const failed = push.status === 'rejected' && email.status === 'rejected';
  return NextResponse.json(result, { status: failed ? 502 : 200 });
}
