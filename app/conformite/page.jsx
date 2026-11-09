import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { COMPLIANCE, OBLIGATIONS } from '@/components/offers';
import { Check } from '@/components/icons';
import RequestForm from '@/components/RequestForm';

export const metadata = {
  title: 'Mise en conformité des PME | Equimarge',
  description:
    'Audit et accompagnement à la mise en conformité : RGPD, DPO externalisé, intelligence artificielle (AI Act), anti-blanchiment (LCB-FT), anticorruption (Sapin II), procédures internes, droit social. Sur devis.',
  alternates: { canonical: '/conformite' },
};
export const dynamic = 'force-dynamic';

const TOOLS = [
  'Auto-diagnostic gratuit sur six domaines, avec votre score',
  'Pendant la mission : nos demandes d’informations, auxquelles vous répondez en ligne',
  'Dépôt de vos documents dans un espace privé',
  'Plan d’action, registre RGPD, risques et livrables à consulter et à exporter vers Excel',
];

const STEPS = [
  { n: '1', title: 'État des lieux', text: 'Nous menons des entretiens et relisons vos documents pour mesurer les écarts avec vos obligations.' },
  { n: '2', title: "Plan d'action", text: 'Nous classons les écarts par priorité et fixons un calendrier avec vous.' },
  { n: '3', title: 'Mise en place', text: 'Nous rédigeons les politiques, les procédures et les registres, puis nous mettons les contrôles en place avec vos équipes.' },
  { n: '4', title: 'Suivi', text: 'Nous faisons le point à intervalles réguliers et mettons le dispositif à jour quand votre activité change.' },
];

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Domaine présélectionné depuis une carte (?domaine=rgpd…)
  const preselected = COMPLIANCE.some((d) => d.key === searchParams?.domaine) ? [searchParams.domaine] : [];

  return (
    <div className="stack" style={{ gap: 88 }}>
      <section className="page-hero">
        <span className="badge">Pôle conformité</span>
        <h1>Audit et mise en conformité de votre entreprise</h1>
        <p className="lead">
          Audit et accompagnement pour répondre à vos obligations : RGPD et délégué à la protection des données (DPO)
          externalisé, intelligence artificielle, anti-blanchiment, anticorruption, procédures internes, droit social.
          Tarif sur devis, réponse sous 48&nbsp;h ouvrées.
        </p>
        <div className="row">
          <a href="#devis" className="btn lg">
            Demander un devis
          </a>
          <a href="#concerne" className="btn ghost lg">
            Qui est concerné ?
          </a>
        </div>
      </section>

      <section className="section" id="concerne">
        <div className="section-head">
          <h2>Qui est concerné par quoi</h2>
          <p>Repérez votre situation, puis demandez un devis sur le domaine correspondant.</p>
        </div>
        <div className="grid2">
          {OBLIGATIONS.map((o) => {
            return (
              <Link key={o.key} href={`/conformite?domaine=${o.key}#devis`} className="feature domain-card">
                <h3>{o.who}</h3>
                <p className="note">{o.what}</p>
                <span className="domain-link">Demander un devis</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" id="domaines">
        <div className="section-head">
          <h2>Nos domaines d’intervention</h2>
        </div>
        <div className="grid3 grid-center">
          {COMPLIANCE.map((d) => {
            return (
              <article key={d.key} className="feature domain">
                <h3>{d.id}</h3>
                <p className="note">{d.intro}</p>
                <ul className="checks">
                  {d.items.map((i) => (
                    <li key={i}><Check size={16} />{i}</li>
                  ))}
                </ul>
                <Link href={`/conformite?domaine=${d.key}#devis`} className="domain-link">
                  Demander un devis
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="panel callout row" style={{ justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            <h2 style={{ margin: '6px 0 8px' }}>Votre dossier en ligne</h2>
            <ul className="checks" style={{ marginTop: 0 }}>
              {TOOLS.map((t) => (
                <li key={t}><Check size={16} />{t}</li>
              ))}
            </ul>
          </div>
          <Link href="/connexion?mode=inscription&suite=/tableau-de-bord/conformite" className="btn lg">
            Auto-diagnostic gratuit
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Déroulement d’une mission</h2>
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
        <p className="panel note" style={{ margin: 0 }}>
          <b>À savoir :</b> Equimarge intervient en audit et en accompagnement opérationnel. Ses missions ne constituent
          pas des consultations juridiques et n'incluent pas la rédaction de contrats ; lorsqu'une question relève du
          conseil juridique, nous vous orientons vers un avocat.
        </p>
      </section>

      <section className="section" id="devis">
        <div className="section-head">
          <h2>Demander un devis</h2>
          <p>Décrivez votre situation. Nous vous répondons sous 48&nbsp;h ouvrées. La demande ne vous engage pas.</p>
        </div>
        <RequestForm
          key={preselected.join()}
          kind="conformite"
          userId={user?.id || null}
          defaultEmail={user?.email || ''}
          defaultTopics={preselected}
        />
      </section>
    </div>
  );
}
