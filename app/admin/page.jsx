import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import RequestsTable from './RequestsTable';

export const metadata = { title: 'Demandes de diagnostic — Equimarge' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = createClient();
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

  const { data: requests, error } = await supabase
    .from('diagnostic_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="stack">
      <div>
        <span className="eyebrow">Administration</span>
        <h1>Demandes de diagnostic</h1>
        <p className="note">{requests?.length || 0} demande(s). Changez le statut au fil de vos échanges avec le client.</p>
      </div>
      {error ? <p className="err">Chargement impossible : {error.message}</p> : <RequestsTable initial={requests || []} />}
    </div>
  );
}
