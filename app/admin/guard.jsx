import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Pages du poste de travail : compte connecté obligatoire, contenu réservé à l'administrateur.
export async function requireAdmin(path) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/connexion?suite=${encodeURIComponent(path)}`);
  const { data: isAdmin } = await supabase.rpc('is_admin');
  return { supabase, user, isAdmin: Boolean(isAdmin) };
}

export function Restricted() {
  return (
    <div className="panel">
      <h1>Accès réservé</h1>
      <p className="note">Cette page est réservée à l'administrateur d'Equimarge.</p>
    </div>
  );
}
