import Link from 'next/link';
import { OFFERS } from '@/components/offers';

export default function Home() {
  return (
    <div className="stack" style={{ gap: 32 }}>
      <section className="hero">
        <span className="eyebrow">Pour les dirigeants de PME</span>
        <h1>Sachez ce que chaque produit vous rapporte vraiment</h1>
        <p className="lead">
          Equimarge calcule la marge de chacun de vos produits et prestations, signale ceux qui vous coûtent de
          l'argent et vous donne votre seuil de rentabilité. Gratuit, sans logiciel à installer.
        </p>
        <div className="row">
          <Link href="/connexion?mode=inscription" className="btn">
            Créer mon espace gratuit
          </Link>
          <Link href="/diagnostic" className="btn ghost">
            Commander un diagnostic
          </Link>
        </div>
      </section>

      <section className="grid3">
        <div className="panel">
          <span className="eyebrow">Saisir</span>
          <h3>Vos prix et vos coûts</h3>
          <p className="note">Prix de vente, coût d'achat ou de revient, quantités du mois. Cinq minutes suffisent.</p>
        </div>
        <div className="panel">
          <span className="eyebrow">Voir</span>
          <h3>Où se fait la marge</h3>
          <p className="note">Taux de marque, marge par ligne, alertes sur les produits sous 20 % et seuil de rentabilité.</p>
        </div>
        <div className="panel">
          <span className="eyebrow">Agir</span>
          <h3>Un diagnostic sur mesure</h3>
          <p className="note">Un spécialiste de l'audit et de la gestion des risques analyse vos chiffres et propose un plan.</p>
        </div>
      </section>

      <section className="stack">
        <h2>Les formules de diagnostic</h2>
        <div className="grid3">
          {OFFERS.map((o) => (
            <div key={o.id} className="panel">
              <span className="eyebrow">{o.delay}</span>
              <h3>{o.id}</h3>
              <div className="price" style={{ fontFamily: 'var(--mono)', fontSize: '1.15rem' }}>
                {o.price}
              </div>
              <ul className="note" style={{ paddingLeft: 18 }}>
                {o.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div>
          <Link href="/diagnostic" className="btn">
            Choisir une formule
          </Link>
        </div>
      </section>
    </div>
  );
}
