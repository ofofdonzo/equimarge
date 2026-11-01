import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { COMPLIANCE, OBLIGATIONS } from '@/components/offers';
import { ArrowRight, Check, ClipboardList, DOMAIN_ICONS, Search, Shield, TrendUp } from '@/components/icons';
import RequestForm from '@/components/RequestForm';

export const metadata = {
  title: 'Mise en conformité des PME — Equimarge',
  description:
    'Audit et accompagnement à la mise en conformité : RGPD, DPO externalisé, intelligence artificielle (AI Act), anti-blanchiment (LCB-FT), anticorruption (Sapin II), procédures internes, droit social. Sur devis.',
  alternates: { canonical: '/conformite' },
};
export const dynamic = 'force-dynamic';

const TOOLS = [
  'Auto-diagnostic sur six domaines, avec un score et les actions recommandées',
  'Tableau de bord dynamique : graphiques, filtres par domaine, échéances',
  "Plan d'action avec responsables, échéances et alertes de retard",
  'Registre des traitements RGPD et cartographie des risques',
  'Export vers Excel de tous vos tableaux',
];

const STEPS = [
  { n: '01', title: 'État des lieux', text: 'Entretiens et revue de vos documents pour mesurer les écarts avec vos obligations.', Icon: Search },
  { n: '02', title: "Plan d'action", text: 'Les écarts classés par priorité, avec un calendrier réaliste pour vos équipes.', Icon: ClipboardList },
  { n: '03', title: 'Mise en place', text: 'Politiques, procédures, registres et contrôles déployés avec vos équipes.', Icon: Shield },
  { n: '04', title: 'Suivi', text: "Des points réguliers pour faire vivre le dispositif et l'adapter à vos évolutions.", Icon: TrendUp },
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
      <section className="page-hero rise">
        <span className="badge"><span className="badge-dot" />Pôle conformité</span>
        <h1>
          Mettez votre entreprise <span className="grad-text">en conformité</span>, étape par étape
        </h1>
        <p className="lead">
          Audit et accompagnement pour répondre à vos obligations : RGPD et délégué à la protection des données (DPO)
          externalisé, intelligence artificielle, anti-blanchiment, anticorruption, procédures internes, droit social.
          Tarif sur devis, réponse sous 48&nbsp;h ouvrées.
        </p>
        <div className="row">
          <a href="#devis" className="btn lg">
            Demander un devis <ArrowRight size={18} />
          </a>
          <a href="#concerne" className="btn ghost lg">
            Qui est concerné ?
          </a>
        </div>
      </section>

      <section className="section" id="concerne">
        <div className="section-head">
          <span className="eyebrow">Vos obligations</span>
          <h2>Qui est concerné par quoi</h2>
          <p>Repérez votre situation, puis demandez un devis sur le domaine correspondant.</p>
        </div>
        <div className="grid2">
          {OBLIGATIONS.map((o) => {
            const Icon = DOMAIN_ICONS[o.key];
            return (
              <Link key={o.key} href={`/conformite?domaine=${o.key}#devis`} className="feature domain-card">
                <div className="feature-icon"><Icon size={22} /></div>
                <h3>{o.who}</h3>
                <p className="note">{o.what}</p>
                <span className="domain-link">Demander un devis <ArrowRight size={16} /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" id="domaines">
        <div className="section-head">
          <span className="eyebrow">Domaines d'intervention</span>
          <h2>Ce que nous mettons en place avec vous</h2>
        </div>
        <div className="grid3 grid-center">
          {COMPLIANCE.map((d) => {
            const Icon = DOMAIN_ICONS[d.key];
            return (
              <article key={d.key} className="feature domain">
                <div className="feature-icon"><Icon size={22} /></div>
                <h3>{d.id}</h3>
                <p className="note">{d.intro}</p>
                <ul className="checks">
                  {d.items.map((i) => (
                    <li key={i}><Check size={16} />{i}</li>
                  ))}
                </ul>
                <Link href={`/conformite?domaine=${d.key}#devis`} className="domain-link">
                  Demander un devis <ArrowRight size={16} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="panel callout row" style={{ justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            <span className="eyebrow">Outils gratuits</span>
            <h2 style={{ margin: '6px 0 8px' }}>Pilotez votre conformité depuis votre espace</h2>
            <ul className="checks" style={{ marginTop: 0 }}>
              {TOOLS.map((t) => (
                <li key={t}><Check size={16} />{t}</li>
              ))}
            </ul>
          </div>
          <Link href="/connexion?mode=inscription&suite=/tableau-de-bord/conformite" className="btn lg">
            Créer mon espace gratuit <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Notre démarche</span>
          <h2>Quatre étapes, à votre rythme</h2>
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
        <p className="panel note" style={{ margin: 0 }}>
          <b>À savoir :</b> Equimarge intervient en audit et en accompagnement opérationnel. Ses missions ne constituent
          pas des consultations juridiques et n'incluent pas la rédaction de contrats ; lorsqu'une question relève du
          conseil juridique, nous vous orientons vers un avocat.
        </p>
      </section>

      <section className="section" id="devis">
        <div className="section-head">
          <span className="eyebrow">Devis</span>
          <h2>Demander un devis</h2>
          <p>Décrivez votre situation : nous revenons vers vous sous 48&nbsp;h ouvrées pour en parler. Aucun engagement à ce stade.</p>
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
