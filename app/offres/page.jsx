import Link from 'next/link';
import { PRESTATIONS } from '@/components/offers';
import { Check } from '@/components/icons';

export const metadata = {
  title: 'Offres : mise en conformité RGPD, DPO externalisé, AI Act, anti-blanchiment | Equimarge',
  description:
    'Forfait de mise en conformité RGPD, abonnement DPO externalisé, conformité IA (AI Act) et dispositif anti-blanchiment pour les PME. Ce que comprend chaque offre et à qui elle s’adresse. Sur devis.',
  alternates: { canonical: '/offres' },
};

const TIER_LABEL = { principale: 'Offre principale', suivi: 'Suivi', secondaire: 'Autre offre' };

const PRICING = [
  'Le nombre de salariés et de sites',
  'Le nombre de traitements de données et leur sensibilité (santé, données bancaires, mineurs…)',
  'Ce qui existe déjà : registre, mentions, procédures',
  'Pour le DPO : le volume prévisible de demandes et de nouveaux projets',
];

function Offer({ o }) {
  return (
    <article id={o.key} className="offer-detail">
      <div className="offer-detail-head">
        <span className="eyebrow">{TIER_LABEL[o.tier]}</span>
        <h2>{o.name}</h2>
        <span className="meta">{o.price}</span>
        <p>{o.short}</p>
        <p className="note"><b>Pour qui :</b> {o.who}</p>
        <Link href={`/contact?offre=${o.key}`} className="btn">Demander un devis</Link>
      </div>
      <div>
        <h3 className="mini">Ce que comprend l’offre</h3>
        <ul className="checks">
          {o.includes.map((i) => <li key={i}><Check size={16} />{i}</li>)}
        </ul>
      </div>
    </article>
  );
}

export default function Page() {
  return (
    <div className="stack" style={{ gap: 72 }}>
      <section className="page-hero">
        <h1>Offres</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          La mise en conformité RGPD se fait au forfait. Le DPO externalisé est un abonnement mensuel, souvent pris à la
          suite du forfait. La conformité IA et l’anti-blanchiment se traitent seuls ou avec le RGPD.
        </p>
      </section>

      <div className="offer-list">
        {PRESTATIONS.map((o) => <Offer key={o.key} o={o} />)}
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Comment le prix est fixé</h2>
          <p>Chaque devis part de votre situation. Nous tenons compte de :</p>
        </div>
        <ul className="checks" style={{ marginTop: 0, fontSize: '1rem' }}>
          {PRICING.map((t) => <li key={t}><Check size={16} />{t}</li>)}
        </ul>
        <p className="note" style={{ margin: 0 }}>
          Le devis est gratuit et ne vous engage pas. Si vous ne savez pas quelle offre vous concerne, commencez par
          l’<Link href="/auto-diagnostic">auto-diagnostic gratuit</Link> ou décrivez votre situation dans le formulaire.
        </p>
      </section>

      <p className="panel note" style={{ margin: 0 }}>
        <b>À savoir :</b> nos missions relèvent de l’audit et de l’accompagnement opérationnel. Elles ne constituent pas
        des consultations juridiques et n’incluent pas la rédaction de contrats. Quand une question demande l’avis d’un
        avocat, nous vous orientons vers un professionnel du droit.
      </p>

      <section className="band">
        <div>
          <h2>Demander un devis</h2>
          <p>Nous répondons sous 48&nbsp;h ouvrées.</p>
        </div>
        <Link href="/contact" className="btn lg">Demander un devis</Link>
      </section>
    </div>
  );
}
