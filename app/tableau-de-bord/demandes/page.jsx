import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpaceNav from '@/components/SpaceNav';
import { poleOf } from '@/components/offers';

export const metadata = { title: 'Mes demandes | Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

// Ce que le client lit pour chaque étape du traitement de sa demande par Equimarge
const STEPS = {
  Nouvelle: { label: 'Reçue', state: 'none', text: 'Nous vous répondons sous 48 h ouvrées.' },
  Contactée: { label: 'En cours d’étude', state: 'warn', text: 'Nous avons pris contact avec vous.' },
  'Devis envoyé': { label: 'Devis envoyé', state: 'warn', text: 'Le devis vous a été envoyé par e-mail.' },
  Gagnée: { label: 'Acceptée', state: 'ok', text: 'La mission est lancée.' },
  Perdue: { label: 'Classée', state: 'none', text: 'Cette demande est close.' },
};

const NEW = [
  { href: '/contact', title: 'Demande de devis', text: 'Mise en conformité RGPD, DPO externalisé, conformité IA, anti-blanchiment.' },
];

function subject(r) {
  const pole = poleOf(r.offer);
  if (pole === 'Marges') return `Diagnostic de marge ${r.offer}`;
  return pole === 'Automatisation' ? 'Devis d’automatisation' : 'Devis de mise en conformité';
}

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord/demandes');

  const { data: requests, error } = await supabase
    .from('diagnostic_requests')
    .select('id,offer,topics,company,status,created_at,dossier_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="stack">
      <SpaceNav current="demandes" />
      <div>
        <span className="eyebrow">Mon espace</span>
        <h1>Vos demandes</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          Chaque demande envoyée à Equimarge depuis votre compte apparaît ici, avec son état d’avancement.
        </p>
      </div>

      {error && <p className="err" role="alert">Vos demandes n’ont pas pu être chargées. Rechargez la page.</p>}

      <section className="panel">
        <h2>Suivi</h2>
        {requests?.length ? (
          <ul className="due-list">
            {requests.map((r) => {
              const step = STEPS[r.status] || STEPS.Nouvelle;
              return (
                <li key={r.id}>
                  <span className="due-date">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                  <span className="due-title">
                    <b>{subject(r)}</b>
                    <span className="note">
                      {[r.company, r.topics?.length ? r.topics.join(', ') : null, step.text].filter(Boolean).join(' · ')}
                      {r.dossier_id && r.status === 'Gagnée' && <> <Link href="/tableau-de-bord/conformite">Ouvrir mon dossier</Link></>}
                    </span>
                  </span>
                  <span className={'pill ' + step.state}>{step.label}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="note" style={{ margin: 0 }}>Vous n’avez pas encore envoyé de demande. Choisissez ci-dessous ce dont vous avez besoin.</p>
        )}
      </section>

      <section>
        <h2>Faire une nouvelle demande</h2>
        <ul className="linklist">
          {NEW.map(({ href, title, text }) => (
            <li key={href}>
              <Link href={href}><b>{title}</b><span>{text}</span></Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
