import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpaceNav from '@/components/SpaceNav';
import { isMission, QUESTIONS } from '@/lib/conformite.mjs';

export const metadata = { title: 'Mon espace | Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

const DOSSIER = '/tableau-de-bord/conformite';
const frDate = (iso) => new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

// Accueil de l'espace client : ce que le client doit faire maintenant, tiré de son dossier et de ses demandes.
// Toutes les lectures passent par les règles d'accès de la base : le client ne reçoit que ses propres lignes.
export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord');

  // Dossier du client : le sien, celui qu'Equimarge a ouvert à son e-mail, ou un nouveau (auto-diagnostic)
  const { data: id } = await supabase.rpc('my_dossier');
  const [{ data: dossier }, { data: infos }, { count: unread }, { data: deliverables }, { count: answered }, { data: requests }] = await Promise.all([
    id ? supabase.from('dossiers').select('company,offer,status').eq('id', id).maybeSingle() : Promise.resolve({ data: null }),
    id
      ? supabase.from('dossier_info_requests').select('id,title,due_date').eq('dossier_id', id).eq('status', 'À fournir').order('due_date', { nullsFirst: false })
      : Promise.resolve({ data: [] }),
    id
      ? supabase.from('dossier_messages').select('id', { count: 'exact', head: true }).eq('dossier_id', id).eq('from_admin', true).is('read_at', null)
      : Promise.resolve({ count: 0 }),
    id
      ? supabase.from('dossier_documents').select('id,name,created_at').eq('dossier_id', id).eq('kind', 'Livrable').order('created_at', { ascending: false }).limit(3)
      : Promise.resolve({ data: [] }),
    id
      ? supabase.from('dossier_answers').select('question', { count: 'exact', head: true }).eq('dossier_id', id)
      : Promise.resolve({ count: 0 }),
    supabase.from('diagnostic_requests').select('id,status').eq('user_id', user.id),
  ]);

  const mission = isMission(dossier);
  const quotes = (requests || []).filter((r) => r.status === 'Devis envoyé').length;
  const open = (requests || []).filter((r) => r.status === 'Nouvelle' || r.status === 'Contactée').length;
  const total = QUESTIONS.length;
  const today = new Date().toISOString().slice(0, 10);

  // Ce que le client doit faire, du plus urgent au moins urgent
  const todo = [];
  for (const i of infos || []) {
    const late = i.due_date && i.due_date < today;
    todo.push({
      key: i.id,
      title: i.title,
      text: i.due_date ? `${late ? 'Attendue depuis le' : 'À fournir avant le'} ${frDate(i.due_date)}` : 'Question d’Equimarge',
      href: `${DOSSIER}?onglet=questions`,
      cta: 'Répondre',
      state: late ? 'bad' : 'warn',
    });
  }
  if (unread > 0) {
    todo.push({ key: 'messages', title: unread > 1 ? `${unread} nouveaux messages d’Equimarge` : 'Un nouveau message d’Equimarge', text: 'Dans la messagerie de votre dossier', href: `${DOSSIER}?onglet=messages`, cta: 'Lire', state: 'warn' });
  }
  if (quotes > 0) {
    todo.push({ key: 'devis', title: quotes > 1 ? `${quotes} devis à examiner` : 'Un devis à examiner', text: 'Envoyé par e-mail. Répondez-nous pour lancer la mission.', href: '/tableau-de-bord/demandes', cta: 'Voir', state: 'warn' });
  }
  if (!mission && (answered || 0) < total) {
    todo.push({
      key: 'diagnostic',
      title: answered ? 'Terminer votre auto-diagnostic' : 'Faire votre auto-diagnostic',
      text: answered ? `${answered} réponse${answered > 1 ? 's' : ''} sur ${total}` : `${total} questions, environ 10 minutes`,
      href: DOSSIER,
      cta: answered ? 'Continuer' : 'Commencer',
      state: 'none',
    });
  }
  if (!mission && (answered || 0) >= total && open === 0 && quotes === 0) {
    todo.push({ key: 'contact', title: 'Demander un devis', text: 'Votre auto-diagnostic est terminé. Equimarge peut réaliser les actions recommandées.', href: '/contact', cta: 'Demander', state: 'none' });
  }

  return (
    <div className="stack">
      <SpaceNav current="accueil" />
      <div>
        <span className="eyebrow">Mon espace{dossier?.company ? ` · ${dossier.company}` : ''}</span>
        <h1>À faire maintenant</h1>
      </div>

      <section className="panel">
        {todo.length ? (
          <ul className="todo-list">
            {todo.map((t) => (
              <li key={t.key}>
                <span className={'todo-dot ' + t.state} aria-hidden="true" />
                <span className="due-title">
                  <b>{t.title}</b>
                  <span className="note">{t.text}</span>
                </span>
                <Link className="btn ghost sm" href={t.href}>{t.cta}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0 }}>
            Rien à faire pour le moment. Quand Equimarge vous posera une question ou déposera un livrable, vous le verrez ici.
          </p>
        )}
      </section>

      <div className="grid2">
        <section className="panel">
          <h2>Mon dossier</h2>
          <p className="note" style={{ marginTop: 0 }}>
            {mission
              ? `${dossier.offer || 'Mission en cours'} · ${dossier.status}`
              : 'Pas encore de mission. Votre auto-diagnostic est enregistré dans votre dossier.'}
          </p>
          {deliverables?.length ? (
            <>
              <h3 className="mini">Derniers livrables</h3>
              <ul className="due-list">
                {deliverables.map((d) => (
                  <li key={d.id} style={{ gridTemplateColumns: 'minmax(0, 1fr) auto' }}>
                    <span className="due-title"><b>{d.name}</b></span>
                    <span className="note">{frDate(d.created_at)}</span>
                  </li>
                ))}
              </ul>
              <p style={{ marginBottom: 0 }}><Link href={`${DOSSIER}?onglet=livrables`}>Tous les livrables</Link></p>
            </>
          ) : (
            <p style={{ marginBottom: 0 }}><Link href={DOSSIER}>Ouvrir mon dossier</Link></p>
          )}
        </section>
        <section className="panel">
          <h2>Mes demandes</h2>
          <p className="note" style={{ marginTop: 0 }}>
            {requests?.length
              ? `${requests.length} demande${requests.length > 1 ? 's' : ''} envoyée${requests.length > 1 ? 's' : ''}${open ? `, dont ${open} en cours d’étude` : ''}.`
              : 'Aucune demande de devis pour le moment.'}
          </p>
          <p style={{ marginBottom: 0 }}>
            {requests?.length ? <Link href="/tableau-de-bord/demandes">Voir l’état de mes demandes</Link> : <Link href="/contact">Demander un devis</Link>}
          </p>
        </section>
      </div>
    </div>
  );
}
