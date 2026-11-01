import AdminNav from '@/components/AdminNav';
import { requireAdmin, Restricted } from '../guard';
import ClientsList from './ClientsList';

export const metadata = { title: 'Dossiers clients — Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const { supabase, isAdmin } = await requireAdmin('/admin/clients');
  if (!isAdmin) return <Restricted />;

  const { data, error } = await supabase.rpc('dossier_overview');

  return (
    <div className="stack">
      <AdminNav current="clients" />
      {error ? (
        <p className="err" role="alert">
          Les dossiers clients ne sont pas encore activés : relancez le fichier supabase/schema.sql dans Supabase (SQL
          Editor), puis rechargez la page.
        </p>
      ) : (
        <ClientsList initial={data || []} />
      )}
    </div>
  );
}
