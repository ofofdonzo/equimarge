export const metadata = { title: 'Mentions légales — Equimarge', alternates: { canonical: '/mentions-legales' } };

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
        Site : Netlify, Inc., 101 2nd Street, San Francisco, CA 94105, États-Unis, téléphone : +1 415 691 1573.<br />
        Données : Supabase, 65 Chulia Street #38-02/03, OCBC Centre, Singapour 049513 ; serveurs situés dans l'Union
        européenne (région choisie à la création du projet).
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>Les contenus du site (textes, logo, mise en page) sont la propriété d'Equimarge. Toute reproduction sans autorisation est interdite.</p>
      <h2>Responsabilité</h2>
      <p>
        Les calculs fournis par l'outil sont indicatifs et dépendent des données saisies par l'utilisateur. Ils ne
        remplacent pas l'avis d'un expert-comptable.
      </p>
      <p>
        Les missions de mise en conformité proposées par Equimarge relèvent de l'audit et de l'accompagnement
        opérationnel. Elles ne constituent pas des consultations juridiques.
      </p>
    </article>
  );
}
