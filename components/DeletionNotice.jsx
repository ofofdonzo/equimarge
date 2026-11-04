export const DELETE_WORD = 'SUPPRIMER';

// Ce que la suppression du compte efface et conserve (page Mon compte du site et de l'application)
export default function DeletionNotice() {
  return (
    <ul className="note" style={{ margin: 0, paddingLeft: 18 }}>
      <li>Effacés immédiatement : votre compte et vos identifiants, vos appareils abonnés aux notifications, votre suivi de marge et votre auto-diagnostic.</li>
      <li>
        Si une mission a été réalisée, son dossier (demandes, documents, messages, livrables) est détaché de votre compte et
        conservé par Equimarge le temps des obligations contractuelles et comptables. Vous pouvez en demander l’effacement à{' '}
        <a href="mailto:contact@equimarge.fr">contact@equimarge.fr</a>.
      </li>
    </ul>
  );
}
