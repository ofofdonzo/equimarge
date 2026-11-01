import Link from 'next/link';

export const metadata = { title: 'Mentions légales — Equimarge', alternates: { canonical: '/mentions-legales' } };

// Société en cours de constitution : après l'immatriculation, remplacer « en cours de constitution »,
// ajouter l'adresse complète du siège, le SIREN, le capital social, « RCS Paris » et le n° de TVA intracommunautaire.
export default function Page() {
  return (
    <article className="legal">
      <h1>Mentions légales</h1>
      <h2>Éditeur du site</h2>
      <p>
        Equimarge, société par actions simplifiée unipersonnelle (SASU) en cours de constitution<br />
        Président : Ousmane DONZO<br />
        Siège : Paris, France<br />
        SIREN : en cours d'attribution<br />
        Téléphone : <a href="tel:+33766557340">07 66 55 73 40</a><br />
        Contact : <a href="mailto:contact@equimarge.fr">contact@equimarge.fr</a>
      </p>
      <h2>Directeur de la publication</h2>
      <p>Ousmane DONZO, président</p>
      <h2>Hébergement</h2>
      <p>
        Site : Netlify, Inc., 101 2nd Street, San Francisco, CA 94105, États-Unis, téléphone : +1 415 691 1573.<br />
        Données : Supabase, 65 Chulia Street #38-02/03, OCBC Centre, Singapour 049513 ; serveurs situés dans l'Union
        européenne (région choisie à la création du projet).
      </p>
      <h2>Activité</h2>
      <p>
        Audit et accompagnement des entreprises en conformité, diagnostic de marge et automatisation, réservés aux
        professionnels. Conditions d'utilisation et de vente : voir les <Link href="/conditions-generales">conditions générales</Link>.
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
