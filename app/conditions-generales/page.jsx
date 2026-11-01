import Link from 'next/link';

export const metadata = { title: 'Conditions générales — Equimarge', alternates: { canonical: '/conditions-generales' } };

// Conditions générales d'utilisation de l'espace gratuit et de vente des prestations, entre professionnels.
// Modèle à faire relire avant la première vente, puis à compléter après l'immatriculation (voir mentions légales).
export default function Page() {
  return (
    <article className="legal">
      <h1>Conditions générales</h1>
      <p className="note">Dernière mise à jour : 1er novembre 2026</p>

      <h2>1. Objet</h2>
      <p>
        Ces conditions régissent l'utilisation de l'espace gratuit de suivi de marge et la vente des prestations
        d'Equimarge (diagnostic de marge, mise en conformité, automatisation). Les services sont réservés aux
        professionnels : entreprises, associations et organismes publics. Ils ne s'adressent pas aux consommateurs.
      </p>

      <h2>2. Espace gratuit</h2>
      <ul>
        <li>L'accès est gratuit et nécessite un compte. Vous êtes responsable de vos identifiants et des données que vous saisissez.</li>
        <li>L'espace comprend un auto-diagnostic de conformité gratuit et un outil de suivi de marge. Pendant une mission, il donne accès au dossier partagé avec Equimarge : demandes d'informations, dépôt de documents, livrables, plan d'action, registre des traitements et cartographie des risques, exportables vers Excel.</li>
        <li>Les calculs sont indicatifs et dépendent de vos saisies. Ils ne remplacent pas l'avis d'un expert-comptable.</li>
        <li>Les outils de conformité aident à organiser votre démarche. Ils ne constituent pas une consultation juridique et ne garantissent pas la conformité de votre entreprise, qui reste responsable de ses obligations.</li>
        <li>L'outil est fourni sans garantie de disponibilité permanente. Equimarge peut suspendre un compte utilisé de manière abusive.</li>
        <li>Vous pouvez clôturer votre compte à tout moment en écrivant à contact@equimarge.fr ; vos données sont alors supprimées sous 30 jours.</li>
      </ul>

      <h2>3. Prestations</h2>
      <ul>
        <li>Chaque prestation payante fait l'objet d'un devis écrit précisant son contenu, son délai et son prix. La commande est ferme à la signature du devis.</li>
        <li>Equimarge s'engage à mettre en œuvre tous les moyens nécessaires à la bonne exécution de la mission (obligation de moyens). Le client fournit à temps les informations et documents demandés.</li>
        <li>
          Les missions relèvent de l'audit et de l'accompagnement opérationnel. Elles ne constituent pas des consultations
          juridiques et n'incluent pas la rédaction de contrats ou d'actes ; ces besoins sont orientés vers un avocat.
        </li>
        <li>La durée et les conditions de résiliation des prestations récurrentes (DPO externalisé, automatisation) sont fixées dans le devis.</li>
        <li>Le client transmet dans son dossier les informations et documents nécessaires à la mission, et seulement ceux-là. Il s'abstient d'y déposer des données sensibles qui ne sont pas indispensables.</li>
      </ul>

      <h2>4. Prix et paiement</h2>
      <ul>
        <li>Les prix sont indiqués en euros hors taxes. La TVA s'ajoute au taux en vigueur, sauf mention contraire sur le devis.</li>
        <li>Sauf autre délai prévu au devis, les factures sont payables à 30 jours à compter de leur date d'émission. Aucun escompte n'est accordé en cas de paiement anticipé.</li>
        <li>
          Tout retard de paiement entraîne, de plein droit, des pénalités calculées au taux appliqué par la Banque centrale
          européenne à son opération de refinancement la plus récente, majoré de 10 points, ainsi qu'une indemnité
          forfaitaire pour frais de recouvrement de 40 € (articles L441-10 et D441-5 du Code de commerce).
        </li>
      </ul>

      <h2>5. Confidentialité et données personnelles</h2>
      <ul>
        <li>Chaque partie garde confidentielles les informations reçues de l'autre pendant la mission et après sa fin.</li>
        <li>
          Lorsqu'une mission donne accès à des données personnelles du client, Equimarge agit comme sous-traitant : un
          contrat conforme à l'article 28 du RGPD est signé avant tout accès.
        </li>
        <li>Les données traitées par Equimarge pour son propre compte sont décrites dans la <Link href="/confidentialite">politique de confidentialité</Link>.</li>
      </ul>

      <h2>6. Responsabilité</h2>
      <p>
        La responsabilité d'Equimarge est limitée aux dommages directs et prouvés, dans la limite du montant payé pour la
        prestation concernée. Les décisions prises à partir des livrables d'Equimarge restent sous la responsabilité du
        client.
      </p>

      <h2>7. Propriété intellectuelle</h2>
      <p>
        Une fois la prestation payée, le client peut utiliser librement les documents livrés pour ses besoins internes.
        Equimarge conserve ses méthodes, outils et modèles.
      </p>

      <h2>8. Droit applicable et litiges</h2>
      <p>
        Ces conditions sont soumises au droit français. En cas de différend, les parties recherchent d'abord une solution
        amiable ; à défaut, le litige est porté devant les tribunaux du ressort de la cour d'appel de Paris, sauf règle
        impérative contraire.
      </p>
    </article>
  );
}
