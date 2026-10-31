export const metadata = { title: 'Confidentialité — Equimarge', alternates: { canonical: '/confidentialite' } };

export default function Page() {
  return (
    <article className="legal">
      <h1>Politique de confidentialité</h1>
      <p className="note">Dernière mise à jour : 31 octobre 2026</p>

      <h2>Responsable du traitement</h2>
      <p>Equimarge (SASU en cours de constitution), représentée par son président Ousmane DONZO, Paris, France. Contact : contact@equimarge.fr.</p>

      <h2>Données collectées et finalités</h2>
      <ul>
        <li><b>Compte utilisateur</b> (e-mail, mot de passe chiffré) : vous donner accès à votre espace. Base légale : exécution du contrat.</li>
        <li><b>Données de marge</b> (produits, prix, coûts, quantités, charges fixes) : calculer vos indicateurs. Base légale : exécution du contrat.</li>
        <li><b>Demandes de diagnostic et de devis</b> (entreprise, contact, domaines concernés, message) : vous recontacter et établir un devis. Base légale : votre consentement et mesures précontractuelles. L'adresse e-mail sert aussi à limiter le nombre d'envois par heure, pour protéger le formulaire contre les abus.</li>
        <li><b>Journaux techniques</b> (adresse IP, date, page demandée) : enregistrés par notre hébergeur pour faire fonctionner et sécuriser le site. Base légale : intérêt légitime.</li>
      </ul>

      <h2>Destinataires</h2>
      <p>Seul Equimarge accède à vos données. Elles ne sont ni vendues ni cédées. Nos sous-traitants techniques sont :</p>
      <ul>
        <li><b>Supabase</b> : hébergement de la base de données et des comptes, sur des serveurs situés dans l'Union européenne.</li>
        <li>
          <b>Netlify, Inc.</b> (États-Unis) : hébergement et diffusion du site. Netlify traite les journaux techniques ;
          ce transfert hors de l'Union européenne est encadré par les clauses contractuelles types de la Commission
          européenne.
        </li>
      </ul>
      <p>Les polices de caractères sont servies par le site lui-même : aucune donnée n'est transmise à Google ou à un autre service tiers lors de votre visite.</p>

      <h2>Durée de conservation</h2>
      <ul>
        <li>Données du compte et de marge : tant que le compte est actif, puis suppression sous 30 jours après sa clôture.</li>
        <li>Demandes de diagnostic ou de devis : 3 ans à compter du dernier échange, puis suppression automatique.</li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, de portabilité et
        d'opposition. Pour les exercer, ou pour clôturer votre compte, écrivez à contact@equimarge.fr ; nous répondons
        sous un mois. Vous pouvez aussi saisir la CNIL
        (www.cnil.fr).
      </p>

      <h2>Cookies</h2>
      <p>Le site utilise uniquement des cookies nécessaires à la connexion à votre espace. Aucun cookie publicitaire ni de mesure d'audience n'est déposé.</p>
    </article>
  );
}
