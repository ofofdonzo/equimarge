import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpaceNav from '@/components/SpaceNav';
import AccountPanel from './AccountPanel';

export const metadata = { title: 'Mon compte — Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord/compte');
  const { data: isAdmin } = await supabase.rpc('is_admin');

  return (
    <div className="stack">
      <SpaceNav current="compte" />
      <div>
        <span className="eyebrow">Mon compte</span>
        <h1>Votre compte</h1>
      </div>
      <AccountPanel email={user.email || ''} isAdmin={Boolean(isAdmin)} />
    </div>
  );
}
