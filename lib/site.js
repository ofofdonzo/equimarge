import { headers } from 'next/headers';

// Adresse publique du site (sans « / » final), utilisée pour le plan du site et les balises de partage.
// Elle est déduite de la requête : elle suit donc le domaine branché sur Netlify
// (equimarge.netlify.app, puis equimarge.fr). La variable SITE_URL, si elle est définie, est prioritaire.
export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  const h = headers();
  const host = (h.get('x-forwarded-host') || h.get('host') || 'localhost:3000').split(',')[0].trim();
  const proto = (h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')).split(',')[0].trim();
  return `${proto}://${host}`;
}
