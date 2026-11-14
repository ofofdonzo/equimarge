import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpaceNav from '@/components/SpaceNav';
import { isMission } from '@/lib/conformite.mjs';
import Workspace from './Workspace';
import { loadDossier } from './load';

export const metadata = { title: 'Mon dossier | Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

// Onglets du dossier accessibles par l'adresse (?onglet=…), depuis l'accueil de l'espace client
const CLIENT_TAB_PARAMS = { questions: 'infos', documents: 'documents', livrables: 'livrables', messages: 'messages' };

const STATE = { 'En cours': 'warn', Terminé: 'ok', Suspendu: 'none', 'Auto-diagnostic': 'none' };

export default async function Page(props) {
  const searchParams = await props.searchParams;
  // Onglet demandé depuis l'accueil de l'espace (?onglet=questions|documents|livrables|messages)
  const initialTab = CLIENT_TAB_PARAMS[searchParams?.onglet] || null;
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
        <SpaceNav current="dossier" />
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
      <SpaceNav current="dossier" />
      <div>
        <div className="row" style={{ gap: 8 }}>
          <span className="eyebrow">{mission ? 'Mon dossier' : 'Auto-diagnostic gratuit'}</span>
          {mission && <span className={'pill ' + STATE[dossier.status]}>{dossier.status}</span>}
        </div>
        <h1>{mission ? `Mon dossier${dossier.company ? ' : ' + dossier.company : ''}` : 'Évaluez votre conformité'}</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          {mission
            ? `${dossier.offer ? dossier.offer + '. ' : ''}Répondez aux questions d’Equimarge, déposez les documents demandés, téléchargez vos livrables et échangez par message.`
            : 'Répondez aux questions domaine par domaine pour obtenir votre score. Equimarge peut ensuite réaliser la mise en conformité pour vous.'}
        </p>
      </div>
      <Workspace role="client" dossier={dossier} initial={initial} setupMissing={failed} initialTab={initialTab} />
    </div>
  );
}
