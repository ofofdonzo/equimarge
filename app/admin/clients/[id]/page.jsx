import AdminNav from '@/components/AdminNav';
import Workspace from '@/app/tableau-de-bord/conformite/Workspace';
import { loadDossier } from '@/app/tableau-de-bord/conformite/load';
import { requireAdmin, Restricted } from '../../guard';
import DossierHeader from './DossierHeader';

export const metadata = { title: 'Dossier client — Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const { id } = await params;
  const { supabase, isAdmin } = await requireAdmin(`/admin/clients/${id}`);
  if (!isAdmin) return <Restricted />;

  const valid = /^[0-9a-f-]{36}$/i.test(id);
  const loaded = valid ? await loadDossier(supabase, id) : null;
  if (!loaded?.dossier) {
    return (
      <div className="stack">
        <AdminNav current="clients" />
        <p className="err" role="alert">Dossier introuvable. Il a peut-être été supprimé.</p>
      </div>
    );
  }
  const { data: requests } = await supabase
    .from('diagnostic_requests')
    .select('id,offer,status,created_at')
    .eq('dossier_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="stack">
      <AdminNav current="clients" />
      <DossierHeader dossier={loaded.dossier} requests={requests || []} documents={loaded.initial.documents} />
      <Workspace role="admin" dossier={loaded.dossier} initial={loaded.initial} setupMissing={loaded.failed} />
    </div>
  );
}
