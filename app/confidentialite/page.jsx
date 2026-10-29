export const metadata = { title: 'Confidentialité — Equimarge', alternates: { canonical: '/confidentialite' } };

export default function Page() {
  return (
    <article className="legal">
      <h1>Politique de confidentialité</h1>
      <p className="note">Dernière mise à jour : 29 octobre 2026</p>

      <h2>Responsable du traitement</h2>
      <p>Equimarge (SASU en cours de constitution), représentée par son président Ousmane DONZO, Paris, France. Contact : contact@equimarge.fr.</p>

      <h2>Données collectées et finalités</h2>
      <ul>
        <li><b>Compte utilisateur</b> (e-mail, mot de passe chiffré) : vous donner accès à votre espace. Base légale : exécution du contrat.</li>
        <li><b>Données de marge</b> (produits, prix, coûts, quantités, charges fixes) : calculer vos indicateurs. Base légale : exécution du contrat.</li>
        <li><b>Demandes de diagnostic, de pré-diagnostic et de devis</b> (entreprise, contact, domaines concernés, message) : vous recontacter et établir un devis. Si vous arrivez par l'une de nos publicités, la demande indique aussi laquelle (paramètres du lien : source, campagne, publicité), pour savoir quelles publicités sont utiles. Base légale : votre consentement et mesures précontractuelles.</li>
      </ul>

      <h2>Destinataires</h2>
      <p>Seul Equimarge accède à vos données. Elles ne sont ni vendues ni cédées. Nos sous-traitants techniques sont Supabase (hébergement de la base, UE) et Netlify (hébergement du site). Si vous acceptez les cookies publicitaires, Meta reçoit des données sur votre visite (voir ci-dessous) ; le contenu de vos demandes ne lui est jamais transmis.</p>

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

      <h2 id="cookies">Cookies et pixel Meta</h2>
      <p>Les cookies nécessaires à la connexion à votre espace sont déposés sans demander votre accord : le site ne fonctionne pas sans eux.</p>
      <p>
        Avec votre accord seulement, le site charge le pixel Meta (Facebook, Instagram) pour mesurer l'efficacité de nos
        publicités : combien de visiteurs arrivent d'une publicité et combien envoient une demande. Sans accord, il n'est
        pas chargé.
      </p>
      <ul>
        <li><b>Données transmises à Meta</b> : pages consultées, envoi d'une demande (sans son contenu), adresse IP, navigateur et identifiants des cookies du pixel (_fbp, _fbc).</li>
        <li><b>Responsables</b> : Equimarge et Meta Platforms Ireland Ltd sont responsables conjoints de la collecte et de la transmission de ces données ; Meta est seul responsable de l'usage qu'il en fait ensuite (voir la politique de confidentialité de Meta). Meta peut transférer ces données aux États-Unis, dans le cadre du Data Privacy Framework UE–États-Unis.</li>
        <li><b>Base légale</b> : votre consentement.</li>
        <li><b>Durée</b> : les cookies du pixel expirent au bout de 90 jours. Votre choix, accord ou refus, est conservé 6 mois dans votre navigateur, puis redemandé.</li>
      </ul>
      <p>Vous pouvez accepter, refuser ou retirer votre accord à tout moment avec le lien « Gérer les cookies » en bas de chaque page. Refuser ne change rien à l'utilisation du site.</p>
    </article>
  );
}
