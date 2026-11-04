import { useState } from 'react';
import { LogoMark } from '@/components/icons';
import { SITE } from './config';
import { openUrl } from './platform';

const MESSAGES = {
  'Invalid login credentials': 'E-mail ou mot de passe incorrect.',
  'Email not confirmed': 'Votre e-mail n’est pas encore confirmé : ouvrez le lien reçu par e-mail.',
  'User already registered': 'Un compte existe déjà avec cet e-mail. Connectez-vous.',
};
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function Login({ supabase }) {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!EMAIL.test(email)) return setError('Saisissez une adresse e-mail valide.');
    if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    setBusy(true);
    if (signup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Le lien de confirmation s'ouvre dans Safari ; la page du site invite à revenir dans l'appli.
        options: { emailRedirectTo: `${SITE}/connexion/confirme` },
      });
      setBusy(false);
      if (error) return setError(MESSAGES[error.message] || 'Inscription impossible pour le moment. Réessayez.');
      if (!data.session) {
        setSignup(false);
        setPassword('');
        setInfo(`Compte créé. Ouvrez le lien de confirmation envoyé à ${email}, puis revenez ici pour vous connecter.`);
      }
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(MESSAGES[error.message] || 'Connexion impossible. Vérifiez votre connexion internet.');
  }

  return (
    <div className="app-login">
      <div className="app-login-brand">
        <LogoMark id="logo-login" size={56} />
        <h1>Equimarge</h1>
        <p className="note">Votre dossier de conformité, suivi avec votre consultant.</p>
      </div>
      <form className="panel stack" onSubmit={submit} noValidate>
        <div className="segmented" role="group" aria-label="Type d’accès">
          <button type="button" aria-pressed={!signup} onClick={() => { setSignup(false); setError(''); }}>Se connecter</button>
          <button type="button" aria-pressed={signup} onClick={() => { setSignup(true); setError(''); setInfo(''); }}>Créer un compte</button>
        </div>
        <div className="field">
          <label htmlFor="email">E-mail professionnel</label>
          <input id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value.trim())} />
        </div>
        <div className="field">
          <label htmlFor="password">Mot de passe (8 caractères minimum)</label>
          <input id="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        {info && <p className="panel success" role="status" style={{ margin: 0 }}>{info}</p>}
        <button className="btn lg block" type="submit" disabled={busy}>
          {busy ? 'Un instant…' : signup ? 'Créer mon compte' : 'Se connecter'}
        </button>
        {signup ? (
          <p className="note" style={{ margin: 0 }}>
            Compte réservé aux professionnels. En le créant, vous acceptez les{' '}
            <a href={`${SITE}/conditions-generales`} onClick={(e) => { e.preventDefault(); openUrl(`${SITE}/conditions-generales`); }}>conditions générales</a>{' '}
            et la{' '}
            <a href={`${SITE}/confidentialite`} onClick={(e) => { e.preventDefault(); openUrl(`${SITE}/confidentialite`); }}>politique de confidentialité</a>.
          </p>
        ) : (
          <button type="button" className="link-btn" style={{ alignSelf: 'center' }} onClick={() => openUrl(`${SITE}/connexion`)}>
            Mot de passe oublié ? (s’ouvre sur le site)
          </button>
        )}
      </form>
    </div>
  );
}
