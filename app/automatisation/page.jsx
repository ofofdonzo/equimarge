import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AUTOMATION } from '@/components/offers';
import RequestForm from '@/components/RequestForm';
import { Check, FLOOR_ICONS } from '@/components/icons';

export const metadata = {
  title: 'Automatisation par agents IA pour PME | Equimarge',
  description:
    'Des agents IA qui traitent les tâches répétitives de votre PME : mails et appels manqués, factures et relances, planning et achats, avec un rapport de cinq lignes chaque soir. Sur devis.',
  alternates: { canonical: '/automatisation' },
};
export const dynamic = 'force-dynamic';

const STEPS = [
  { n: '1', title: 'Repérage', text: 'Nous listons ce qui se répète chaque jour chez vous et le temps que cela vous coûte.' },
  { n: '2', title: 'Premier étage', text: 'Nous installons un premier agent sur la tâche la plus lourde et le testons avec vous pendant deux semaines.' },
  { n: '3', title: 'Étages suivants', text: 'Nous ajoutons un étage (factures, planning, achats) une fois que le précédent fonctionne sans intervention.' },
  { n: '4', title: 'Supervision', text: 'Le superviseur contrôle les agents et vous écrit chaque soir.' },
];

const GUARANTEES = [
  'Aucun message ne part et aucun paiement n’est fait sans votre validation.',
  'Vos données restent dans vos outils (messagerie, agenda, logiciel de facturation) ; les services d’IA utilisés et le lieu de traitement sont indiqués avant la mise en place.',
  'Un contrat de sous-traitance (article 28 du RGPD) est signé avec vous avant tout accès à vos données.',
  'Nous fixons par écrit ce que chaque agent peut faire et ce qui lui est interdit.',
  'Les personnes qui échangent avec un agent sont informées qu’il s’agit d’une IA, comme l’exige le règlement européen sur l’IA.',
];

// Les étages, du haut vers le bas, comme un immeuble
function Building() {
  const floors = [...AUTOMATION].reverse();
  return (
    <div className="building" aria-hidden="true">
      {floors.map((f, i) => {
        const Icon = FLOOR_ICONS[f.key];
        return (
          <div key={f.key} className={'floor' + (i === 0 ? ' top' : '')}>
            <span className="floor-icon"><Icon size={18} /></span>
            <span className="floor-text">
              <small>{f.floor}</small>
              <b>{f.id}</b>
            </span>
            <span className={'pill ' + (i === 0 ? '' : 'ok')}>{i === 0 ? '5 lignes / soir' : 'Actif'}</span>
          </div>
        );
      })}
      <div className="floor ground">Fondations : vos tâches répétitives</div>
    </div>
  );
}

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Étage présélectionné depuis une carte (?etage=factures…)
  const preselected = AUTOMATION.some((d) => d.key === searchParams?.etage) ? [searchParams.etage] : [];

  return (
    <div className="stack" style={{ gap: 88 }}>
      <section className="hero">
        <div>
          <span className="badge">Pôle automatisation : agents IA</span>
          <h1>Des agents IA pour les tâches répétitives de votre PME</h1>
          <p className="lead">
            Nous installons un agent à la fois, en commençant par ce qui se répète tous les jours : les mails, les
            messages et les appels manqués, puis les factures et les relances, le planning et les achats. Un dernier
            agent contrôle les autres et vous envoie cinq lignes chaque soir.
          </p>
          <div className="row">
            <a href="#devis" className="btn lg">
              Demander un devis
            </a>
            <a href="#etages" className="btn ghost lg">
              Voir les étages
            </a>
          </div>
          <ul className="trust">
            <li><Check size={18} />Sur devis</li>
            <li><Check size={18} />Vous validez tout envoi</li>
            <li><Check size={18} />Réponse sous 48&nbsp;h ouvrées</li>
          </ul>
        </div>
        <Building />
      </section>

      <section className="section" id="etages">
        <div className="section-head">
          <h2>Ce que les agents prennent en charge</h2>
        </div>
        <div className="grid2">
          {AUTOMATION.map((d) => {
            return (
              <article key={d.key} className="feature domain">
                <span className="eyebrow">{d.floor}</span>
                <h3>{d.id}</h3>
                <p className="note">{d.intro}</p>
                <ul className="checks">
                  {d.items.map((i) => (
                    <li key={i}><Check size={16} />{i}</li>
                  ))}
                </ul>
                <Link href={`/automatisation?etage=${d.key}#devis`} className="domain-link">
                  Demander un devis
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Un étage à la fois</h2>
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
        <div className="panel callout">
          <h3 style={{ marginTop: 0 }}>Vos garanties</h3>
          <ul className="checks" style={{ marginTop: 8 }}>
            {GUARANTEES.map((g) => (
              <li key={g}><Check size={16} />{g}</li>
            ))}
          </ul>
          <p className="note" style={{ marginBottom: 0 }}>
            Vous utilisez déjà l’IA dans votre entreprise ?{' '}
            <Link href="/conformite?domaine=ia#devis">Faites vérifier vos usages au regard de l’AI Act</Link>.
          </p>
        </div>
      </section>

      <section className="section" id="devis">
        <div className="section-head">
          <h2>Demander un devis d’automatisation</h2>
          <p>Cochez ce qui vous prend le plus de temps. Nous vous répondons sous 48&nbsp;h ouvrées. La demande ne vous engage pas.</p>
        </div>
        <RequestForm
          key={preselected.join()}
          kind="automatisation"
          userId={user?.id || null}
          defaultEmail={user?.email || ''}
          defaultTopics={preselected}
        />
      </section>
    </div>
  );
}
