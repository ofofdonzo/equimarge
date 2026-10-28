import { siteUrl } from '@/lib/site';

// Sert /robots.txt : les moteurs de recherche peuvent tout lire sauf les espaces privés.
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/tableau-de-bord', '/admin', '/auth/'] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
