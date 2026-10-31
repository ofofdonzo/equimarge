import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Shield } from '@/components/icons';
import Dashboard from './Dashboard';

export const metadata = { title: 'Mon espace — Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord');

  const [{ data: products }, { data: settings }, { data: requests }, { data: isAdmin }] = await Promise.all([
    supabase.from('products').select('id,name,price,cost,quantity').order('created_at').limit(500),
    supabase.from('settings').select('company,fixed_costs').eq('user_id', user.id).maybeSingle(),
    supabase.from('diagnostic_requests').select('id,offer,status,created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.rpc('is_admin'),
  ]);

  return (
    <div className="stack">
      {isAdmin && (
        <div className="panel callout row" style={{ justifyContent: 'space-between' }}>
          <span className="row" style={{ gap: 10 }}><Shield /> Vous êtes administrateur.</span>
          <Link href="/admin" className="btn sm">Ouvrir mon poste de travail</Link>
        </div>
      )}
      <Dashboard
        initialProducts={(products || []).map((p) => ({ ...p, price: +p.price, cost: +p.cost, quantity: +p.quantity }))}
        initialSettings={{ company: settings?.company || '', fixed_costs: +(settings?.fixed_costs || 0) }}
        email={user.email}
        userId={user.id}
      />
      {requests && requests.length > 0 && (
        <div className="panel">
          <h2>Mes demandes</h2>
          <div className="scroll">
            <table>
              <thead>
                <tr><th>Date</th><th>Demande</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>{r.offer}</td>
                    <td><span className="pill">{r.status}</span></td>
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
