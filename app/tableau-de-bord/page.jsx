import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Dashboard from './Dashboard';

export const metadata = { title: 'Mon espace — Equimarge' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord');

  const [{ data: products }, { data: settings }, { data: requests }, { data: isAdmin }] = await Promise.all([
    supabase.from('products').select('id,name,price,cost,quantity').order('created_at'),
    supabase.from('settings').select('company,fixed_costs').eq('user_id', user.id).maybeSingle(),
    supabase.from('diagnostic_requests').select('id,offer,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.rpc('is_admin'),
  ]);

  return (
    <div className="stack">
      {isAdmin && (
        <div className="panel row" style={{ justifyContent: 'space-between' }}>
          <span>Vous êtes administrateur.</span>
          <Link href="/admin" className="btn">Voir les demandes de diagnostic</Link>
        </div>
      )}
      <Dashboard
        initialProducts={(products || []).map((p) => ({ ...p, price: +p.price, cost: +p.cost, quantity: +p.quantity }))}
        initialSettings={{ company: settings?.company || '', fixed_costs: +(settings?.fixed_costs || 0) }}
        email={user.email}
      />
      {requests && requests.length > 0 && (
        <div className="panel">
          <h2>Mes demandes de diagnostic</h2>
          <div className="scroll">
            <table>
              <thead>
                <tr><th>Date</th><th>Formule</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>{r.offer}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
