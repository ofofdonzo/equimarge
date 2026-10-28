'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Check, Lock } from '@/components/icons';

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
  // N'accepte qu'un chemin interne, pour éviter une redirection vers un autre site
  const suite = params.get('suite') || '';
  const next = suite.startsWith('/') && !suite.startsWith('//') && !suite.startsWith('/\\') ? suite : '/tableau-de-bord';

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

  const signup = mode === 'signup';
  function switchTo(m) {
    setMode(m);
    setError('');
    setInfo('');
  }

  return (
    <div className="auth">
      <div>
        <span className="eyebrow">{signup ? 'Inscription gratuite' : 'Connexion'}</span>
        <h1>{signup ? 'Créer votre espace' : 'Accéder à votre espace'}</h1>
        <p className="lead">Vos chiffres restent privés : vous seul y avez accès.</p>
        <ul className="benefits">
          <li>
            <span className="ic"><BarChart /></span>
            <div><b>La marge de chaque produit</b><span>Taux de marque, marge par ligne, alertes et seuil de rentabilité.</span></div>
          </li>
          <li>
            <span className="ic"><Lock /></span>
            <div><b>Des données protégées</b><span>Hébergées dans l'Union européenne, ni vendues ni cédées.</span></div>
          </li>
          <li>
            <span className="ic"><Check /></span>
            <div><b>Gratuit</b><span>Sans logiciel à installer.</span></div>
          </li>
        </ul>
      </div>
      <form className="panel auth-card stack" onSubmit={submit} noValidate>
        <div className="segmented" role="group" aria-label="Type d'accès">
          <button type="button" aria-pressed={!signup} onClick={() => switchTo('login')}>Se connecter</button>
          <button type="button" aria-pressed={signup} onClick={() => switchTo('signup')}>Créer un espace</button>
        </div>
        <div className="field">
          <label htmlFor="email">E-mail professionnel</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe (8 caractères minimum)</label>
          <input
            id="password"
            type="password"
            autoComplete={signup ? 'new-password' : 'current-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        {info && <p className="panel success" role="status" style={{ margin: 0 }}>{info}</p>}
        <button className="btn lg block" type="submit" disabled={busy}>
          {busy ? 'Un instant…' : signup ? 'Créer mon espace' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
