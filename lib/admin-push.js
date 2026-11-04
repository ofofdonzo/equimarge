import webpush from 'web-push';
import { VAPID_PUBLIC_KEY } from '@/lib/push';

// Notification vers les appareils abonnés du poste de travail (administrateur).
// db : client Supabase « service_role » (lecture des abonnements, nettoyage des abonnements expirés).
export async function sendAdminPush(db, env, { title, body, url }) {
  const { VAPID_PRIVATE_KEY, VAPID_SUBJECT } = env;
  if (!VAPID_PRIVATE_KEY) return 'non configuré';
  const { data: subs, error } = await db.from('push_subscriptions').select('endpoint, p256dh, auth');
  if (error) throw new Error('lecture des appareils : ' + error.message);
  if (!subs?.length) return 'aucun appareil abonné';

  webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:contact@equimarge.fr', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const payload = JSON.stringify({ title, body, url });
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
