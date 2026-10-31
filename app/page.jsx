import Link from 'next/link';
import { COMPLIANCE, OFFERS } from '@/components/offers';
import { ArrowRight, BarChart, Bot, Check, Clock, DOMAIN_ICONS, Pencil, Shield, Target, TrendUp } from '@/components/icons';
import { siteUrl } from '@/lib/site';

export const metadata = { alternates: { canonical: '/' } };

const STEPS = [
  {
    n: '01',
    tag: 'Saisir',
    title: 'Vos prix et vos coûts',
    text: "Prix de vente, coût d'achat ou de revient, quantités du mois. Cinq minutes suffisent.",
    Icon: Pencil,
  },
  {
    n: '02',
    tag: 'Voir',
    title: 'Où se fait la marge',
    text: 'Taux de marque, marge par ligne, alertes sur les produits sous 20 % et seuil de rentabilité.',
    Icon: BarChart,
  },
  {
    n: '03',
    tag: 'Agir',
    title: 'Un diagnostic sur mesure',
    text: "Un spécialiste de l'audit et de la gestion des risques analyse vos chiffres et propose un plan.",
    Icon: Target,
  },
];

// Exemple de plan d'action conformité (livrable de l'étape 2 de la démarche) :
// l'avancement affiché est la moyenne des cinq domaines.
const PLAN = [
  { name: 'RGPD', progress: 100, state: 'ok', label: 'Conforme' },
  { name: 'Procédures internes', progress: 100, state: 'ok', label: 'Conforme' },
  { name: 'Anticorruption', progress: 60, state: 'warn', label: 'En cours' },
  { name: 'Anti-blanchiment', progress: 40, state: 'warn', label: 'En cours' },
  { name: 'Droit social', progress: 10, state: 'bad', label: 'À traiter' },
];

// Exemple de suivi de marge (outil gratuit)
const SAMPLE = [
  { name: 'Gamme Prestige', state: 'ok', label: 'Saine' },
  { name: 'Coffrets cadeaux', state: 'bad', label: 'Critique' },
];

function Preview() {
  return (
    <div className="preview rise d2" aria-hidden="true">
      <div className="preview-card">
        <div className="preview-head">
          <span className="preview-dots"><i /><i /><i /></span>
          <span>Exemple · plan d'action conformité</span>
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
          <span className="float-icon ok"><TrendUp size={18} /></span>
          <div><small>Exemple · tableau de bord</small><b>Marges du mois</b></div>
        </div>
        <div className="plan-row"><span>Taux de marque</span><b className="grad-text">38,4&nbsp;%</b></div>
        <div className="plan-row"><span>Marge brute</span><b>18&#8239;530&nbsp;€</b></div>
        {SAMPLE.map((r) => (
          <div className="plan-row" key={r.name}>
            <span>{r.name}</span>
            <span className={'pill ' + r.state}>{r.label}</span>
          </div>
        ))}
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
          <span className="badge"><span className="badge-dot" />Pour les dirigeants de PME</span>
          <h1>
            Sécurisez votre <span className="grad-text">conformité</span>, maîtrisez vos marges
          </h1>
          <p className="lead">
            Equimarge accompagne les PME sur trois terrains : la mise en conformité de l'entreprise (procédures internes,
            RGPD, anti-blanchiment, anticorruption, droit social), le suivi de la marge de chaque produit, avec un outil
            gratuit et un diagnostic sur mesure, et l'automatisation des tâches répétitives par des agents IA.
          </p>
          <div className="row">
            <Link href="/conformite#devis" className="btn lg">
              Demander un devis conformité <ArrowRight size={18} />
            </Link>
            <Link href="/connexion?mode=inscription" className="btn ghost lg">
              Créer mon espace gratuit
            </Link>
          </div>
          <ul className="trust">
            <li><Check size={18} />Conformité sur devis</li>
            <li><Check size={18} />Outil de marge gratuit</li>
            <li><Check size={18} />Réponse sous 48&nbsp;h ouvrées</li>
          </ul>
        </div>
        <Preview />
      </section>

      <section className="section">
        <div className="section-head center">
          <span className="eyebrow">Trois pôles</span>
          <h2>Votre conformité, vos marges et votre temps, au même endroit</h2>
          <p>Choisissez par où commencer : les trois se complètent.</p>
        </div>
        <div className="grid3 poles">
          <article className="pole">
            <div className="feature-icon"><Shield size={22} /></div>
            <span className="eyebrow">Pôle conformité</span>
            <h3>Sécurisez votre entreprise</h3>
            <p className="note">
              Audit et accompagnement pour mettre en place vos politiques et procédures et répondre à vos obligations.
            </p>
            <ul className="checks">
              {COMPLIANCE.map((d) => (
                <li key={d.key}><Check size={16} />{d.id}</li>
              ))}
            </ul>
            <div className="row">
              <Link href="/conformite#devis" className="btn">Demander un devis</Link>
              <Link href="/conformite" className="btn ghost">Découvrir</Link>
            </div>
          </article>
          <article className="pole">
            <div className="feature-icon"><BarChart size={22} /></div>
            <span className="eyebrow">Pôle marges</span>
            <h3>Pilotez votre rentabilité</h3>
            <p className="note">
              Un outil gratuit pour suivre la marge de chaque produit, et un diagnostic réalisé par un spécialiste de
              l'audit pour aller plus loin.
            </p>
            <ul className="checks">
              <li><Check size={16} />Marge et taux de marque par produit</li>
              <li><Check size={16} />Alertes et seuil de rentabilité</li>
              <li><Check size={16} />Diagnostic et plan d'action sur mesure</li>
            </ul>
            <div className="row">
              <Link href="/connexion?mode=inscription" className="btn">Créer mon espace gratuit</Link>
              <a href="#formules" className="btn ghost">Voir les formules</a>
            </div>
          </article>
          <article className="pole">
            <div className="feature-icon"><Bot size={22} /></div>
            <span className="eyebrow">Pôle automatisation</span>
            <h3>Gagnez du temps chaque jour</h3>
            <p className="note">
              Des agents IA prennent en charge ce qui se répète, et un superviseur vous résume la journée en cinq lignes.
            </p>
            <ul className="checks">
              <li><Check size={16} />Mails, messages et appels manqués</li>
              <li><Check size={16} />Factures et relances</li>
              <li><Check size={16} />Planning, achats et rapport du soir</li>
            </ul>
            <div className="row">
              <Link href="/automatisation#devis" className="btn">Demander un devis</Link>
              <Link href="/automatisation" className="btn ghost">Découvrir</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section" id="conformite">
        <div className="section-head center">
          <span className="eyebrow">Pôle conformité</span>
          <h2>Cinq domaines d'intervention</h2>
          <p>Sur devis, selon votre taille et votre secteur. Réponse sous 48&nbsp;h ouvrées.</p>
        </div>
        <div className="grid3 grid-center">
          {COMPLIANCE.map((d) => {
            const Icon = DOMAIN_ICONS[d.key];
            return (
              <Link key={d.key} href={`/conformite?domaine=${d.key}#devis`} className="feature domain-card">
                <div className="feature-icon"><Icon size={22} /></div>
                <h3>{d.id}</h3>
                <p className="note">{d.intro}</p>
                <span className="domain-link">Demander un devis <ArrowRight size={16} /></span>
              </Link>
            );
          })}
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link href="/conformite" className="btn ghost lg">
            Découvrir l'accompagnement conformité
          </Link>
        </div>
      </section>

      <section className="section" id="marges">
        <div className="section-head center">
          <span className="eyebrow">Pôle marges · comment ça marche</span>
          <h2>Saisir, voir, agir</h2>
          <p>De vos chiffres bruts à un plan d'action, en trois étapes.</p>
        </div>
        <div className="grid3">
          {STEPS.map(({ n, tag, title, text, Icon }) => (
            <article key={n} className="feature">
              <span className="num" aria-hidden="true">{n}</span>
              <div className="feature-icon"><Icon size={22} /></div>
              <span className="eyebrow">{tag}</span>
              <h3>{title}</h3>
              <p className="note">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="formules">
        <div className="section-head center">
          <span className="eyebrow">Pôle marges · diagnostic</span>
          <h2>Les formules de diagnostic</h2>
          <p>Nous revenons vers vous sous 48&nbsp;h ouvrées. Aucun paiement n'est demandé à ce stade.</p>
        </div>
        <div className="grid3 pricing">
          {OFFERS.map((o) => (
            <article key={o.id} className={'price-card' + (o.featured ? ' featured' : '')}>
              {o.featured && <span className="ribbon">Recommandée</span>}
              <h3>{o.id}</h3>
              <span className="meta"><Clock size={16} />{o.delay}</span>
              <div className="price">{o.price}</div>
              <ul className="checks">
                {o.items.map((i) => (
                  <li key={i}><Check size={16} />{i}</li>
                ))}
              </ul>
              <Link
                href={`/diagnostic?formule=${encodeURIComponent(o.id)}`}
                className={'btn' + (o.featured ? '' : ' ghost')}
              >
                Choisir {o.id}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="cta">
        <div>
          <h2>Parlons de votre entreprise</h2>
          <p>Conformité sur devis, outil de marge gratuit. Réponse sous 48&nbsp;h ouvrées.</p>
        </div>
        <div className="row">
          <Link href="/conformite#devis" className="btn inverse lg">
            Demander un devis conformité <ArrowRight size={18} />
          </Link>
          <Link href="/connexion?mode=inscription" className="btn on-grad lg">
            Créer mon espace gratuit
          </Link>
        </div>
      </section>
    </div>
  );
}
