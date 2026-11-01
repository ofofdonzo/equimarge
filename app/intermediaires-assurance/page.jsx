import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import RequestForm from '@/components/RequestForm';
import { ArrowRight, ClipboardList, Database, Mail, Scale, Search, Shield, TrendUp, Users } from '@/components/icons';

export const metadata = {
  title: 'Conformité des intermédiaires d’assurance — Equimarge',
  description:
    'Audit et mise en conformité des cabinets de courtage et intermédiaires d’assurance : devoir de conseil (DDA), anti-blanchiment, RGPD et données de santé, réclamations, préparation aux contrôles de l’ACPR. Sur devis.',
  alternates: { canonical: '/intermediaires-assurance' },
};
export const dynamic = 'force-dynamic';

const OBLIGATIONS = [
  {
    Icon: ClipboardList,
    title: 'ORIAS et capacité professionnelle',
    text: 'Immatriculation, honorabilité et capacité professionnelle, responsabilité civile professionnelle et, si vous encaissez des fonds, garantie financière.',
  },
  {
    Icon: Users,
    title: 'Distribution d’assurances (DDA)',
    text: 'Devoir de conseil formalisé, information précontractuelle, gouvernance des produits et 15 heures de formation continue par an.',
  },
  {
    Icon: Search,
    title: 'Anti-blanchiment (LCB-FT)',
    text: 'Classification des risques, vigilance sur la clientèle et déclarations à Tracfin, notamment en assurance vie et capitalisation.',
  },
  {
    Icon: Database,
    title: 'Données personnelles et de santé',
    text: 'Données de santé en prévoyance et en santé, prospection, conservation des dossiers clients, échanges avec les assureurs et les plateformes.',
  },
  {
    Icon: Mail,
    title: 'Traitement des réclamations',
    text: 'Procédure écrite, accusé de réception sous 10 jours ouvrables et réponse sous 2 mois, selon la recommandation de l’ACPR.',
  },
  {
    Icon: Scale,
    title: 'Contrôles de l’ACPR',
    text: 'Un dossier de conformité documenté et à jour, prêt à être présenté en cas de contrôle.',
  },
];

const STEPS = [
  { n: '01', title: 'Audit du cabinet', text: 'Procédures, contrats, échantillon de dossiers clients et outils : nous mesurons les écarts.', Icon: Search },
  { n: '02', title: 'Plan d’action', text: 'Les écarts classés par priorité, avec un calendrier adapté à la taille du cabinet.', Icon: ClipboardList },
  { n: '03', title: 'Mise à jour', text: 'Procédures, modèles de documents et registres mis à jour avec vos équipes.', Icon: Shield },
  { n: '04', title: 'Suivi annuel', text: 'Formation, contrôles internes et mise à jour du dispositif quand la réglementation évolue.', Icon: TrendUp },
];

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="stack" style={{ gap: 88 }}>
      <section className="page-hero rise">
        <span className="badge"><span className="badge-dot" />Courtiers et intermédiaires d’assurance</span>
        <h1>
          La <span className="grad-text">conformité</span> de votre cabinet de courtage, prise en charge
        </h1>
        <p className="lead">
          Devoir de conseil, lutte contre le blanchiment, données de santé, réclamations : Equimarge audite vos pratiques,
          met vos procédures à jour et suit le dispositif avec vous. Vous transmettez les informations dans votre dossier en
          ligne, nous faisons le travail.
        </p>
        <div className="row">
          <a href="#devis" className="btn lg">Demander un devis <ArrowRight size={18} /></a>
          <a href="#obligations" className="btn ghost lg">Vos obligations</a>
        </div>
      </section>

      <section className="section" id="obligations">
        <div className="section-head">
          <span className="eyebrow">Vos obligations</span>
          <h2>Ce qu’un intermédiaire d’assurance doit pouvoir démontrer</h2>
        </div>
        <div className="grid3">
          {OBLIGATIONS.map(({ Icon, title, text }) => (
            <article key={title} className="feature domain">
              <div className="feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p className="note">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">Notre accompagnement</span>
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
          pas des consultations juridiques et n’incluent pas la rédaction de contrats ; lorsqu’une question relève du
          conseil juridique, nous vous orientons vers un avocat.{' '}
          <Link href="/conformite">Voir toute l’offre conformité</Link>
        </p>
      </section>

      <section className="section" id="devis">
        <div className="section-head">
          <span className="eyebrow">Devis</span>
          <h2>Demander un devis</h2>
          <p>Indiquez la taille du cabinet et les sujets prioritaires : nous revenons vers vous sous 48&nbsp;h ouvrées.</p>
        </div>
        <RequestForm kind="conformite" userId={user?.id || null} defaultEmail={user?.email || ''} defaultTopics={['lcbft', 'rgpd']} defaultSector="Assurance / courtage" />
      </section>
    </div>
  );
}
