import Link from 'next/link';

export const metadata = { title: 'Confidentialité — Equimarge', alternates: { canonical: '/confidentialite' } };

export default function Page() {
  return (
    <article className="legal">
      <h1>Politique de confidentialité</h1>
      <p className="note">Dernière mise à jour : 1er novembre 2026</p>

      <h2>Responsable du traitement</h2>
      <p>Equimarge (SASU en cours de constitution), représentée par son président Ousmane DONZO, Paris, France. Contact : contact@equimarge.fr.</p>

      <h2>Données collectées, finalités et bases légales</h2>
      <ul>
        <li><b>Compte utilisateur</b> (e-mail, mot de passe chiffré) : vous donner accès à votre espace. Base légale : exécution du contrat (<Link href="/conditions-generales">conditions générales</Link>).</li>
        <li><b>Données de marge</b> (produits, prix, coûts, quantités, charges fixes) : calculer vos indicateurs. Base légale : exécution du contrat.</li>
        <li><b>Espace conformité</b> (réponses à l'auto-diagnostic, plan d'action et responsables désignés, registre des traitements, cartographie des risques) : vous fournir les outils de conformité. Base légale : exécution du contrat.</li>
        <li><b>Demandes de diagnostic et de devis</b> (entreprise, contact, domaines concernés, message) : vous recontacter et établir un devis. Base légale : mesures précontractuelles prises à votre demande. L'adresse e-mail sert aussi à limiter le nombre d'envois par heure, pour protéger le formulaire contre les abus (intérêt légitime).</li>
        <li><b>Suivi de la relation</b> (statut de la demande, notes internes, montant du devis, prochaine action) : gérer nos échanges et nos missions. Base légale : mesures précontractuelles, puis exécution du contrat.</li>
        <li>
          <b>Prospection auprès des professionnels</b> (nom, fonction, coordonnées professionnelles, entreprise) : présenter
          nos services à des entreprises dont l'activité est en lien avec eux. Les coordonnées proviennent de sources
          publiques (site de l'entreprise, annuaires et registres professionnels). Base légale : intérêt légitime. Chaque
          message indique d'où viennent vos coordonnées et vous permet de refuser tout nouvel envoi par simple réponse.
        </li>
        <li><b>Journaux techniques</b> (adresse IP, date, page demandée) : enregistrés par notre hébergeur pour faire fonctionner et sécuriser le site. Base légale : intérêt légitime.</li>
      </ul>
      <p>Aucune décision vous concernant n'est prise de manière entièrement automatisée.</p>

      <h2>Destinataires</h2>
      <p>Seul Equimarge accède à vos données. Elles ne sont ni vendues ni cédées. Nos sous-traitants techniques sont :</p>
      <ul>
        <li><b>Supabase</b> : hébergement de la base de données et des comptes, sur des serveurs situés dans l'Union européenne.</li>
        <li><b>Netlify, Inc.</b> (États-Unis) : hébergement et diffusion du site, journaux techniques.</li>
        <li><b>Resend, Inc.</b> (États-Unis) : envoi à Equimarge d'une alerte e-mail lorsqu'une demande est déposée (contenu de la demande).</li>
        <li><b>Google</b> (Gmail et Google Drive) : messagerie d'Equimarge et documents de travail, dont le suivi des prospects.</li>
        <li>
          <b>Anthropic</b> (États-Unis, assistant d'IA Claude) : tri de la messagerie, préparation de brouillons de réponse
          et de la liste des prospects. Les brouillons sont relus par Equimarge avant tout envoi.
        </li>
      </ul>
      <p>
        Les transferts hors de l'Union européenne sont encadrés par les clauses contractuelles types de la Commission
        européenne. Les polices de caractères sont servies par le site lui-même : aucune donnée n'est transmise à Google
        ou à un autre service tiers lors de votre visite.
      </p>

      <h2>Durée de conservation</h2>
      <ul>
        <li>Données du compte, de marge et de l'espace conformité : tant que le compte est actif, puis suppression sous 30 jours après sa clôture.</li>
        <li>Demandes de diagnostic ou de devis et leur suivi : 3 ans à compter du dernier échange, puis suppression automatique.</li>
        <li>Prospects : 3 ans à compter du dernier contact venant de vous. Si vous refusez nos messages, seules les données nécessaires pour ne plus vous écrire sont conservées.</li>
        <li>Documents d'une mission (devis, factures) : 10 ans, durée imposée par le Code de commerce.</li>
      </ul>

      <h2>Sécurité</h2>
      <p>
        Les échanges avec le site sont chiffrés (HTTPS), les mots de passe ne sont jamais stockés en clair, et les règles
        d'accès de la base réservent les demandes et leur suivi au seul administrateur d'Equimarge.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, de portabilité et
        d'opposition, notamment à la prospection, à tout moment et sans avoir à vous justifier. Vous pouvez aussi définir
        des directives sur le sort de vos données après votre décès. Pour exercer ces droits, ou pour clôturer votre
        compte, écrivez à contact@equimarge.fr ; nous répondons sous un mois. Vous pouvez aussi saisir la CNIL
        (www.cnil.fr).
      </p>

      <h2>Cookies</h2>
      <p>Le site utilise uniquement des cookies nécessaires à la connexion à votre espace. Aucun cookie publicitaire ni de mesure d'audience n'est déposé.</p>
    </article>
  );
}
