'use client';
import { useCallback, useEffect, useState } from 'react';
import { VAPID_PUBLIC_KEY } from '@/lib/push';
import { Bell } from '@/components/icons';

// Bouton « Activer les alertes » du poste de travail.
// Il installe le service worker, demande l'autorisation et enregistre l'abonnement dans Supabase :
// le serveur peut alors envoyer une notification à chaque nouvelle demande, même appli fermée.

function keyToBytes(base64url) {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob((base64url + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function environment() {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  return { ios, standalone, supported };
}

async function saveSubscription(supabase, sub) {
  const json = sub.toJSON();
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      device: navigator.userAgent.slice(0, 300),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' }
  );
  return error;
}

// Notification locale (sans serveur), utilisée par le poste de travail quand la page est ouverte en arrière-plan.
export async function showLocalNotification(title, body, id) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const reg = await navigator.serviceWorker?.getRegistration();
    const options = { body, icon: '/icon-192.png', tag: id || 'equimarge', data: { url: id ? `/admin?demande=${id}` : '/admin' } };
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
  } catch {
    // Notifications indisponibles : le son et l'affichage dans la page suffisent.
  }
}

export default function Alerts({ supabase }) {
  const [state, setState] = useState('loading'); // loading | ios-install | unsupported | off | on | denied | busy
  const [err, setErr] = useState('');
  const [help, setHelp] = useState(false);

  const refresh = useCallback(async () => {
    const env = environment();
    if (!env.supported) return setState(env.ios && !env.standalone ? 'ios-install' : 'unsupported');
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      if (Notification.permission === 'denied') return setState('denied');
      const sub = await reg.pushManager.getSubscription();
      if (sub && Notification.permission === 'granted') {
        setState('on');
        // On réenregistre à chaque visite : l'abonnement peut changer sans prévenir.
        const e = await saveSubscription(supabase, sub);
        if (e) setErr('Abonnement non enregistré : ' + e.message);
      } else setState('off');
    } catch (e) {
      setState('unsupported');
      setErr('Service des notifications indisponible : ' + (e?.message || e));
    }
  }, [supabase]);

  useEffect(() => { refresh(); }, [refresh]);

  async function enable() {
    setErr('');
    setState('busy');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return setState(permission === 'denied' ? 'denied' : 'off');
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(VAPID_PUBLIC_KEY) }));
      const e = await saveSubscription(supabase, sub);
      if (e) {
        setState('on');
        return setErr(
          e.message.includes('push_subscriptions')
            ? 'Alertes activées sur cet appareil, mais pas encore côté serveur : exécutez supabase/schema.sql dans Supabase.'
            : 'Abonnement non enregistré : ' + e.message
        );
      }
      setState('on');
      await showLocalNotification('Alertes activées', 'Vous serez prévenu à chaque nouvelle demande.', 'equimarge-test');
    } catch (e) {
      setState('off');
      setErr('Activation impossible : ' + (e?.message || e));
    }
  }

  async function test() {
    await showLocalNotification('Test — Equimarge', 'Les notifications fonctionnent sur cet appareil.', 'equimarge-test');
  }

  return (
    <>
      {state === 'on' ? (
        <span className="row" style={{ gap: 8 }}>
          <span className="live on">Alertes activées</span>
          <button type="button" className="btn ghost sm" onClick={test}>Tester</button>
        </span>
      ) : state === 'off' || state === 'busy' ? (
        <button type="button" className="btn ghost sm" onClick={enable} disabled={state === 'busy'}>
          <Bell size={16} /> {state === 'busy' ? 'Activation…' : 'Activer les alertes'}
        </button>
      ) : state === 'ios-install' || state === 'unsupported' || state === 'denied' ? (
        <button type="button" className="btn ghost sm" onClick={() => setHelp((h) => !h)} aria-expanded={help}>
          <Bell size={16} /> Activer les alertes
        </button>
      ) : null}

      {(help || err) && (
        <div className="alert-help" role="status">
          {err && <p className="err" style={{ margin: 0 }}>{err}</p>}
          {help && state === 'ios-install' && (
            <ol>
              <li>Ouvrez cette page dans <b>Safari</b> (pas dans une autre appli).</li>
              <li>Touchez <b>Partager</b> (le carré avec une flèche), puis <b>Sur l'écran d'accueil</b>, puis <b>Ajouter</b>.</li>
              <li>Ouvrez <b>Equimarge</b> depuis l'icône de votre écran d'accueil et touchez à nouveau <b>Activer les alertes</b>.</li>
            </ol>
          )}
          {help && state === 'denied' && (
            <p className="note" style={{ margin: 0 }}>
              Les notifications ont été refusées pour ce site. Sur iPhone : Réglages &gt; Notifications &gt; Equimarge.
              Sur ordinateur : l'icône à gauche de l'adresse &gt; Notifications &gt; Autoriser. Rechargez ensuite la page.
            </p>
          )}
          {help && state === 'unsupported' && (
            <p className="note" style={{ margin: 0 }}>
              Ce navigateur n'affiche pas les notifications. Utilisez Safari sur iPhone (après l'ajout à l'écran d'accueil),
              ou Chrome, Edge, Firefox ou Safari sur ordinateur.
            </p>
          )}
        </div>
      )}
    </>
  );
}
