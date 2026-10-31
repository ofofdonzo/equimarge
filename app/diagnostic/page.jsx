import { createClient } from '@/lib/supabase/server';
import { OFFERS } from '@/components/offers';
import RequestForm from '@/components/RequestForm';

export const metadata = {
  title: 'Commander un diagnostic — Equimarge',
  description:
    "Diagnostic de marge pour PME, réalisé par un spécialiste de l'audit : plusieurs formules, réponse sous 48 h ouvrées, aucun paiement à la commande.",
  alternates: { canonical: '/diagnostic' },
};
export const dynamic = 'force-dynamic';

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Formule présélectionnée depuis l'accueil (?formule=…), Essentiel par défaut
  const offer = OFFERS.some((o) => o.id === searchParams?.formule) ? searchParams.formule : 'Essentiel';

  return (
    <div className="stack" style={{ gap: 32 }}>
      <div>
        <span className="eyebrow">Pôle marges · diagnostic</span>
        <h1>Commander un diagnostic</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          Choisissez une formule et décrivez votre entreprise. Nous revenons vers vous sous 48&nbsp;h ouvrées pour fixer
          un premier rendez-vous. Aucun paiement n'est demandé à ce stade.
        </p>
      </div>
      <RequestForm kind="diagnostic" userId={user?.id || null} defaultEmail={user?.email || ''} defaultOffer={offer} />
    </div>
  );
}
