import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

// Notifications de l'application. La permission n'est demandée que sur action de l'utilisateur
// (bouton « Activer les notifications ») ; l'appli fonctionne entièrement sans.
const TABS = new Set(['bord', 'infos', 'documents', 'messages']);
const TOKEN_KEY = 'equimarge-device';
let openHandler = () => {};
let listening = false;

export const pushAvailable = () => Capacitor.isNativePlatform();

export async function pushPermission() {
  if (!pushAvailable()) return 'unavailable';
  const { receive } = await PushNotifications.checkPermissions();
  return receive; // granted | denied | prompt | prompt-with-rationale
}

// ask : demander la permission si elle n'a pas encore été donnée. onOpen(tab) : notification touchée.
export async function enablePush(supabase, onOpen, { ask = false } = {}) {
  if (!pushAvailable()) return 'unavailable';
  openHandler = onOpen;
  let { receive } = await PushNotifications.checkPermissions();
  if (receive !== 'granted' && ask) ({ receive } = await PushNotifications.requestPermissions());
  if (receive !== 'granted') return receive;
  if (!listening) {
    listening = true;
    await PushNotifications.addListener('registration', async ({ value }) => {
      const { error } = await supabase.rpc('register_device', { t: value, p: Capacitor.getPlatform() });
      if (!error) {
        try {
          localStorage.setItem(TOKEN_KEY, value);
        } catch {
          /* stockage indisponible : l'appareil reste enregistré côté base */
        }
      }
    });
    await PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
      const tab = notification?.data?.tab;
      if (TABS.has(tab)) openHandler(tab);
    });
  }
  await PushNotifications.register();
  return 'granted';
}

// Déconnexion ou désactivation : l'appareil n'est plus rattaché au compte.
export async function disablePush(supabase) {
  if (!pushAvailable()) return;
  let token = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    token = null;
  }
  if (token) await supabase.from('device_tokens').delete().eq('token', token);
  await PushNotifications.unregister().catch(() => {});
}
