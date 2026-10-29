import { createClient } from '@/lib/supabase/server';
import { Alert, ArrowRight, Calendar, Check, ClipboardList, Clock, Pencil, Shield } from '@/components/icons';
import RequestForm from '@/components/RequestForm';

// Page d'arrivée des publicités (Meta) : une seule offre, une seule action.
// Lien à mettre dans les pubs : /pre-diagnostic (paramètres UTM : voir le README, étape 9).
export const metadata = {
  title: 'Pré-diagnostic conformité offert — Equimarge',
  description:
    "30 minutes en visio pour savoir quelles obligations s'appliquent à votre PME (RGPD, droit social, procédures internes, anticorruption, anti-blanchiment) et par où commencer. Offert, sans engagement.",
  alternates: { canonical: '/pre-diagnostic' },
};
export const dynamic = 'force-dynamic';

// Ce que le dirigeant obtient (la valeur de l'offre) ; les titres sont repris dans la carte de l'offre
const GAINS = [
  {
    title: 'Vos obligations, domaine par domaine',
    text: "Nous passons en revue les cinq domaines et repérons ceux qui s'appliquent à votre entreprise, selon sa taille, son secteur et ses clients.",
    Icon: ClipboardList,
  },
  {
    title: 'Vos trois priorités',
    text: "Les écarts les plus exposés, classés par urgence : ce qu'il faut traiter d'abord, et pourquoi.",
    Icon: Alert,
  },
  {
    title: 'Une synthèse écrite',
    text: "Après l'échange, un récapitulatif par e-mail. Si vous le souhaitez, une proposition chiffrée pour aller plus loin.",
    Icon: Shield,
  },
];

// Les enjeux, chiffres sourcés : à revoir si la loi change
const STAKES = [
  {
    figure: '4 %',
    text: "du chiffre d'affaires mondial, ou 20 M€ si ce montant est plus élevé : le plafond des amendes RGPD.",
    source: 'RGPD, article 83',
  },
  {
    figure: '1 salarié',
    text: "suffit pour devoir tenir à jour un document unique d'évaluation des risques (DUERP).",
    source: 'Code du travail, article R4121-1',
  },
  {
    figure: '1er rang',
    text: "Les grandes entreprises soumises à la loi Sapin II doivent évaluer leurs fournisseurs de premier rang : votre dispositif anticorruption compte pour être retenu.",
    source: 'Loi Sapin II, article 17',
  },
];

// Témoignages clients : n'ajoutez que de vrais avis, avec l'accord écrit du client. La section s'affiche dès qu'il y en a un.
// Exemple : { quote: '…', name: 'Prénom N.', role: 'Gérante, commerce de détail' }
const TESTIMONIALS = [];

const STEPS = [
  { n: '01', title: 'Vous remplissez le formulaire', text: 'Une minute : votre entreprise, vos coordonnées et ce qui vous préoccupe.', Icon: Pencil },
  { n: '02', title: 'Nous fixons le créneau', text: "Nous vous écrivons sous 48 h ouvrées pour convenir de 30 minutes en visio.", Icon: Calendar },
  { n: '03', title: 'Vous savez par où commencer', text: 'Vos obligations, vos trois priorités et une synthèse écrite.', Icon: Check },
];

const FAQ = [
  {
    q: "C'est vraiment gratuit ?",
    a: 'Oui. Le pré-diagnostic est offert et sans engagement. Si vous souhaitez aller plus loin, nous vous adressons un devis ; vous restez libre de ne pas y donner suite.',
  },
  {
    q: 'Que dois-je préparer ?',
    a: "Rien d'obligatoire. Si vous les avez sous la main : votre effectif, vos principaux clients et les documents existants (registre RGPD, document unique, règlement intérieur…).",
  },
  {
    q: 'Mes informations restent-elles confidentielles ?',
    a: "Oui. Ce que vous nous confiez sert uniquement à préparer l'échange ; rien n'est cédé ni publié.",
  },
  {
    q: 'Est-ce une consultation juridique ?',
    a: "Non. Equimarge intervient en audit et en accompagnement opérationnel. Lorsqu'une question relève du conseil juridique, nous vous orientons vers un avocat.",
  },
];

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="lp">
      <section className="hero">
        <div className="rise">
          <span className="badge"><span className="badge-dot" />Offert aux dirigeants de PME</span>
          <h1>
            Faites le point sur votre <span className="grad-text">conformité</span> en 30&nbsp;minutes
          </h1>
          <p className="lead">
            Un pré-diagnostic offert, en visio, avec un spécialiste de l'audit et de la gestion des risques : RGPD, droit
            social, procédures internes, anticorruption, anti-blanchiment. Vous repartez avec vos obligations et vos trois
            priorités.
          </p>
          <div className="row">
            <a href="#rdv" className="btn lg">
              Réserver mon pré-diagnostic <ArrowRight size={18} />
            </a>
          </div>
          <ul className="trust">
            <li><Check size={18} />Gratuit, sans engagement</li>
            <li><Check size={18} />Confidentiel</li>
            <li><Check size={18} />Réponse sous 48&nbsp;h ouvrées</li>
          </ul>
        </div>
        <aside className="price-card featured lp-offer rise d2">
          <span className="ribbon">Offert</span>
          <h3>Pré-diagnostic conformité</h3>
          <span className="meta"><Clock size={16} />30 min, en visio</span>
          <div className="price">0&nbsp;€</div>
          <ul className="checks">
            {GAINS.map((g) => (
              <li key={g.title}><Check size={16} />{g.title}</li>
            ))}
          </ul>
          <a href="#rdv" className="btn">Choisir mon créneau</a>
        </aside>
      </section>

      <section className="section">
        <div className="section-head center">
          <span className="eyebrow">Ce que vous obtenez</span>
          <h2>30 minutes pour savoir où vous en êtes</h2>
          <p>Un échange concret, à partir de votre situation, sans jargon.</p>
        </div>
        <div className="grid3">
          {GAINS.map(({ title, text, Icon }) => (
            <article key={title} className="feature">
              <div className="feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p className="note">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head center">
          <span className="eyebrow">Les enjeux</span>
          <h2>Des obligations qui touchent aussi les PME</h2>
          <p>Contrôles, sanctions, et des clients qui demandent des preuves.</p>
        </div>
        <div className="grid3">
          {STAKES.map((s) => (
            <article key={s.source} className="feature stat">
              <b className="grad-text">{s.figure}</b>
              <p>{s.text}</p>
              <small className="note">Source : {s.source}</small>
            </article>
          ))}
        </div>
      </section>

      {TESTIMONIALS.length > 0 && (
        <section className="section">
          <div className="section-head center">
            <span className="eyebrow">Ils nous ont fait confiance</span>
            <h2>Ce qu'en disent nos clients</h2>
          </div>
          <div className="grid3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="feature quote">
                <blockquote>« {t.quote} »</blockquote>
                <figcaption><b>{t.name}</b><span className="note">{t.role}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head center">
          <span className="eyebrow">Comment ça se passe</span>
          <h2>Trois étapes, aucun engagement</h2>
        </div>
        <div className="grid3">
          {STEPS.map(({ n, title, text, Icon }) => (
            <article key={n} className="feature">
              <span className="num" aria-hidden="true">{n}</span>
              <div className="feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p className="note">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="rdv">
        <div className="section-head">
          <span className="eyebrow">Pré-diagnostic offert</span>
          <h2>Réservez votre pré-diagnostic</h2>
          <p>Une minute pour remplir, réponse sous 48&nbsp;h ouvrées. Aucun paiement, aucun engagement.</p>
        </div>
        <RequestForm kind="pre-diagnostic" userId={user?.id || null} defaultEmail={user?.email || ''} />
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Questions fréquentes</span>
          <h2>Avant de réserver</h2>
        </div>
        <div className="faq">
          {FAQ.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
