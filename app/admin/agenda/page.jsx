import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import { requireAdmin, Restricted } from '../guard';

export const metadata = { title: 'Agenda | Equimarge', robots: { index: false }, manifest: '/poste.webmanifest' };
export const dynamic = 'force-dynamic';

// Date du jour à Paris (AAAA-MM-JJ), décalée de `days` jours
function parisDay(days = 0) {
  const d = new Date(Date.now() + days * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
const dayLabel = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const shortDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });

const OPEN_STATUSES = ['Nouvelle', 'Contactée', 'Devis envoyé'];
const KINDS = {
  relance: { label: 'Relance', className: 'warn' },
  info: { label: 'Réponse attendue', className: '' },
  action: { label: 'Plan d’action', className: '' },
};

// Agenda du poste de travail : relances des demandes et échéances des dossiers, en retard puis jour par jour
// sur les 7 prochains jours. Les lectures passent par les règles d'accès : réservées à l'administrateur.
export default async function Page() {
  const { supabase, isAdmin } = await requireAdmin('/admin/agenda');
  if (!isAdmin) return <Restricted />;

  const today = parisDay();
  const end = parisDay(6);

  const [tracking, infos, actions, dossiers] = await Promise.all([
    supabase.from('request_tracking').select('request_id,next_action,next_action_at,amount').not('next_action_at', 'is', null).lte('next_action_at', end),
    supabase.from('dossier_info_requests').select('id,dossier_id,title,due_date').eq('status', 'À fournir').not('due_date', 'is', null).lte('due_date', end),
    supabase.from('dossier_actions').select('id,dossier_id,title,owner,due_date,status').neq('status', 'Terminé').not('due_date', 'is', null).lte('due_date', end),
    supabase.from('dossiers').select('id,company'),
  ]);
  const ids = (tracking.data || []).map((t) => t.request_id);
  const { data: requests } = ids.length
    ? await supabase.from('diagnostic_requests').select('id,company,contact_name,status').in('id', ids)
    : { data: [] };

  const failed = [tracking, infos, actions, dossiers].find((r) => r.error);
  const company = Object.fromEntries((dossiers.data || []).map((d) => [d.id, d.company || 'Dossier sans nom']));
  const reqById = Object.fromEntries((requests || []).map((r) => [r.id, r]));

  const items = [
    ...(tracking.data || [])
      .filter((t) => reqById[t.request_id] && OPEN_STATUSES.includes(reqById[t.request_id].status))
      .map((t) => {
        const r = reqById[t.request_id];
        return {
          key: 'r' + t.request_id,
          kind: 'relance',
          date: t.next_action_at,
          title: t.next_action || 'Relancer',
          who: `${r.company} · ${r.contact_name} · ${r.status}`,
          href: `/admin?demande=${t.request_id}`,
        };
      }),
    ...(infos.data || []).map((i) => ({
      key: 'i' + i.id,
      kind: 'info',
      date: i.due_date,
      title: i.title,
      who: company[i.dossier_id] || 'Dossier',
      href: `/admin/clients/${i.dossier_id}`,
    })),
    ...(actions.data || []).map((a) => ({
      key: 'a' + a.id,
      kind: 'action',
      date: a.due_date,
      title: a.title,
      who: `${company[a.dossier_id] || 'Dossier'}${a.owner ? ' · ' + a.owner : ''} · ${a.status}`,
      href: `/admin/clients/${a.dossier_id}`,
    })),
  ].sort((x, y) => x.date.localeCompare(y.date) || x.kind.localeCompare(y.kind));

  const late = items.filter((i) => i.date < today);
  const days = Array.from({ length: 7 }, (_, n) => parisDay(n)).map((d) => ({ date: d, list: items.filter((i) => i.date === d) }));

  return (
    <div className="stack">
      <AdminNav current="agenda" />
      <div>
        <span className="eyebrow">Administration</span>
        <h1>Agenda</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          Les relances de vos demandes et les échéances de vos dossiers, du {shortDate(today)} au {shortDate(end)}.
        </p>
      </div>

      {failed && <p className="err" role="alert">Une partie de l’agenda n’a pas pu être chargée : {failed.error.message}</p>}

      {late.length > 0 && (
        <section className="panel agenda-day late">
          <h2>En retard <span className="pill bad">{late.length}</span></h2>
          <AgendaList items={late} showDate />
        </section>
      )}

      {days.map(({ date, list }, n) => (
        <section key={date} className={'panel agenda-day' + (list.length ? '' : ' empty-day')}>
          <h2>{n === 0 ? 'Aujourd’hui' : n === 1 ? 'Demain' : dayLabel(date)}{n < 2 && <span className="note"> · {dayLabel(date)}</span>}</h2>
          {list.length ? <AgendaList items={list} /> : <p className="note" style={{ margin: 0 }}>Rien de prévu.</p>}
        </section>
      ))}
    </div>
  );
}

function AgendaList({ items, showDate = false }) {
  return (
    <ul className="todo-list">
      {items.map((i) => (
        <li key={i.key}>
          <span className={'todo-dot ' + (showDate ? 'bad' : KINDS[i.kind].className)} aria-hidden="true" />
          <span className="due-title">
            <b>{i.title}</b>
            <span className="note">
              {KINDS[i.kind].label} · {i.who}
              {showDate ? ` · prévu le ${shortDate(i.date)}` : ''}
            </span>
          </span>
          <Link className="btn ghost sm" href={i.href}>Ouvrir</Link>
        </li>
      ))}
    </ul>
  );
}
