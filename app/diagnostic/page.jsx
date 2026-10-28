import { createClient } from '@/lib/supabase/server';
import DiagnosticForm from './DiagnosticForm';

export const metadata = { title: 'Commander un diagnostic — Equimarge' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="stack">
      <div>
        <span className="eyebrow">Diagnostic de marge</span>
        <h1>Commander un diagnostic</h1>
        <p className="lead">
          Choisissez une formule et décrivez votre entreprise. Nous revenons vers vous sous 48 h ouvrées pour fixer
          un premier rendez-vous. Aucun paiement n'est demandé à ce stade.
        </p>
      </div>
      <DiagnosticForm userId={user?.id || null} defaultEmail={user?.email || ''} />
    </div>
  );
}
