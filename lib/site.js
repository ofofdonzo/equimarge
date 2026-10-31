// Adresse publique du site (sans « / » final), utilisée pour le plan du site et les balises de partage.
// Elle est fixée au build (voir next.config.mjs) et ne dépend jamais de la requête : les pages publiques
// restent statiques et aucune requête ne peut injecter un autre domaine.
export function siteUrl() {
  return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}
