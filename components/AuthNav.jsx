'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from '@/components/icons';

// Boutons de connexion de l'en-tête. L'état de connexion est lu dans le navigateur,
// pour que la mise en page commune n'oblige pas le serveur à générer chaque page à la demande.
export default function AuthNav() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(undefined);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // L'administrateur va directement à son poste de travail. Le rôle est relu à chaque connexion ou
    // déconnexion : sans cela, le bouton restait sur « Mon espace » jusqu'au rechargement de la page.
    const apply = (session) => {
      setUser(session?.user ?? null);
      if (!session) return setAdmin(false);
      supabase.rpc('is_admin').then(({ data: isAdmin }) => { if (!cancelled) setAdmin(Boolean(isAdmin)); });
    };
    supabase.auth.getSession().then(({ data }) => { if (!cancelled) apply(data.session); });
    // setTimeout : un appel à la base lancé dans ce rappel bloquerait la connexion en cours
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setTimeout(() => { if (!cancelled) apply(session); }, 0));
    return () => { cancelled = true; data.subscription.unsubscribe(); };
  }, [supabase]);

  if (user) {
    return (
      <>
        <form action="/auth/deconnexion" method="post" className="logout">
          <button className="nav-link" type="submit" title="Se déconnecter">
            <LogOut size={18} />
            <span className="hide-sm">Se déconnecter</span>
          </button>
        </form>
        <Link href={admin ? '/admin' : '/tableau-de-bord'} className="btn sm">
          {admin ? 'Poste de travail' : 'Mon espace'}
        </Link>
      </>
    );
  }

  // Tant que l'état n'est pas connu, le bouton garde sa place sans s'afficher
  return (
    <Link href="/connexion" className="btn sm" style={user === undefined ? { visibility: 'hidden' } : undefined}>
      Se connecter
    </Link>
  );
}
