export const metadata = { title: 'Mentions légales — Equimarge' };

// Remplacez chaque [À COMPLÉTER] avant la mise en ligne publique.
export default function Page() {
  return (
    <article className="legal">
      <h1>Mentions légales</h1>
      <h2>Éditeur du site</h2>
      <p>
        Equimarge, [À COMPLÉTER : forme juridique, ex. entrepreneur individuel / SASU]<br />
        Responsable : [À COMPLÉTER : prénom et nom]<br />
        SIREN : [À COMPLÉTER]<br />
        Adresse : [À COMPLÉTER]<br />
        Contact : contact@equimarge.fr
      </p>
      <h2>Directeur de la publication</h2>
      <p>[À COMPLÉTER : prénom et nom]</p>
      <h2>Hébergement</h2>
      <p>
        Site : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.<br />
        Données : Supabase Inc., serveurs situés dans l'Union européenne (région choisie à la création du projet).
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>Les contenus du site (textes, logo, mise en page) sont la propriété d'Equimarge. Toute reproduction sans autorisation est interdite.</p>
      <h2>Responsabilité</h2>
      <p>
        Les calculs fournis par l'outil sont indicatifs et dépendent des données saisies par l'utilisateur. Ils ne
        remplacent pas l'avis d'un expert-comptable.
      </p>
    </article>
  );
}
