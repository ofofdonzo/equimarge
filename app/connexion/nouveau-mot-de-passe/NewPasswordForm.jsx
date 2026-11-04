'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Arrivée depuis le lien « mot de passe oublié » : la session de récupération vient d'être ouverte
// par /auth/callback ; on y choisit le nouveau mot de passe.
export default function NewPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setReady(Boolean(data.user)));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    if (password !== confirm) return setError('Les deux mots de passe ne sont pas identiques.');
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      return setError(
        error.code === 'same_password'
          ? 'Choisissez un mot de passe différent de l’ancien.'
          : error.code === 'weak_password'
            ? 'Ce mot de passe est trop faible ou connu des pirates : choisissez-en un autre.'
            : 'Le mot de passe n’a pas pu être changé. Recommencez depuis la page de connexion.'
      );
    }
    router.push('/tableau-de-bord/conformite');
    router.refresh();
  }

  if (ready === null) return <p className="note">Un instant…</p>;
  if (!ready) {
    return (
      <div className="panel stack">
        <h1>Lien expiré</h1>
        <p className="note">Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau depuis la page de connexion.</p>
        <Link className="btn" href="/connexion">Revenir à la connexion</Link>
      </div>
    );
  }
  return (
    <form className="panel auth-card stack" onSubmit={submit} noValidate>
      <h1 style={{ margin: 0 }}>Nouveau mot de passe</h1>
      <div className="field">
        <label htmlFor="np">Nouveau mot de passe (8 caractères minimum)</label>
        <input id="np" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="np2">Confirmez le mot de passe</label>
        <input id="np2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn lg block" type="submit" disabled={busy}>{busy ? 'Un instant…' : 'Enregistrer'}</button>
    </form>
  );
}
