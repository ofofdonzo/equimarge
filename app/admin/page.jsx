import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RequestsTable from './RequestsTable';

export const metadata = { title: 'Demandes — Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;
const COLUMNS = 'id,created_at,company,offer,contact_name,email,status,siren,sector,revenue_band,phone,availability,user_id,topics,message';

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams?.page, 10) || 1);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/admin');

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) {
    return (
      <div className="panel">
        <h1>Accès réservé</h1>
        <p className="note">Cette page est réservée à l'administrateur d'Equimarge.</p>
      </div>
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data: requests, error, count } = await supabase
    .from('diagnostic_requests')
    .select(COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  const pages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  return (
    <div className="stack">
      <div>
        <span className="eyebrow">Administration</span>
        <h1>Demandes de diagnostic et de devis</h1>
        <p className="note">
          {count || 0} demande(s). Changez le statut au fil de vos échanges avec le client. Les demandes sans échange
          depuis 3 ans sont supprimées automatiquement.
        </p>
      </div>
      {error ? <p className="err">Chargement impossible : {error.message}</p> : <RequestsTable key={page} initial={requests || []} />}
      {pages > 1 && (
        <nav className="row" aria-label="Pages" style={{ justifyContent: 'space-between' }}>
          {page > 1 ? <Link className="btn ghost sm" href={`/admin?page=${page - 1}`}>Plus récentes</Link> : <span />}
          <span className="note">Page {page} sur {pages}</span>
          {page < pages ? <Link className="btn ghost sm" href={`/admin?page=${page + 1}`}>Plus anciennes</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
