'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const MESSAGES = {
  'Invalid login credentials': 'E-mail ou mot de passe incorrect.',
  'Email not confirmed': "Votre e-mail n'est pas encore confirmé. Cliquez sur le lien reçu par e-mail.",
  'User already registered': 'Un compte existe déjà avec cet e-mail. Connectez-vous.',
};

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'inscription' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const next = params.get('suite') || '/tableau-de-bord';

  async function submit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setBusy(true);
    const supabase = createClient();
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?suite=${encodeURIComponent(next)}` },
      });
      setBusy(false);
      if (error) return setError(MESSAGES[error.message] || error.message);
      if (!data.session) {
        setInfo('Compte créé. Ouvrez le lien de confirmation envoyé à ' + email + ' pour accéder à votre espace.');
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(MESSAGES[error.message] || error.message);
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="stack" style={{ maxWidth: 440 }}>
      <div>
        <span className="eyebrow">{mode === 'signup' ? 'Inscription gratuite' : 'Connexion'}</span>
        <h1>{mode === 'signup' ? 'Créer votre espace' : 'Accéder à votre espace'}</h1>
        <p className="note">Vos chiffres restent privés : vous seul y avez accès.</p>
      </div>
      <form className="panel stack" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="email">E-mail professionnel</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe (8 caractères minimum)</label>
          <input
            id="password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        {info && <p className="panel success" role="status" style={{ margin: 0 }}>{info}</p>}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Un instant…' : mode === 'signup' ? 'Créer mon espace' : 'Se connecter'}
        </button>
      </form>
      <p className="note">
        {mode === 'signup' ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
        <button
          type="button"
          className="btn ghost"
          style={{ padding: '2px 8px' }}
          onClick={() => {
            setMode(mode === 'signup' ? 'login' : 'signup');
            setError('');
            setInfo('');
          }}
        >
          {mode === 'signup' ? 'Se connecter' : 'Créer un espace'}
        </button>
      </p>
    </div>
  );
}
