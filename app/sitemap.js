import { GUIDES } from '@/lib/guides';
import { siteUrl } from '@/lib/site';

// Sert /sitemap.xml : la liste des pages publiques à proposer aux moteurs de recherche.
const PAGES = ['/', '/offres', '/auto-diagnostic', '/contact', '/guides', ...GUIDES.map((g) => `/guides/${g.slug}`), '/mentions-legales', '/conditions-generales', '/confidentialite', '/assistance'];

export default function sitemap() {
  const base = siteUrl();
  return PAGES.map((path) => ({ url: base + path }));
}
