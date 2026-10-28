import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { COMPLIANCE } from '@/components/offers';
import { ArrowRight, Check, ClipboardList, DOMAIN_ICONS, Search, Shield, TrendUp } from '@/components/icons';
import RequestForm from '@/components/RequestForm';

export const metadata = {
  title: 'Mise en conformité des PME — Equimarge',
  description:
    'Audit et accompagnement à la mise en conformité des PME : politiques et procédures internes, RGPD, anti-blanchiment (LCB-FT), anticorruption (Sapin II), droit social. Sur devis.',
  alternates: { canonical: '/conformite' },
};
export const dynamic = 'force-dynamic';

const STEPS = [
  { n: '01', title: 'État des lieux', text: 'Entretiens et revue de vos documents pour mesurer les écarts avec vos obligations.', Icon: Search },
  { n: '02', title: "Plan d'action", text: 'Les écarts classés par priorité, avec un calendrier réaliste pour vos équipes.', Icon: ClipboardList },
  { n: '03', title: 'Mise en place', text: 'Politiques, procédures, registres et contrôles déployés avec vos équipes.', Icon: Shield },
  { n: '04', title: 'Suivi', text: "Des points réguliers pour faire vivre le dispositif et l'adapter à vos évolutions.", Icon: TrendUp },
];

export default async function Page({ searchParams }) {
  const supabase = createClient();
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
          Audit et accompagnement pour mettre en place vos politiques et procédures internes et répondre à vos
          obligations : RGPD, anti-blanchiment, anticorruption, droit social. Tarif sur devis, réponse sous 48&nbsp;h ouvrées.
        </p>
        <div className="row">
          <a href="#devis" className="btn lg">
            Demander un devis <ArrowRight size={18} />
          </a>
          <a href="#domaines" className="btn ghost lg">
            Voir les domaines
          </a>
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
          pas des consultations juridiques ; lorsqu'une question relève du conseil juridique, nous vous orientons vers un
          avocat.
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
