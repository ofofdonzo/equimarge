import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpaceNav from '@/components/SpaceNav';
import Dashboard from './Dashboard';

export const metadata = { title: 'Suivi de marge — Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord');

  const [{ data: products }, { data: settings }] = await Promise.all([
    supabase.from('products').select('id,name,price,cost,quantity').order('created_at').limit(500),
    supabase.from('settings').select('company,fixed_costs').eq('user_id', user.id).maybeSingle(),
  ]);

  return (
    <div className="stack">
      <SpaceNav current="marges" />
      <Dashboard
        initialProducts={(products || []).map((p) => ({ ...p, price: +p.price, cost: +p.cost, quantity: +p.quantity }))}
        initialSettings={{ company: settings?.company || '', fixed_costs: +(settings?.fixed_costs || 0) }}
        userId={user.id}
      />
    </div>
  );
}
