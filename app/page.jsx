import Link from 'next/link';
import { Check } from '@/components/icons';
import { PRESTATIONS } from '@/components/offers';
import { siteUrl } from '@/lib/site';

export const metadata = { alternates: { canonical: '/' } };

const STEPS = [
  { n: '1', title: 'Premier échange', text: 'Par téléphone ou en visio, nous faisons le point sur votre activité, vos données et vos obligations.' },
  { n: '2', title: 'Devis', text: 'Vous recevez un devis sous 48 h ouvrées : un forfait pour la mise en conformité, un abonnement pour le DPO externalisé.' },
  { n: '3', title: 'État des lieux et documents', text: 'Vous répondez à nos questions et déposez vos pièces dans votre dossier en ligne. Nous rédigeons le registre, les procédures et le plan d’action.' },
  { n: '4', title: 'Suivi', text: 'Avec l’abonnement DPO, nous tenons votre conformité à jour et traitons les demandes et les incidents au fil de l’année.' },
];

// Exemple de dossier client, tel que le client le voit dans son espace
const PLAN = [
  { name: 'RGPD', progress: 100, state: 'ok', label: 'Conforme' },
  { name: 'Anti-blanchiment', progress: 60, state: 'warn', label: 'En cours' },
  { name: 'Intelligence artificielle', progress: 20, state: 'bad', label: 'À traiter' },
];

function Preview() {
  return (
    <div className="preview" aria-hidden="true">
      <div className="preview-card">
        <div className="preview-head">Exemple de dossier client, tel qu’il apparaît dans votre espace</div>
        <div className="preview-kpis">
          <div><small>Domaines suivis</small><b>3</b></div>
          <div><small>Conformes</small><b>1 sur 3</b></div>
          <div><small>Avancement</small><b>60&nbsp;%</b></div>
        </div>
        <div className="preview-rows">
          {PLAN.map((r) => (
            <div className="preview-row" key={r.name}>
              <span className="name">{r.name}</span>
              <div className="track">
                <div className={'fill' + (r.state === 'ok' ? '' : ' ' + r.state)} style={{ width: `${r.progress}%` }} />
              </div>
              <span className="v">{r.progress}&nbsp;%</span>
              <span className={'pill ' + r.state}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="plan-card">
        <div className="plan-head"><b>Suivi de la mission</b></div>
        <div className="plan-row"><span>Informations à fournir</span><span className="pill warn">1 demande</span></div>
        <div className="plan-row"><span>Registre des traitements</span><span className="pill ok">Livré</span></div>
        <div className="plan-row"><span>Procédure de réponse aux droits</span><span className="pill warn">En cours</span></div>
      </div>
    </div>
  );
}

export default function Home() {
  const base = siteUrl();
  // Fiche lue par Google pour afficher le nom du site et de l'entreprise dans les résultats
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Equimarge', url: `${base}/`, inLanguage: 'fr-FR' },
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Equimarge', url: `${base}/`, logo: `${base}/icon.svg`, email: 'contact@equimarge.fr' },
  ];

  const [rgpd, dpo, ...secondary] = PRESTATIONS;

  return (
    <div className="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero">
        <div>
          <span className="badge">Conformité des PME</span>
          <h1>Mise en conformité RGPD et DPO externalisé</h1>
          <p className="lead">
            Equimarge met votre entreprise en conformité avec le RGPD, puis peut assurer la fonction de délégué à la
            protection des données (DPO). Nous intervenons aussi sur l’usage de l’intelligence artificielle et sur
            l’anti-blanchiment. Vos documents et l’avancement de la mission sont dans un dossier en ligne.
          </p>
          <div className="row">
            <Link href="/contact" className="btn lg">Demander un devis</Link>
            <Link href="/auto-diagnostic" className="btn ghost lg">Faire l’auto-diagnostic gratuit</Link>
          </div>
          <ul className="trust">
            <li>Devis sous 48&nbsp;h ouvrées</li>
            <li>Un seul interlocuteur</li>
            <li>Dossier suivi en ligne</li>
          </ul>
        </div>
        <Preview />
      </section>

      <section className="section" id="offres">
        <div className="section-head">
          <h2>Nos offres</h2>
          <p>Un forfait pour se mettre en conformité, un abonnement pour le rester.</p>
        </div>
        <div className="grid2">
          {[rgpd, dpo].map((o) => (
            <article key={o.key} className="feature domain">
              <h3>{o.name}</h3>
              <span className="meta">{o.price}</span>
              <p className="note" style={{ marginTop: 10 }}>{o.short}</p>
              <ul className="checks">
                {o.includes.slice(0, 4).map((i) => <li key={i}><Check size={16} />{i}</li>)}
              </ul>
              <Link href={`/offres#${o.key}`} className="domain-link">Le détail de l’offre</Link>
            </article>
          ))}
        </div>
        <ul className="linklist">
          {secondary.map((o) => (
            <li key={o.key}>
              <Link href={`/offres#${o.key}`}><b>{o.name}</b><span>{o.short}</span></Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Comment se passe une mission</h2>
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

      <section className="section" id="a-propos">
        <div className="section-head">
          <h2>Qui réalise votre mission</h2>
        </div>
        <div className="about">
          <p>
            Equimarge est dirigée par Ousmane Donzo, formé au droit, à l’audit et à la gestion des risques. Il est votre
            interlocuteur du premier échange à la livraison des documents.
          </p>
          <p>
            Nos missions relèvent de l’audit et de l’accompagnement. Elles ne constituent pas des consultations
            juridiques : quand une question demande l’avis d’un avocat, nous vous le disons.
          </p>
          <p>
            Pour un premier échange, écrivez à <a href="mailto:contact@equimarge.fr">contact@equimarge.fr</a> ou appelez
            le <a href="tel:+33766557340">07 66 55 73 40</a>.
          </p>
        </div>
      </section>

      <section className="cta">
        <div>
          <h2>Demander un devis</h2>
          <p>Décrivez votre situation en quelques lignes. Nous répondons sous 48&nbsp;h ouvrées, sans engagement.</p>
        </div>
        <div className="row">
          <Link href="/contact" className="btn inverse lg">Demander un devis</Link>
          <Link href="/auto-diagnostic" className="btn on-grad lg">Faire l’auto-diagnostic gratuit</Link>
        </div>
      </section>
    </div>
  );
}
