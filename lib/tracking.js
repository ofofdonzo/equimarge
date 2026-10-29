// Suivi des publicités : paramètres UTM des liens de pub et événements du pixel Meta.
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

// Paramètres UTM de l'adresse de la page (ex. lien d'une publicité Meta), enregistrés avec la demande pour savoir
// quelle pub l'a apportée. Ils sont lus au moment de l'envoi : rien n'est stocké dans le navigateur.
export function readUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) utm[key] = value.slice(0, 200);
  }
  return utm;
}

// Signale une demande envoyée au pixel Meta. Sans effet tant que le visiteur n'a pas accepté les cookies.
export function trackLead(offer) {
  if (window.fbq) window.fbq('track', 'Lead', { content_name: offer });
}
