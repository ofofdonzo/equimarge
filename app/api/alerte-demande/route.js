import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { poleOf } from '@/components/offers';

// Alerte e-mail immédiate à chaque nouvelle demande, même quand le poste de travail est fermé.
// Appelée par un « Database Webhook » Supabase (insertion dans diagnostic_requests), voir le README.
// Variables Netlify : WEBHOOK_SECRET, RESEND_API_KEY, ALERT_EMAIL (et ALERT_FROM, facultatif).
export const dynamic = 'force-dynamic';

function sameSecret(a, b) {
  const x = Buffer.from(a || '');
  const y = Buffer.from(b || '');
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}

const oneLine = (s, max = 120) => String(s ?? '').replace(/[\r\n]+/g, ' ').slice(0, max);

export async function POST(request) {
  const { WEBHOOK_SECRET, RESEND_API_KEY, ALERT_EMAIL, ALERT_FROM, SITE_URL } = process.env;
  if (!WEBHOOK_SECRET || !RESEND_API_KEY || !ALERT_EMAIL) {
    return NextResponse.json({ error: 'Alerte non configurée' }, { status: 503 });
  }
  if (!sameSecret(request.headers.get('x-webhook-secret'), WEBHOOK_SECRET)) {
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

  const site = (SITE_URL || new URL(request.url).origin).replace(/\/+$/, '');
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
    `Ouvrir le poste de travail : ${site}/admin`,
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

  if (!res.ok) {
    console.error('Alerte e-mail non envoyée', res.status, await res.text());
    return NextResponse.json({ error: 'Envoi impossible' }, { status: 502 });
  }
  return NextResponse.json({ sent: true });
}
