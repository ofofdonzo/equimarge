import Link from 'next/link';
import { Alert, ArrowRight, Check, Lock, Percent, Receipt, Target, TrendUp } from '@/components/icons';
import { siteUrl } from '@/lib/site';
import { freeReads, PLAN_NAME, priceLabel } from '@/lib/abonnement.mjs';
import { recettesPrice } from '@/lib/stripe';

export const metadata = {
  title: 'Coût matière et prix de vente pour artisans de l’alimentation — Equimarge',
  description:
    'Photographiez vos factures fournisseurs : le coût de vos matières est mis à jour, chaque recette est recalculée et les produits qui ne rapportent plus assez sont signalés, avec un prix conseillé. Boulangers, pâtissiers, traiteurs, restaurateurs.',
  alternates: { canonical: '/artisans' },
};
// Page statique, régénérée chaque heure pour suivre le prix de l'abonnement fixé dans Stripe
export const revalidate = 3600;

const SIGNUP = '/connexion?mode=inscription&suite=/tableau-de-bord/recettes';

const STEPS = [
  { n: '01', title: 'Photographiez la facture', text: 'Depuis votre téléphone, ou envoyez le PDF reçu par e-mail.', Icon: Receipt },
  { n: '02', title: 'Vérifiez les lignes', text: 'Produits, quantités et prix hors taxes sont relevés pour vous. Vous corrigez ou validez en un clic.', Icon: Check },
  { n: '03', title: 'Composez vos recettes', text: 'Une seule fois : les quantités d’une fournée, le nombre de pièces et le prix affiché.', Icon: Target },
  { n: '04', title: 'Ajustez vos prix', text: 'À chaque facture, les recettes qui ne rapportent plus assez remontent, avec le prix à afficher.', Icon: TrendUp },
];

const FEATURES = [
  { title: 'Le coût matière de chaque pièce', text: 'Farine, beurre, œufs, emballages : le coût réel d’un croissant ou d’une part de tarte, au centime, avec vos derniers prix fournisseurs.', Icon: Receipt },
  { title: 'Taux de marque et coefficient', text: 'Pour chaque recette, ce qui reste sur le prix hors taxes une fois les matières payées, comparé à l’objectif que vous fixez.', Icon: Percent },
  { title: 'Un prix conseillé, prêt à afficher', text: 'Le prix TTC qui atteint votre objectif, TVA comprise et arrondi aux 5 centimes supérieurs.', Icon: Target },
  { title: 'Les hausses signalées', text: 'Une matière qui augmente de 5 % ou plus est signalée, avec le nombre de recettes qu’elle touche.', Icon: Alert },
];

const TRADES = ['Boulangeries-pâtisseries', 'Traiteurs', 'Boucheries-charcuteries', 'Restaurants', 'Food trucks', 'Chocolatiers', 'Glaciers', 'Pizzerias'];

const PRIVACY = [
  'Equimarge ne conserve pas le fichier de la facture : seuls le fournisseur, la date et le total sont gardés.',
  'Aucun prix ne change sans votre validation, ligne par ligne.',
  'La facture est lue par Claude, l’IA d’Anthropic. Vos recettes et vos prix sont hébergés dans l’Union européenne.',
  'Vos données ne sont visibles que par vous et s’effacent avec votre compte, à tout moment.',
];

// Réponse « Combien ça coûte ? » : selon que l'abonnement est ouvert (prix lu dans Stripe) ou non
function costAnswer(price, free) {
  if (!price) {
    return 'Rien pendant le lancement, sans carte bancaire. Si l’outil devient payant, vous serez prévenu à l’avance et rien ne vous sera facturé sans votre accord.';
  }
  return `La version gratuite comprend les recettes et les matières sans limite, les prix conseillés, les alertes et ${free} lecture${free > 1 ? 's' : ''} de facture par mois, sans carte bancaire. ${PLAN_NAME}, à ${price}, lit toutes vos factures (jusqu’à 300 par mois). Sans engagement : vous résiliez en ligne quand vous voulez, l’abonnement s’arrête à la fin de la période payée.`;
}

const FAQ = [
  {
    q: 'Et si la lecture de la facture se trompe ?',
    a: 'Vous voyez chaque ligne avant la mise à jour : quantité, total hors taxes et coût par kilo, litre ou pièce. Vous pouvez rattacher une ligne à une autre matière, la renommer ou l’ignorer. Les prix se corrigent aussi à la main à tout moment.',
  },
  {
    q: 'Qu’est-ce que le taux de marque matière ?',
    a: 'La part du prix de vente hors taxes qui reste une fois les matières premières payées. Un croissant vendu 1,20 € TTC (1,14 € HT) qui coûte 0,32 € de matières a un taux de marque matière de 72 %. La main-d’œuvre, l’énergie et le loyer restent à couvrir avec cette marge.',
  },
  {
    q: 'Quels documents puis-je envoyer ?',
    a: 'Une photo (prise avec le téléphone, ou une image JPEG, PNG, WebP) ou un PDF de 4 Mo au plus. Les factures électroniques reçues en PDF fonctionnent aussi.',
  },
  {
    q: 'Faut-il saisir toutes mes recettes d’un coup ?',
    a: 'Non. Commencez par vos cinq meilleures ventes : ce sont elles qui font votre marge. Les matières se créent toutes seules à la lecture de vos factures.',
  },
];

// Exemple de l'onglet « Recettes », tel que l'artisan le voit dans son espace
const EXAMPLE = [
  { name: 'Croissant', rate: 65, state: 'bad', label: 'À revoir' },
  { name: 'Tarte aux fraises', rate: 68, state: 'warn', label: 'Proche' },
  { name: 'Baguette tradition', rate: 81, state: 'ok', label: 'Atteint' },
  { name: 'Pain au chocolat', rate: 78, state: 'ok', label: 'Atteint' },
];

function Preview() {
  return (
    <div className="preview rise d2" aria-hidden="true">
      <div className="preview-card">
        <div className="preview-head">
          <span className="preview-dots"><i /><i /><i /></span>
          <span>Exemple · vos recettes</span>
        </div>
        <div className="preview-kpis">
          <div><small>Recettes suivies</small><b>24</b></div>
          <div><small>Taux de marque moyen</small><b className="grad-text">74&nbsp;%</b></div>
          <div><small>Sous l’objectif</small><b>3</b></div>
        </div>
        <div className="preview-rows">
          {EXAMPLE.map((r) => (
            <div className="preview-row" key={r.name}>
              <span className="name">{r.name}</span>
              <div className="track">
                <div className={'fill' + (r.state === 'ok' ? '' : ' ' + r.state)} style={{ width: `${r.rate}%` }} />
              </div>
              <span className="v">{r.rate}&nbsp;%</span>
              <span className={'pill ' + r.state}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="plan-card">
        <div className="plan-head">
          <span className="float-icon bad"><TrendUp size={18} /></span>
          <div><small>Facture du 4 novembre</small><b>Beurre AOP : +12&nbsp;%</b></div>
        </div>
        <div className="plan-row"><span>Recettes touchées</span><span className="pill warn">3</span></div>
        <div className="plan-row"><span>Prix du croissant</span><span className="nowrap">1,20&nbsp;€ → 1,40&nbsp;€</span></div>
      </div>
    </div>
  );
}

export default async function Page() {
  const base = siteUrl();
  const stripePrice = await recettesPrice();
  const price = priceLabel(stripePrice);
  const free = freeReads(process.env);
  const faq = [{ q: 'Combien ça coûte ?', a: costAnswer(price, free) }, ...FAQ];
  // Fiches lues par les moteurs de recherche : l'outil et ses questions fréquentes (mêmes textes que la page)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Equimarge Recettes',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: `${base}/artisans`,
      inLanguage: 'fr-FR',
      offers: [
        { '@type': 'Offer', name: 'Gratuit', price: '0', priceCurrency: 'EUR' },
        ...(price ? [{ '@type': 'Offer', name: PLAN_NAME, price: String(stripePrice.unit_amount / 100), priceCurrency: stripePrice.currency.toUpperCase() }] : []),
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ];

  return (
    <div className="stack" style={{ gap: 88 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero">
        <div className="rise">
          <span className="badge"><span className="badge-dot" />Pour les artisans de l’alimentation</span>
          <h1>
            Vos matières augmentent. <span className="grad-text">Vos prix suivent&#8209;ils ?</span>
          </h1>
          <p className="lead">
            Photographiez vos factures fournisseurs : le coût de vos matières est mis à jour, chaque recette est
            recalculée, et vous savez quels produits ne rapportent plus assez, avec le prix à afficher.
          </p>
          <div className="row">
            <Link href={SIGNUP} className="btn lg">
              Essayer gratuitement <ArrowRight size={18} />
            </Link>
            <a href="#etapes" className="btn ghost lg">
              Comment ça marche
            </a>
          </div>
          <ul className="trust">
            <li><Check size={18} />{price ? 'Version gratuite, sans limite de durée' : 'Gratuit pendant le lancement'}</li>
            <li><Check size={18} />Sans carte bancaire</li>
            <li><Check size={18} />Vous validez chaque prix</li>
          </ul>
        </div>
        <Preview />
      </section>

      <section className="section" id="etapes">
        <div className="section-head">
          <span className="eyebrow">Comment ça marche</span>
          <h2>De la facture au bon prix, en quelques minutes</h2>
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

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Ce que vous voyez</span>
          <h2>Chaque produit, ce qu’il vous coûte et ce qu’il vous rapporte</h2>
          <p>Le beurre, le cacao, les fruits changent de prix d’une livraison à l’autre. Vos étiquettes, elles, restent souvent les mêmes toute l’année.</p>
        </div>
        <div className="grid2">
          {FEATURES.map(({ title, text, Icon }) => (
            <article key={title} className="feature">
              <div className="feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p className="note">{text}</p>
            </article>
          ))}
        </div>
        <div>
          <p className="note" style={{ margin: '0 0 10px' }}>Pensé pour :</p>
          <ul className="chips trades" aria-label="Métiers">
            {TRADES.map((t) => <li key={t} className="chip">{t}</li>)}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="panel callout">
          <div className="row" style={{ gap: 12 }}>
            <span className="float-icon ok"><Lock size={18} /></span>
            <h2 style={{ margin: 0 }}>Vos factures et vos recettes restent à vous</h2>
          </div>
          <ul className="checks">
            {PRIVACY.map((p) => (
              <li key={p}><Check size={16} />{p}</li>
            ))}
          </ul>
          <p className="note" style={{ marginBottom: 0 }}>
            Le détail est dans notre <Link href="/confidentialite">politique de confidentialité</Link>.
          </p>
        </div>
      </section>

      {price && (
        <section className="section" id="tarifs">
          <div className="section-head">
            <span className="eyebrow">Tarifs</span>
            <h2>Commencez gratuitement, abonnez-vous quand vous voulez</h2>
          </div>
          <div className="grid2">
            <article className="price-card">
              <h3 style={{ margin: 0 }}>Gratuit</h3>
              <p className="price">0&nbsp;€</p>
              <p className="note" style={{ margin: 0 }}>Sans carte bancaire, sans limite de durée.</p>
              <ul className="checks">
                <li><Check size={16} />Recettes et matières premières sans limite</li>
                <li><Check size={16} />Coût matière, taux de marque et prix conseillé</li>
                <li><Check size={16} />Alertes de hausse de prix</li>
                <li><Check size={16} />{free} lecture{free > 1 ? 's' : ''} de facture par mois</li>
              </ul>
              <Link href={SIGNUP} className="btn ghost">Créer mon espace</Link>
            </article>
            <article className="price-card featured">
              <h3 style={{ margin: 0 }}>{PLAN_NAME}</h3>
              <p className="price">{price}</p>
              <p className="note" style={{ margin: 0 }}>Sans engagement, résiliable en ligne.</p>
              <ul className="checks">
                <li><Check size={16} />Tout ce que contient la version gratuite</li>
                <li><Check size={16} />Jusqu’à 300 factures lues par mois</li>
                <li><Check size={16} />Facture mensuelle par e-mail</li>
                <li><Check size={16} />Paiement sécurisé par Stripe</li>
              </ul>
              <Link href={SIGNUP} className="btn">Essayer gratuitement <ArrowRight size={18} /></Link>
            </article>
          </div>
        </section>
      )}

      <section className="section" id="questions">
        <div className="section-head">
          <span className="eyebrow">Questions fréquentes</span>
          <h2>Avant de commencer</h2>
        </div>
        <div className="faq">
          {faq.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="cta">
        <div>
          <h2>Commencez par votre dernière facture</h2>
          <p>Créez votre espace, photographiez une facture : vos premières matières sont prêtes en deux minutes.</p>
        </div>
        <div className="row">
          <Link href={SIGNUP} className="btn inverse lg">
            Essayer gratuitement <ArrowRight size={18} />
          </Link>
          <Link href="/diagnostic" className="btn on-grad lg">
            Faire analyser mes marges
          </Link>
        </div>
      </section>
    </div>
  );
}
