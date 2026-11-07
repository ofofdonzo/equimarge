import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpaceNav from '@/components/SpaceNav';
import { billingEnabled, freeReads, isOpen, monthStart, priceLabel } from '@/lib/abonnement.mjs';
import { recettesPrice } from '@/lib/stripe';
import { countMonthReads } from '../recettes/data';
import AccountPanel from './AccountPanel';
import SubscriptionPanel from './SubscriptionPanel';

export const metadata = { title: 'Mon compte — Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord/compte');

  const billing = billingEnabled(process.env);
  const [{ data: isAdmin }, { data: sub }, { count }, price] = await Promise.all([
    supabase.rpc('is_admin'),
    supabase.from('subscriptions').select('status,current_period_end,cancel_at_period_end').maybeSingle(),
    billing
      ? countMonthReads(supabase, monthStart())
      : Promise.resolve({ count: 0 }),
    billing ? recettesPrice() : Promise.resolve(null),
  ]);
  const result = ['merci', 'annule'].includes(searchParams?.abonnement) ? searchParams.abonnement : null;

  return (
    <div className="stack">
      <SpaceNav current="compte" />
      <div>
        <span className="eyebrow">Mon compte</span>
        <h1>Votre compte</h1>
      </div>
      {billing && !isAdmin && (
        <SubscriptionPanel price={priceLabel(price)} sub={sub || null} used={count || 0} free={freeReads(process.env)} result={result} />
      )}
      <AccountPanel email={user.email || ''} isAdmin={Boolean(isAdmin)} subscribed={isOpen(sub)} />
    </div>
  );
}
