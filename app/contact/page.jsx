import { createClient } from '@/lib/supabase/server';
import { PRESTATIONS } from '@/components/offers';
import RequestForm from '@/components/RequestForm';

export const metadata = {
  title: 'Contact et demande de devis | Equimarge',
  description:
    'Demandez un devis pour la mise en conformité RGPD, le DPO externalisé, la conformité IA ou l’anti-blanchiment. Réponse sous 48 h ouvrées. Par e-mail : contact@equimarge.fr.',
  alternates: { canonical: '/contact' },
};
export const dynamic = 'force-dynamic';

export default async function Page(props) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Offre présélectionnée depuis la page Offres (?offre=rgpd…)
  const preselected = PRESTATIONS.some((o) => o.key === searchParams?.offre) ? [searchParams.offre] : [];

  return (
    <div className="stack" style={{ gap: 40 }}>
      <section className="page-hero">
        <h1>Contact</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          Pour un devis, remplissez le formulaire ci-dessous. Nous répondons sous 48&nbsp;h ouvrées. La demande ne vous
          engage pas.
        </p>
      </section>

      <div className="contact-direct">
        <div>
          <span className="eyebrow">E-mail</span>
          <a href="mailto:contact@equimarge.fr">contact@equimarge.fr</a>
        </div>
        <div>
          <span className="eyebrow">Téléphone</span>
          <a href="tel:+33766557340">07 66 55 73 40</a>
        </div>
        <div>
          <span className="eyebrow">Adresse</span>
          <span>Paris</span>
        </div>
      </div>

      <section className="section" id="devis">
        <div className="section-head">
          <h2>Demande de devis</h2>
        </div>
        <RequestForm
          key={preselected.join()}
          userId={user?.id || null}
          defaultEmail={user?.email || ''}
          defaultTopics={preselected}
        />
      </section>
    </div>
  );
}
