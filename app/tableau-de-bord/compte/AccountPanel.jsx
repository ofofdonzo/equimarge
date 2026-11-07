'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DeletionNotice, { DELETE_WORD } from '@/components/DeletionNotice';


export default function AccountPanel({ email, isAdmin, subscribed }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function remove(e) {
    e.preventDefault();
    if (word.trim().toUpperCase() !== DELETE_WORD) return;
    setBusy(true);
    setError('');
    let res;
    try {
      res = await fetch('/api/compte', { method: 'DELETE' });
    } catch {
      res = null;
    }
    if (!res?.ok) {
      const body = res ? await res.json().catch(() => ({})) : {};
      setBusy(false);
      return setError(body.error || 'Suppression impossible : vérifiez votre connexion et réessayez.');
    }
    await createClient().auth.signOut({ scope: 'local' }).catch(() => {});
    router.replace('/');
    router.refresh();
  }

  return (
    <div className="stack">
      <section className="panel">
        <h2>Connexion</h2>
        <p style={{ marginTop: 0 }}>Connecté avec <b>{email}</b></p>
        <div className="row">
          <form action="/auth/deconnexion" method="post">
            <button type="submit" className="btn ghost">Se déconnecter</button>
          </form>
          <Link className="btn ghost" href="/confidentialite">Politique de confidentialité</Link>
        </div>
      </section>

      <section className="panel">
        <h2>Supprimer mon compte</h2>
        {isAdmin ? (
          <p className="note" style={{ margin: 0 }}>Le compte administrateur d’Equimarge ne se supprime pas depuis cette page.</p>
        ) : !open ? (
          <>
            <DeletionNotice />
            {subscribed && <p className="note" style={{ margin: '10px 0 0' }}>Votre abonnement Recettes Pro sera résilié immédiatement, sans autre prélèvement.</p>}
            <div className="row" style={{ marginTop: 14 }}>
              <button type="button" className="btn ghost danger" onClick={() => setOpen(true)}>Supprimer mon compte…</button>
            </div>
          </>
        ) : (
          <form className="stack" style={{ gap: 10 }} onSubmit={remove}>
            <DeletionNotice />
            {subscribed && <p className="note" style={{ margin: 0 }}>Votre abonnement Recettes Pro sera résilié immédiatement, sans autre prélèvement.</p>}
            <div className="field">
              <label htmlFor="confirm-delete">Pour confirmer, écrivez {DELETE_WORD}</label>
              <input id="confirm-delete" autoComplete="off" value={word} onChange={(e) => setWord(e.target.value)} />
            </div>
            {error && <p className="err" role="alert">{error}</p>}
            <div className="row">
              <button type="submit" className="btn danger" disabled={busy || word.trim().toUpperCase() !== DELETE_WORD}>
                {busy ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
              <button type="button" className="btn ghost" onClick={() => { setOpen(false); setWord(''); setError(''); }}>Annuler</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
