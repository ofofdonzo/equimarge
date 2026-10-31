// Adresse du projet Supabase d'Equimarge (publique), sauf si NEXT_PUBLIC_SUPABASE_URL en désigne un autre.
// Même valeur par défaut que lib/supabase/config.js. Sert à la politique de sécurité ci-dessous.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fiqmbjjfxeyyaiilqmgc.supabase.co';

const dev = process.env.NODE_ENV !== 'production';
const supabaseOrigin = new URL(SUPABASE_URL).origin;

// Politique de sécurité du contenu : le site ne charge que ses propres fichiers et ne parle qu'à Supabase.
// 'unsafe-inline' reste nécessaire aux scripts que Next.js insère dans les pages statiques.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin} ${supabaseOrigin.replace(/^https/, 'wss')}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(dev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Adresse publique figée au moment du build : SITE_URL si elle est définie, sinon l'adresse principale
  // du site fournie par Netlify (URL : equimarge.fr une fois le domaine branché, sinon xxx.netlify.app).
  env: { SITE_URL: process.env.SITE_URL || process.env.URL || '' },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
