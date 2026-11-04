import { useEffect, useState } from 'react';
import Workspace from '@/app/tableau-de-bord/conformite/Workspace';
import { loadDossier } from '@/app/tableau-de-bord/conformite/load';
import { isMission } from '@/lib/conformite.mjs';
import { SITE } from './config';
import { openUrl } from './platform';

// Dossier du client connecté : le même espace que sur le site, avec les onglets en bas de l'écran.
export default function Dossier({ supabase, requestedTab, onAccount, reloadKey }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: admin } = await supabase.rpc('is_admin');
      if (admin) return !cancelled && setState({ status: 'admin' });
      const { data: id, error } = await supabase.rpc('my_dossier');
      const loaded = !error && id ? await loadDossier(supabase, id) : null;
      if (cancelled) return;
      setState(loaded?.dossier ? { status: 'ready', ...loaded } : { status: 'error' });
    })().catch(() => !cancelled && setState({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [supabase, reloadKey]);

  if (state.status === 'loading') return <p className="note app-center">Chargement de votre dossier…</p>;
  if (state.status === 'admin') {
    return (
      <div className="panel stack">
        <h1 style={{ margin: 0 }}>Compte administrateur</h1>
        <p className="note" style={{ margin: 0 }}>
          L’application est destinée aux clients. Le poste de travail d’Equimarge s’utilise sur le site.
        </p>
        <button type="button" className="btn" onClick={() => openUrl(`${SITE}/admin`)}>Ouvrir le poste de travail</button>
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="panel stack">
        <h1 style={{ margin: 0 }}>Dossier indisponible</h1>
        <p className="note" style={{ margin: 0 }}>Vérifiez votre connexion internet, puis réessayez.</p>
      </div>
    );
  }

  const { dossier, initial, failed } = state;
  const mission = isMission(dossier);
  return (
    <div className="stack">
      <div>
        <span className="eyebrow">{mission ? `Mon dossier · ${dossier.status}` : 'Auto-diagnostic gratuit'}</span>
        <h1 style={{ margin: '4px 0 0' }}>{mission ? dossier.company || 'Votre mise en conformité' : 'Évaluez votre conformité'}</h1>
        {mission && dossier.offer && <p className="note" style={{ margin: '2px 0 0' }}>Votre mission : {dossier.offer}</p>}
      </div>
      <Workspace role="client" dossier={dossier} initial={initial} setupMissing={failed} app={{ onAccount, requestedTab }} />
    </div>
  );
}
