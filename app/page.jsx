import Link from 'next/link';
import { OFFERS } from '@/components/offers';
import { Alert, ArrowRight, BarChart, Check, Clock, Pencil, Target, TrendUp } from '@/components/icons';
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

// Données fictives de l'aperçu : les marges additionnées donnent la marge brute affichée.
const SAMPLE = [
  { name: 'Gamme Prestige', margin: '8 900 €', width: 100, state: 'ok', label: 'Saine' },
  { name: 'Service installation', margin: '6 120 €', width: 69, state: 'ok', label: 'Saine' },
  { name: 'Pièces détachées', margin: '2 950 €', width: 33, state: 'warn', label: 'À surveiller' },
  { name: 'Coffrets cadeaux', margin: '560 €', width: 6, state: 'bad', label: 'Critique' },
];

function Preview() {
  return (
    <div className="preview rise d2" aria-hidden="true">
      <div className="preview-card">
        <div className="preview-head">
          <span className="preview-dots"><i /><i /><i /></span>
          <span>Exemple · tableau de bord mensuel</span>
        </div>
        <div className="preview-kpis">
          <div><small>Chiffre d'affaires</small><b>48&#8239;200&nbsp;€</b></div>
          <div><small>Marge brute</small><b>18&#8239;530&nbsp;€</b></div>
          <div><small>Taux de marque</small><b className="grad-text">38,4&nbsp;%</b></div>
        </div>
        <div className="preview-rows">
          {SAMPLE.map((r) => (
            <div className="preview-row" key={r.name}>
              <span className="name">{r.name}</span>
              <div className="track">
                <div className={'fill' + (r.state === 'ok' ? '' : ' ' + r.state)} style={{ width: `${r.width}%` }} />
              </div>
              <span className="v">{r.margin}</span>
              <span className={'pill ' + r.state}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="float float-a">
        <span className="float-icon ok"><TrendUp size={18} /></span>
        <div><small>Seuil de rentabilité</small><b>Dépassé de 6&#8239;600&nbsp;€</b></div>
      </div>
      <div className="float float-b">
        <span className="float-icon bad"><Alert size={18} /></span>
        <div><small>Coffrets cadeaux</small><b>Taux de marque 14&nbsp;%</b></div>
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
            Sachez ce que chaque produit vous rapporte <span className="grad-text">vraiment</span>
          </h1>
          <p className="lead">
            Equimarge calcule la marge de chacun de vos produits et prestations, signale ceux qui vous coûtent de
            l'argent et vous donne votre seuil de rentabilité. Gratuit, sans logiciel à installer.
          </p>
          <div className="row">
            <Link href="/connexion?mode=inscription" className="btn lg">
              Créer mon espace gratuit <ArrowRight size={18} />
            </Link>
            <Link href="/diagnostic" className="btn ghost lg">
              Commander un diagnostic
            </Link>
          </div>
          <ul className="trust">
            <li><Check size={18} />Gratuit</li>
            <li><Check size={18} />Sans logiciel à installer</li>
            <li><Check size={18} />Vos chiffres restent privés</li>
          </ul>
        </div>
        <Preview />
      </section>

      <section className="section">
        <div className="section-head center">
          <span className="eyebrow">Comment ça marche</span>
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

      <section className="section">
        <div className="section-head center">
          <span className="eyebrow">Diagnostic</span>
          <h2>Les formules de diagnostic</h2>
          <p>Nous revenons vers vous sous 48 h ouvrées. Aucun paiement n'est demandé à ce stade.</p>
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
          <h2>Prêt à voir où se fait votre marge&nbsp;?</h2>
          <p>Gratuit, sans logiciel à installer. Vos chiffres restent privés.</p>
        </div>
        <div className="row">
          <Link href="/connexion?mode=inscription" className="btn inverse lg">
            Créer mon espace gratuit <ArrowRight size={18} />
          </Link>
          <Link href="/diagnostic" className="btn on-grad lg">
            Commander un diagnostic
          </Link>
        </div>
      </section>
    </div>
  );
}
