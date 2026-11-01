import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { AUTOMATION } from '@/components/offers';
import RequestForm from '@/components/RequestForm';
import { ArrowRight, Check, FLOOR_ICONS, Layers, Search, Shield, TrendUp } from '@/components/icons';

export const metadata = {
  title: 'Automatisation par agents IA pour PME — Equimarge',
  description:
    'Des agents IA qui traitent les tâches répétitives de votre PME : mails et appels manqués, factures et relances, planning et achats, avec un rapport de cinq lignes chaque soir. Sur devis.',
  alternates: { canonical: '/automatisation' },
};
export const dynamic = 'force-dynamic';

const STEPS = [
  { n: '01', title: 'Repérage', text: 'Nous listons ce qui se répète chaque jour chez vous et le temps que cela vous coûte.', Icon: Search },
  { n: '02', title: 'Premier étage', text: 'Un premier agent sur la tâche la plus lourde, testé avec vous pendant deux semaines.', Icon: Layers },
  { n: '03', title: 'Étages suivants', text: 'Factures, planning, achats : un étage de plus quand le précédent tourne seul.', Icon: TrendUp },
  { n: '04', title: 'Supervision', text: 'Le superviseur contrôle les agents et vous écrit chaque soir. Vous gardez la main.', Icon: Shield },
];

const GUARANTEES = [
  "Rien n'est envoyé ni payé sans votre validation : les agents préparent, vous décidez.",
  'Vos données restent dans vos outils (messagerie, agenda, logiciel de facturation) ; les services d’IA utilisés et le lieu de traitement sont indiqués avant la mise en place.',
  'Un contrat de sous-traitance (article 28 du RGPD) est signé avec vous avant tout accès à vos données.',
  'Chaque agent est cadré par écrit : ce qu’il peut faire, ce qu’il ne fait jamais.',
  'Les personnes qui échangent avec un agent sont informées qu’il s’agit d’une IA, comme l’exige le règlement européen sur l’IA.',
];

// Les étages, du haut vers le bas, comme un immeuble
function Building() {
  const floors = [...AUTOMATION].reverse();
  return (
    <div className="building rise d2" aria-hidden="true">
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
        <div className="rise">
          <span className="badge"><span className="badge-dot" />Pôle automatisation · agents IA</span>
          <h1>
            Votre entreprise se construit <span className="grad-text">étage par étage</span>
          </h1>
          <p className="lead">
            On ne commence pas par le haut. On commence par ce qui se répète tous les jours : les mails, les messages
            et les appels manqués, les factures et les relances, le planning et les achats. Tout en haut, un agent
            surveille les autres et vous envoie cinq lignes chaque soir.
          </p>
          <div className="row">
            <a href="#devis" className="btn lg">
              Demander un devis <ArrowRight size={18} />
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
          <span className="eyebrow">Les étages</span>
          <h2>Ce que les agents prennent en charge</h2>
        </div>
        <div className="grid2">
          {AUTOMATION.map((d) => {
            const Icon = FLOOR_ICONS[d.key];
            return (
              <article key={d.key} className="feature domain">
                <div className="feature-icon"><Icon size={22} /></div>
                <span className="eyebrow">{d.floor}</span>
                <h3>{d.id}</h3>
                <p className="note">{d.intro}</p>
                <ul className="checks">
                  {d.items.map((i) => (
                    <li key={i}><Check size={16} />{i}</li>
                  ))}
                </ul>
                <Link href={`/automatisation?etage=${d.key}#devis`} className="domain-link">
                  Demander un devis <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Notre démarche</span>
          <h2>Un étage à la fois</h2>
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
        <div className="panel callout">
          <h3 style={{ marginTop: 0 }}>Vous gardez la main</h3>
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
          <span className="eyebrow">Devis</span>
          <h2>Demander un devis d’automatisation</h2>
          <p>Cochez ce qui vous prend le plus de temps : nous revenons vers vous sous 48&nbsp;h ouvrées. Aucun engagement à ce stade.</p>
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
