import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpaceNav from '@/components/SpaceNav';
import Recettes from './Recettes';
import { loadRecettes } from './data';

export const metadata = { title: 'Recettes et coût matière — Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord/recettes');

  const { error, ...initial } = await loadRecettes(supabase);
  if (error) console.error('Recettes', error.message);

  return (
    <div className="stack">
      <SpaceNav current="recettes" />
      {error ? (
        <div className="panel">
          <h1>Recettes</h1>
          <p className="err">
            Les recettes ne sont pas encore disponibles sur ce site. Il faut relancer le fichier supabase/schema.sql dans
            Supabase (SQL Editor) pour créer leurs tables.
          </p>
        </div>
      ) : (
        <Recettes initial={initial} />
      )}
    </div>
  );
}
