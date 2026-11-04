import Link from 'next/link';

export const metadata = {
  title: 'Assistance — Equimarge',
  description: 'Aide pour l’espace client et l’application iPhone Equimarge : connexion, documents, messages, notifications, suppression du compte.',
  alternates: { canonical: '/assistance' },
};

// Page d'assistance (adresse demandée par l'App Store pour l'application iPhone)
export default function Page() {
  return (
    <article className="legal">
      <h1>Assistance</h1>
      <p>
        Une question sur votre espace client ou sur l’application iPhone Equimarge ? Écrivez à{' '}
        <a href="mailto:contact@equimarge.fr">contact@equimarge.fr</a> ou appelez le <a href="tel:+33766557340">07 66 55 73 40</a>.
        Nous répondons en général sous 24 heures ouvrées.
      </p>

      <h2>Se connecter</h2>
      <p>
        Utilisez l’e-mail et le mot de passe de votre espace : ce sont les mêmes sur le site et dans l’application. Mot de
        passe oublié : sur la page <Link href="/connexion">Connexion</Link>, saisissez votre e-mail puis touchez « Mot de passe
        oublié ? ». Après avoir créé un compte dans l’application, ouvrez le lien de confirmation reçu par e-mail, puis
        revenez dans l’application pour vous connecter.
      </p>

      <h2>Répondre à une demande et transmettre un document</h2>
      <p>
        Dans l’onglet « Demandes », écrivez votre réponse et joignez un document : fichier PDF, Word, Excel, image ou photo
        prise avec l’iPhone (10 Mo au plus). Les documents sont rangés dans l’espace privé de votre dossier : seuls vous et
        Equimarge y avez accès. Le dépôt de documents et la messagerie s’ouvrent dès le début de votre mission.
      </p>

      <h2>Notifications</h2>
      <p>
        Dans l’application, ouvrez « Mon compte » puis « Activer les notifications » pour être prévenu d’une nouvelle demande,
        d’un livrable ou d’un message. Pour les couper : Réglages de l’iPhone, Notifications, Equimarge. Les notifications
        ne contiennent jamais le contenu de vos messages ni de vos documents.
      </p>

      <h2>Supprimer votre compte</h2>
      <p>
        Dans l’application ou sur le site, ouvrez « Mon compte » puis « Supprimer mon compte ». La suppression est
        immédiate. Ce qui est effacé et ce qui est conservé est détaillé dans la{' '}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </article>
  );
}
