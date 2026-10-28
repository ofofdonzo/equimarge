export const metadata = { title: 'Confidentialité — Equimarge', alternates: { canonical: '/confidentialite' } };

export default function Page() {
  return (
    <article className="legal">
      <h1>Politique de confidentialité</h1>
      <p className="note">Dernière mise à jour : [À COMPLÉTER : date de mise en ligne]</p>

      <h2>Responsable du traitement</h2>
      <p>Equimarge, [À COMPLÉTER : nom et adresse du responsable], contact@equimarge.fr.</p>

      <h2>Données collectées et finalités</h2>
      <ul>
        <li><b>Compte utilisateur</b> (e-mail, mot de passe chiffré) : vous donner accès à votre espace. Base légale : exécution du contrat.</li>
        <li><b>Données de marge</b> (produits, prix, coûts, quantités, charges fixes) : calculer vos indicateurs. Base légale : exécution du contrat.</li>
        <li><b>Demandes de diagnostic et de devis</b> (entreprise, contact, domaines concernés, message) : vous recontacter et établir un devis. Base légale : votre consentement et mesures précontractuelles.</li>
      </ul>

      <h2>Destinataires</h2>
      <p>Seul Equimarge accède à vos données. Elles ne sont ni vendues ni cédées. Nos sous-traitants techniques sont Supabase (hébergement de la base, UE) et Netlify (hébergement du site).</p>

      <h2>Durée de conservation</h2>
      <ul>
        <li>Données du compte et de marge : tant que le compte est actif, puis suppression sous 30 jours après sa clôture.</li>
        <li>Demandes de diagnostic ou de devis sans suite : 3 ans à compter du dernier contact.</li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, de portabilité et
        d'opposition. Écrivez à contact@equimarge.fr ; nous répondons sous un mois. Vous pouvez aussi saisir la CNIL
        (www.cnil.fr).
      </p>

      <h2>Cookies</h2>
      <p>Le site utilise uniquement des cookies nécessaires à la connexion à votre espace. Aucun cookie publicitaire ni de mesure d'audience n'est déposé.</p>
    </article>
  );
}
