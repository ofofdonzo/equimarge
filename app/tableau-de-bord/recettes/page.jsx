import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpaceNav from '@/components/SpaceNav';
import Recettes from './Recettes';
import { countMonthReads, loadRecettes } from './data';
import { billingEnabled, freeReads, isActive, monthStart } from '@/lib/abonnement.mjs';

export const metadata = { title: 'Recettes et coût matière | Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord/recettes');

  const billing = billingEnabled(process.env);
  const [{ error, ...initial }, { data: sub }, { count }] = await Promise.all([
    loadRecettes(supabase),
    billing ? supabase.from('subscriptions').select('status').maybeSingle() : Promise.resolve({ data: null }),
    billing
      ? countMonthReads(supabase, monthStart())
      : Promise.resolve({ count: 0 }),
  ]);
  if (error) console.error('Recettes', error.message);
  // Lectures de factures gratuites du mois, quand l'abonnement est ouvert (voir lib/abonnement.mjs)
  const quota = { enabled: billing, active: isActive(sub), used: count || 0, free: freeReads(process.env) };

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
        <Recettes initial={initial} quota={quota} />
      )}
    </div>
  );
}
