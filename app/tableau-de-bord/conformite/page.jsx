import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpaceNav from '@/components/SpaceNav';
import { isMission } from '@/lib/conformite.mjs';
import Workspace from './Workspace';
import { loadDossier } from './load';

export const metadata = { title: 'Mon dossier conformité — Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

const STATE = { 'En cours': 'warn', Terminé: 'ok', Suspendu: 'none', 'Auto-diagnostic': 'none' };

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord/conformite');

  // Dossier du client : le sien, celui qu'Equimarge a ouvert à son e-mail, ou un nouveau (auto-diagnostic)
  const { data: id, error } = await supabase.rpc('my_dossier');
  const loaded = id ? await loadDossier(supabase, id) : null;

  if (error || !loaded?.dossier) {
    return (
      <div className="stack">
        <SpaceNav current="conformite" />
        <p className="err" role="alert">
          Votre dossier n’a pas pu être ouvert. Si vous êtes l’administrateur : relancez le fichier supabase/schema.sql dans
          Supabase (SQL Editor), puis rechargez la page.
        </p>
      </div>
    );
  }
  const { dossier, initial, failed } = loaded;
  const mission = isMission(dossier);

  return (
    <div className="stack">
      <SpaceNav current="conformite" />
      <div>
        <div className="row" style={{ gap: 8 }}>
          <span className="eyebrow">{mission ? 'Mon dossier' : 'Auto-diagnostic gratuit'}</span>
          <span className="note">{user.email}</span>
          {mission && <span className={'pill ' + STATE[dossier.status]}>{dossier.status}</span>}
        </div>
        <h1>{mission ? `Votre mise en conformité${dossier.company ? ' · ' + dossier.company : ''}` : 'Évaluez votre conformité'}</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          {mission
            ? `${dossier.offer ? dossier.offer + ' : ' : ''}répondez aux demandes d’informations, transmettez vos documents et suivez l’avancement de la mission réalisée par Equimarge.`
            : 'Répondez aux questions domaine par domaine pour obtenir votre score. Equimarge peut ensuite réaliser la mise en conformité pour vous.'}
        </p>
      </div>
      <Workspace role="client" dossier={dossier} initial={initial} setupMissing={failed} />
    </div>
  );
}
