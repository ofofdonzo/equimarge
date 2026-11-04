import { useEffect, useState } from 'react';
import DeletionNotice, { DELETE_WORD } from '@/components/DeletionNotice';
import { SITE } from './config';
import { openUrl } from './platform';
import { disablePush, enablePush, pushAvailable, pushPermission } from './push';

const LINKS = [
  ['Politique de confidentialité', '/confidentialite'],
  ['Conditions générales', '/conditions-generales'],
  ['Mentions légales', '/mentions-legales'],
];

export default function Account({ supabase, session, onOpenTab, onSignedOut }) {
  const [push, setPush] = useState('…');
  const [confirming, setConfirming] = useState(false);
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    pushPermission().then(setPush).catch(() => setPush('unavailable'));
  }, []);

  async function activate() {
    setPush(await enablePush(supabase, onOpenTab, { ask: true }));
  }

  async function signOut() {
    setBusy(true);
    await disablePush(supabase).catch(() => {});
    await supabase.auth.signOut();
    onSignedOut();
  }

  async function remove(e) {
    e.preventDefault();
    if (word.trim().toUpperCase() !== DELETE_WORD) return;
    setBusy(true);
    setError('');
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    let res = null;
    try {
      res = await fetch(`${SITE}/api/compte`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    } catch {
      res = null;
    }
    if (!res?.ok) {
      const body = res ? await res.json().catch(() => ({})) : {};
      setBusy(false);
      return setError(body.error || 'Suppression impossible : vérifiez votre connexion internet et réessayez.');
    }
    await disablePush(supabase).catch(() => {});
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    onSignedOut('Votre compte a été supprimé.');
  }

  return (
    <div className="stack">
      <h1 style={{ margin: 0 }}>Mon compte</h1>

      <section className="panel">
        <h2>Connexion</h2>
        <p style={{ marginTop: 0, overflowWrap: 'anywhere' }}>Connecté avec <b>{session.user.email}</b></p>
        <button type="button" className="btn ghost block" onClick={signOut} disabled={busy}>Se déconnecter</button>
      </section>

      {pushAvailable() && (
        <section className="panel">
          <h2>Notifications</h2>
          {push === 'granted' ? (
            <p className="note" style={{ margin: 0 }}>
              Activées : vous êtes prévenu d’une nouvelle demande, d’un livrable ou d’un message. Pour les couper, ouvrez
              Réglages &gt; Notifications &gt; Equimarge.
            </p>
          ) : push === 'denied' ? (
            <p className="note" style={{ margin: 0 }}>Désactivées. Pour les activer, ouvrez Réglages &gt; Notifications &gt; Equimarge.</p>
          ) : (
            <>
              <p className="note" style={{ marginTop: 0 }}>Soyez prévenu quand Equimarge vous envoie une demande, un livrable ou un message.</p>
              <button type="button" className="btn block" onClick={activate}>Activer les notifications</button>
            </>
          )}
        </section>
      )}

      <section className="panel">
        <h2>Informations</h2>
        <div className="stack" style={{ gap: 4 }}>
          {LINKS.map(([label, path]) => (
            <button key={path} type="button" className="app-row" onClick={() => openUrl(SITE + path)}>
              {label}
            </button>
          ))}
          <a className="app-row" href="mailto:contact@equimarge.fr">Écrire à contact@equimarge.fr</a>
        </div>
      </section>

      <section className="panel">
        <h2>Supprimer mon compte</h2>
        <DeletionNotice />
        {!confirming ? (
          <button type="button" className="btn ghost danger block" style={{ marginTop: 14 }} onClick={() => setConfirming(true)}>
            Supprimer mon compte…
          </button>
        ) : (
          <form className="stack" style={{ gap: 10, marginTop: 14 }} onSubmit={remove}>
            <div className="field">
              <label htmlFor="confirm-delete">Pour confirmer, écrivez {DELETE_WORD}</label>
              <input id="confirm-delete" autoComplete="off" autoCapitalize="characters" value={word} onChange={(e) => setWord(e.target.value)} />
            </div>
            {error && <p className="err" role="alert">{error}</p>}
            <button type="submit" className="btn danger block" disabled={busy || word.trim().toUpperCase() !== DELETE_WORD}>
              {busy ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
            <button type="button" className="btn ghost block" onClick={() => { setConfirming(false); setWord(''); setError(''); }}>Annuler</button>
          </form>
        )}
      </section>
    </div>
  );
}
