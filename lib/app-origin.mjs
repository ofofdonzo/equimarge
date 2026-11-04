// Origines de l'application mobile (pages intégrées à l'appli, servies par Capacitor) :
// iPhone « capacitor://localhost » (seule plateforme publiée).
export const APP_ORIGINS = ['capacitor://localhost'];

// Une requête qui modifie des données doit venir du site lui-même ou de l'application (protection CSRF).
// Sans en-tête Origin (outil en ligne de commande), elle reste possible mais exige un jeton de session valide.
// siteHost : nom d'hôte de la requête (en-tête Host), le même que celui de la page qui a envoyé la requête.
export function originAllowed(origin, siteHost) {
  if (!origin) return true;
  if (APP_ORIGINS.includes(origin)) return true;
  try {
    const u = new URL(origin);
    return (u.protocol === 'https:' || u.hostname === 'localhost' || u.hostname === '127.0.0.1') && u.host === siteHost;
  } catch {
    return false;
  }
}

export function corsHeaders(origin, methods = 'DELETE, OPTIONS') {
  if (!APP_ORIGINS.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

// Jeton de session envoyé par l'application : « Authorization: Bearer <jeton> »
export function bearerToken(header) {
  const m = /^Bearer ([A-Za-z0-9._-]{20,4096})$/.exec(String(header || ''));
  return m ? m[1] : null;
}
