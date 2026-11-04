// Événements envoyés par la base (fonction notifier_dossier, supabase/schema.sql) et texte des notifications.
// Le texte reste volontairement général : il s'affiche sur l'écran verrouillé, il ne contient donc ni le contenu
// d'un message ni le titre d'une demande.

// Vers le client (application iPhone)
export const CLIENT_EVENTS = {
  demande: { title: 'Equimarge', body: 'Nouvelle demande d’information dans votre dossier.', tab: 'infos' },
  livrable: { title: 'Equimarge', body: 'Un nouveau document vous a été livré.', tab: 'documents' },
  message_cabinet: { title: 'Equimarge', body: 'Vous avez un nouveau message.', tab: 'messages' },
};

// Vers Equimarge (notifications du poste de travail)
const ADMIN_TEXT = {
  message_client: 'nouveau message',
  document_client: 'nouveau document déposé',
  reponse_client: 'réponse à une demande d’information',
};
export const ADMIN_EVENTS = Object.keys(ADMIN_TEXT);

export function adminMessage(event, dossier) {
  const company = String(dossier?.company || 'Un client').replace(/[\r\n]+/g, ' ').slice(0, 80);
  return {
    title: `${company} : ${ADMIN_TEXT[event]}`,
    body: 'Ouvrez le dossier pour le consulter.',
    url: `/admin/clients/${dossier.id}`,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Vérifie le corps envoyé par la base ; renvoie null s'il n'est pas reconnu.
export function parseEvent(payload) {
  const event = payload?.event;
  const dossierId = payload?.dossier_id;
  if (typeof event !== 'string') return null;
  const client = Object.hasOwn(CLIENT_EVENTS, event);
  if (!client && !ADMIN_EVENTS.includes(event)) return null;
  if (typeof dossierId !== 'string' || !UUID.test(dossierId)) return null;
  return { event, dossierId, audience: client ? 'client' : 'admin' };
}
