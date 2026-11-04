// Données fictives de démonstration : uniquement pour les captures d'écran de l'App Store
// (construction avec EQUIMARGE_DEMO=1, jamais incluses dans l'application publiée).
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const at = (offset, h = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(h, 12, 0, 0);
  return d.toISOString();
};
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

// Fonction plutôt que constantes : rien n'est calculé ni inclus dans l'appli publiée.
export function demoData() {
  const email = 'beatrice@courtage-beta.fr';
  const dossier = {
  id: id(1),
  company: 'Courtage Bêta',
  contact_name: 'Béatrice M.',
  email,
  offer: 'DPO externalisé',
  status: 'En cours',
  created_at: at(-30),
  updated_at: at(0),
  };
  const initial = {
  answers: {},
  actions: [
    { id: id(11), domain: 'rgpd', title: 'Tenir le registre des traitements', owner: 'Equimarge', due_date: day(-6), priority: 'Haute', status: 'Terminé', source: null },
    { id: id(12), domain: 'rgpd', title: 'Cartographier les sous-traitants', owner: 'Client', due_date: day(6), priority: 'Haute', status: 'En cours', source: null },
    { id: id(13), domain: 'rgpd', title: 'Procédure de réponse aux demandes de droits', owner: 'Equimarge', due_date: day(11), priority: 'Moyenne', status: 'En cours', source: null },
    { id: id(14), domain: 'lcbft', title: 'Mettre à jour la classification des risques clients', owner: 'Equimarge', due_date: day(20), priority: 'Moyenne', status: 'À faire', source: null },
    { id: id(15), domain: 'rgpd', title: 'Mentions d’information des clients', owner: 'Equimarge', due_date: day(25), priority: 'Basse', status: 'À faire', source: null },
  ],
  records: [],
  risks: [],
  infos: [
    { id: id(21), title: 'Liste de vos prestataires informatiques', details: 'Logiciel de gestion, messagerie, hébergeur du site, signature électronique. Joignez les contrats si vous les avez.', due_date: day(6), status: 'À fournir', response: '', answered_at: null, created_at: at(-1) },
    { id: id(22), title: 'Durées de conservation des dossiers sinistres', details: '', due_date: null, status: 'Validé', response: 'Cinq ans après la clôture du sinistre.', answered_at: at(-4), created_at: at(-8) },
  ],
  documents: [
    { id: id(31), info_request_id: null, kind: 'Livrable', name: 'Registre des traitements.xlsx', path: `${id(1)}/registre.xlsx`, size: 48211, created_at: at(-6) },
    { id: id(32), info_request_id: null, kind: 'Livrable', name: 'Rapport d’audit RGPD.pdf', path: `${id(1)}/audit.pdf`, size: 812004, created_at: at(-13) },
    { id: id(33), info_request_id: id(22), kind: 'Client', name: 'contrat-hebergeur.pdf', path: `${id(1)}/contrat.pdf`, size: 240118, created_at: at(-4) },
  ],
  messages: [
    { id: id(41), from_admin: true, body: 'Bonjour Béatrice, le registre des traitements est en ligne. Pouvez-vous vérifier les durées de conservation des dossiers sinistres ?', read_at: at(-1, 11), created_at: at(-1, 9) },
    { id: id(42), from_admin: false, body: 'Bonjour, c’est bien cinq ans après la clôture du sinistre. Je vous envoie la liste des prestataires cette semaine.', read_at: at(-1, 11), created_at: at(-1, 10) },
    { id: id(43), from_admin: true, body: 'Parfait, merci. J’ai ajouté la demande dans votre dossier pour la liste des prestataires.', read_at: at(0, 10), created_at: at(0, 9) },
  ],
  };
  return { email, dossier, initial };
}
