import Link from 'next/link';
import { ArrowRight, BarChart, Bot, Check, ClipboardList, Database, Lock, Search, Shield, TrendUp } from '@/components/icons';
import { siteUrl } from '@/lib/site';

export const metadata = { alternates: { canonical: '/' } };

const DIAGNOSTIC = '/connexion?mode=inscription&suite=/tableau-de-bord/conformite';

const STEPS = [
  { n: '01', title: 'Auto-diagnostic gratuit', text: 'Quelques minutes en ligne pour situer votre entreprise, domaine par domaine.', Icon: Search },
  { n: '02', title: 'Devis', text: 'Nous échangeons sur votre situation et vous proposons une mission au forfait ou un abonnement.', Icon: ClipboardList },
  { n: '03', title: 'Vous transmettez, nous réalisons', text: 'Vous répondez à nos demandes et déposez vos documents dans votre dossier en ligne. Nous faisons le travail.', Icon: Shield },
  { n: '04', title: 'Livrables et suivi', text: 'Registre, procédures et plan d’action sont livrés dans votre dossier, avec un suivi dans la durée.', Icon: TrendUp },
];

const OFFERS = [
  {
    title: 'Mise en conformité RGPD',
    price: 'Forfait sur devis',
    Icon: Database,
    href: '/conformite?domaine=rgpd#devis',
    items: ['État des lieux et registre des traitements', 'Mentions d’information, demandes de droits, violations de données', 'Contrats de sous-traitance revus et plan d’action'],
  },
  {
    title: 'DPO externalisé',
    price: 'Abonnement mensuel sur devis',
    Icon: Lock,
    href: '/conformite?domaine=dpo#devis',
    items: ['Désignation auprès de la CNIL', 'Demandes de droits et violations de données traitées', 'Registre tenu à jour et rapport annuel'],
  },
  {
    title: 'Vos autres obligations',
    price: 'Sur devis',
    Icon: Shield,
    href: '/conformite#domaines',
    items: ['Anti-blanchiment (LCB-FT)', 'Intelligence artificielle (AI Act)', 'Anticorruption, procédures internes, droit social'],
  },
];

// Exemple de dossier client, tel que le client le voit dans son espace
const PLAN = [
  { name: 'RGPD', progress: 100, state: 'ok', label: 'Conforme' },
  { name: 'Procédures internes', progress: 100, state: 'ok', label: 'Conforme' },
  { name: 'Anti-blanchiment', progress: 60, state: 'warn', label: 'En cours' },
  { name: 'Intelligence artificielle', progress: 40, state: 'warn', label: 'En cours' },
  { name: 'Droit social', progress: 10, state: 'bad', label: 'À traiter' },
];

function Preview() {
  return (
    <div className="preview rise d2" aria-hidden="true">
      <div className="preview-card">
        <div className="preview-head">
          <span className="preview-dots"><i /><i /><i /></span>
          <span>Exemple · votre dossier de conformité</span>
        </div>
        <div className="preview-kpis">
          <div><small>Domaines suivis</small><b>5</b></div>
          <div><small>Conformes</small><b>2 sur 5</b></div>
          <div><small>Avancement</small><b className="grad-text">62&nbsp;%</b></div>
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
        <div className="plan-head">
          <span className="float-icon ok"><ClipboardList size={18} /></span>
          <div><small>Dans votre espace</small><b>Suivi de la mission</b></div>
        </div>
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

  return (
    <div className="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero">
        <div className="rise">
          <span className="badge"><span className="badge-dot" />PME et intermédiaires d’assurance</span>
          <h1>
            Votre <span className="grad-text">conformité</span> prise en charge, de l’état des lieux au DPO externalisé
          </h1>
          <p className="lead">
            Equimarge réalise votre mise en conformité RGPD, assure la fonction de délégué à la protection des données et
            vous accompagne sur l’anti-blanchiment, l’intelligence artificielle et vos procédures. Vous nous transmettez les
            informations, nous faisons le travail, vous suivez l’avancement dans votre espace.
          </p>
          <div className="row">
            <Link href="/conformite#devis" className="btn lg">
              Demander un devis <ArrowRight size={18} />
            </Link>
            <Link href={DIAGNOSTIC} className="btn ghost lg">
              Auto-diagnostic gratuit
            </Link>
          </div>
          <ul className="trust">
            <li><Check size={18} />Forfait ou abonnement</li>
            <li><Check size={18} />Dossier suivi en ligne</li>
            <li><Check size={18} />Réponse sous 48&nbsp;h ouvrées</li>
          </ul>
        </div>
        <Preview />
      </section>

      <section className="section">
        <div className="section-head center">
          <span className="eyebrow">Comment ça marche</span>
          <h2>Vous transmettez, nous réalisons</h2>
          <p>Votre temps reste consacré à votre activité : la conformité avance sans vous demander de devenir juriste.</p>
        </div>
        <ol className="steps4">
          {STEPS.map(({ n, title, text, Icon }) => (
            <li key={n} className="feature">
              <span className="num" aria-hidden="true">{n}</span>
              <div className="feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p className="note">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section" id="offres">
        <div className="section-head center">
          <span className="eyebrow">Nos offres</span>
          <h2>Une mission au forfait ou un accompagnement continu</h2>
          <p>Réponse sous 48&nbsp;h ouvrées, sans engagement à la demande de devis.</p>
        </div>
        <div className="grid3">
          {OFFERS.map(({ title, price, Icon, href, items }) => (
            <article key={title} className="feature domain">
              <div className="feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <span className="meta">{price}</span>
              <ul className="checks">
                {items.map((i) => <li key={i}><Check size={16} />{i}</li>)}
              </ul>
              <Link href={href} className="domain-link">Demander un devis <ArrowRight size={16} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="panel callout row" style={{ justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            <span className="eyebrow">Intermédiaires d’assurance</span>
            <h2 style={{ margin: '6px 0 8px' }}>Courtiers : un accompagnement dédié</h2>
            <p className="note" style={{ margin: 0 }}>
              Devoir de conseil, lutte contre le blanchiment, données de santé, réclamations : un audit et des procédures
              adaptés aux cabinets de courtage.
            </p>
          </div>
          <Link href="/intermediaires-assurance" className="btn lg">Découvrir <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-head center">
          <span className="eyebrow">Aussi chez Equimarge</span>
          <h2>Pour aller plus loin</h2>
        </div>
        <div className="grid2">
          <Link href="/diagnostic" className="feature domain-card">
            <div className="feature-icon"><BarChart size={22} /></div>
            <h3>Diagnostic de marge</h3>
            <p className="note">Une analyse produit par produit de votre rentabilité, avec un outil gratuit de suivi de marge.</p>
            <span className="domain-link">Voir les formules <ArrowRight size={16} /></span>
          </Link>
          <Link href="/automatisation" className="feature domain-card">
            <div className="feature-icon"><Bot size={22} /></div>
            <h3>Automatisation par agents IA</h3>
            <p className="note">Mails, factures, relances et planning préparés par des agents IA, validés par vous.</p>
            <span className="domain-link">Découvrir <ArrowRight size={16} /></span>
          </Link>
        </div>
      </section>

      <section className="cta">
        <div>
          <h2>Parlons de votre conformité</h2>
          <p>Devis sous 48&nbsp;h ouvrées, ou commencez par l’auto-diagnostic gratuit.</p>
        </div>
        <div className="row">
          <Link href="/conformite#devis" className="btn inverse lg">
            Demander un devis <ArrowRight size={18} />
          </Link>
          <Link href={DIAGNOSTIC} className="btn on-grad lg">
            Auto-diagnostic gratuit
          </Link>
        </div>
      </section>
    </div>
  );
}
