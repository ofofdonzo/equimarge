import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Workspace from './Workspace';
import Agents from './Agents';
import AdminNav from '@/components/AdminNav';

// Le manifeste rend le poste de travail installable (écran d'accueil de l'iPhone, appli sur ordinateur),
// ce qui permet les notifications sur iPhone.
export const metadata = {
  title: 'Poste de travail — Equimarge',
  robots: { index: false },
  manifest: '/poste.webmanifest',
  appleWebApp: { capable: true, title: 'Equimarge', statusBarStyle: 'black-translucent' },
};
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }) {
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

  const [{ data: requests, error }, { data: tracking, error: trackingError }] = await Promise.all([
    // Les 1 000 plus récentes : au-delà, la purge des 3 ans et la suppression gardent la liste courte
    supabase.from('diagnostic_requests').select('*').order('created_at', { ascending: false }).limit(1000),
    supabase.from('request_tracking').select('*'),
  ]);

  if (error) return <p className="err">Chargement impossible : {error.message}</p>;
  const { demande } = (await searchParams) || {};

  return (
    <div className="stack">
      <AdminNav current="demandes" />
      <Workspace
        initialRequests={requests || []}
        initialTracking={tracking || []}
        initialSelected={typeof demande === 'string' && (requests || []).some((r) => r.id === demande) ? demande : null}
        setupMissing={Boolean(trackingError)}
      >
        <Agents />
      </Workspace>
    </div>
  );
}
