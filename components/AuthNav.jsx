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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
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
        <Link href="/tableau-de-bord/conformite" className="btn sm">
          Mon espace
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
