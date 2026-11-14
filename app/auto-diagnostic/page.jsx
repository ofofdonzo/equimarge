import Link from 'next/link';
import { Check } from '@/components/icons';
import { DOMAINS, QUESTIONS } from '@/lib/conformite.mjs';

export const metadata = {
  title: 'Auto-diagnostic de conformité gratuit | Equimarge',
  description:
    'Un questionnaire en ligne pour mesurer où en est votre entreprise sur le RGPD, l’IA, l’anti-blanchiment et vos autres obligations. Score par domaine et liste des actions à mener. Gratuit.',
  alternates: { canonical: '/auto-diagnostic' },
};

const START = '/connexion?mode=inscription&suite=/tableau-de-bord/conformite';

const STEPS = [
  { n: '1', title: 'Créez votre espace', text: 'Une adresse e-mail et un mot de passe suffisent. Vous confirmez l’adresse par le lien reçu.' },
  { n: '2', title: 'Répondez aux questions', text: 'Oui, en partie, non ou non concerné. Vos réponses sont enregistrées : vous pouvez vous arrêter et reprendre plus tard.' },
  { n: '3', title: 'Lisez le résultat', text: 'Un score par domaine et, pour chaque réponse « non » ou « en partie », l’action à mener.' },
];

export default function Page() {
  const count = (key) => QUESTIONS.filter((q) => q.domain === key).length;
  return (
    <div className="stack" style={{ gap: 72 }}>
      <section className="page-hero">
        <h1>Auto-diagnostic gratuit</h1>
        <p className="lead">
          {QUESTIONS.length} questions pour savoir où en est votre entreprise. Le questionnaire se remplit en ligne,
          dans votre espace client. Il est gratuit et ne vous engage à rien.
        </p>
        <div className="row">
          <Link href={START} className="btn lg">Commencer l’auto-diagnostic</Link>
          <Link href="/connexion?suite=/tableau-de-bord/conformite" className="btn ghost lg">J’ai déjà un compte</Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Comment ça marche</h2>
        </div>
        <ol className="steps4">
          {STEPS.map(({ n, title, text }) => (
            <li key={n} className="feature">
              <span className="num" aria-hidden="true">{n}</span>
              <h3>{title}</h3>
              <p className="note">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Les domaines couverts</h2>
          <p>Répondez « non concerné » quand une question ne s’applique pas à votre activité : elle ne compte pas dans le score.</p>
        </div>
        <ul className="checks" style={{ marginTop: 0, fontSize: '1rem' }}>
          {DOMAINS.map((d) => (
            <li key={d.key}><Check size={16} />{d.label} ({count(d.key)} questions)</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Ce que vous en faites</h2>
        </div>
        <div className="about">
          <p>
            Le résultat reste dans votre espace. Vous pouvez mener les actions vous-même, ou nous demander un devis pour
            qu’Equimarge les réalise. Si vous faites la demande de devis depuis votre compte, la mission reprend votre
            dossier et vos réponses.
          </p>
          <p className="note">
            L’auto-diagnostic donne une première mesure. Il ne remplace pas l’état des lieux mené pendant une mission.
          </p>
        </div>
      </section>

      <section className="band">
        <div>
          <h2>Commencer</h2>
          <p>Créez votre espace et répondez aux premières questions.</p>
        </div>
        <Link href={START} className="btn lg">Commencer l’auto-diagnostic</Link>
      </section>
    </div>
  );
}
