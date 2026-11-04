import { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { LogoMark } from '@/components/icons';
import { createClient } from './supabase';
import { enablePush } from './push';
import Login from './Login';
import Dossier from './Dossier';
import Account from './Account';
import Workspace from '@/app/tableau-de-bord/conformite/Workspace';
import { demoData } from './demo';

/* global __DEMO__ */

function EquimargeApp() {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState(undefined);
  const [screen, setScreen] = useState('dossier');
  const [requestedTab, setRequestedTab] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState('');
  const [online, setOnline] = useState(() => navigator.onLine);

  const openTab = useCallback((tab) => {
    setScreen('dossier');
    setRequestedTab({ tab });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s || null));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (session !== undefined) SplashScreen.hide().catch(() => {});
  }, [session]);

  // Retour dans l'appli : session prolongée et dossier rechargé ; en arrière-plan, plus de rafraîchissement
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    const handle = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        supabase.auth.startAutoRefresh();
        setReloadKey((k) => k + 1);
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => {
      handle.then((h) => h.remove());
    };
  }, [supabase]);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  // Notifications déjà autorisées : l'appareil est rattaché au compte, sans nouvelle demande de permission
  const userId = session?.user?.id;
  useEffect(() => {
    if (userId) enablePush(supabase, openTab).catch(() => {});
  }, [userId, supabase, openTab]);

  if (session === undefined) return <p className="note app-center">Chargement…</p>;

  const offline = !online && <p className="app-offline" role="status">Pas de connexion internet : vos modifications ne sont pas enregistrées.</p>;

  if (!session) {
    return (
      <main className="app-main">
        {offline}
        {notice && <p className="panel success" role="status">{notice}</p>}
        <Login supabase={supabase} />
      </main>
    );
  }

  return (
    <>
      <header className="app-header">
        <span className="brand">
          <LogoMark id="logo-app" size={28} />
          <span className="brand-name">Equi<span>marge</span></span>
        </span>
        {screen === 'account' ? (
          <button type="button" className="btn ghost sm" onClick={() => setScreen('dossier')}>Mon dossier</button>
        ) : (
          <button type="button" className="app-avatar" aria-label="Mon compte" onClick={() => setScreen('account')}>
            {(session.user.email || '?').slice(0, 1).toUpperCase()}
          </button>
        )}
      </header>
      <main className={'app-main' + (screen === 'dossier' ? ' with-tabbar' : '')}>
        {offline}
        {screen === 'account' ? (
          <Account
            supabase={supabase}
            session={session}
            onOpenTab={openTab}
            onSignedOut={(message) => {
              setScreen('dossier');
              setNotice(message || '');
            }}
          />
        ) : (
          <Dossier supabase={supabase} requestedTab={requestedTab} reloadKey={reloadKey} onAccount={() => setScreen('account')} />
        )}
      </main>
    </>
  );
}

// Démonstration hors ligne pour les captures d'écran (jamais dans l'application publiée)
function DemoApp() {
  const { email: DEMO_EMAIL, dossier: DEMO_DOSSIER, initial: DEMO_INITIAL } = useMemo(() => demoData(), []);
  const [screen, setScreen] = useState(new URLSearchParams(location.search).get('ecran') || 'dossier');
  const tab = new URLSearchParams(location.search).get('onglet');
  const requestedTab = useMemo(() => (tab ? { tab } : null), [tab]);
  return (
    <>
      <header className="app-header">
        <span className="brand">
          <LogoMark id="logo-app" size={28} />
          <span className="brand-name">Equi<span>marge</span></span>
        </span>
        <button type="button" className="app-avatar" aria-label="Mon compte" onClick={() => setScreen('account')}>B</button>
      </header>
      <main className={'app-main' + (screen === 'dossier' ? ' with-tabbar' : '')}>
        {screen === 'account' ? (
          <Account supabase={null} session={{ user: { email: DEMO_EMAIL } }} onOpenTab={() => setScreen('dossier')} onSignedOut={() => {}} />
        ) : (
          <div className="stack">
            <div>
              <span className="eyebrow">Mon dossier · {DEMO_DOSSIER.status}</span>
              <h1 style={{ margin: '4px 0 0' }}>{DEMO_DOSSIER.company}</h1>
              <p className="note" style={{ margin: '2px 0 0' }}>Votre mission : {DEMO_DOSSIER.offer}</p>
            </div>
            <Workspace role="client" dossier={DEMO_DOSSIER} initial={DEMO_INITIAL} offline app={{ onAccount: () => setScreen('account'), requestedTab, demo: true }} />
          </div>
        )}
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(__DEMO__ ? <DemoApp /> : <EquimargeApp />);
