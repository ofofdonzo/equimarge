import { createClient } from '@/lib/supabase/server';
import { OFFERS } from '@/components/offers';
import DiagnosticForm from './DiagnosticForm';

export const metadata = { title: 'Commander un diagnostic — Equimarge' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Formule présélectionnée depuis l'accueil (?formule=…), Essentiel par défaut
  const offer = OFFERS.some((o) => o.id === searchParams?.formule) ? searchParams.formule : 'Essentiel';

  return (
    <div className="stack" style={{ gap: 32 }}>
      <div>
        <span className="eyebrow">Diagnostic de marge</span>
        <h1>Commander un diagnostic</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          Choisissez une formule et décrivez votre entreprise. Nous revenons vers vous sous 48 h ouvrées pour fixer
          un premier rendez-vous. Aucun paiement n'est demandé à ce stade.
        </p>
      </div>
      <DiagnosticForm userId={user?.id || null} defaultEmail={user?.email || ''} defaultOffer={offer} />
    </div>
  );
}
