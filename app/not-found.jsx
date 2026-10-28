import Link from 'next/link';
import { ArrowRight, BarChart, Shield } from '@/components/icons';

export const metadata = { title: 'Page introuvable — Equimarge', robots: { index: false } };

// Page affichée pour toute adresse qui n'existe pas (erreur 404)
export default function NotFound() {
  return (
    <section className="notfound rise">
      <p className="notfound-code grad-text" aria-hidden="true">404</p>
      <h1>Page introuvable</h1>
      <p className="lead">
        La page que vous cherchez n'existe pas ou a été déplacée. Vérifiez l'adresse, ou repartez de l'un de ces liens.
      </p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <Link href="/" className="btn lg">
          Retour à l'accueil <ArrowRight size={18} />
        </Link>
      </div>
      <div className="notfound-links">
        <Link href="/#marges" className="notfound-link">
          <span className="topic-icon"><BarChart size={20} /></span>
          <span><b>Pôle marges</b><small>Outil gratuit et diagnostic</small></span>
        </Link>
        <Link href="/conformite" className="notfound-link">
          <span className="topic-icon"><Shield size={20} /></span>
          <span><b>Pôle conformité</b><small>Audit et accompagnement</small></span>
        </Link>
      </div>
      <p className="note">
        Un lien cassé sur notre site ? Signalez-le à <a href="mailto:contact@equimarge.fr">contact@equimarge.fr</a>.
      </p>
    </section>
  );
}
