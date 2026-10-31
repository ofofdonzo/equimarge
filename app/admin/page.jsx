import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Workspace from './Workspace';

// Le manifeste rend le poste de travail installable (écran d'accueil de l'iPhone, appli sur ordinateur),
// ce qui permet les notifications sur iPhone.
export const metadata = {
  title: 'Poste de travail — Equimarge',
  robots: { index: false },
  manifest: '/poste.webmanifest',
  appleWebApp: { capable: true, title: 'Equimarge', statusBarStyle: 'black-translucent' },
};
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

  const [{ data: requests, error }, { data: tracking, error: trackingError }] = await Promise.all([
    supabase.from('diagnostic_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('request_tracking').select('*'),
  ]);

  if (error) return <p className="err">Chargement impossible : {error.message}</p>;

  return (
    <Workspace
      initialRequests={requests || []}
      initialTracking={tracking || []}
      setupMissing={Boolean(trackingError)}
    />
  );
}
