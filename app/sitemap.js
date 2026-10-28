import { siteUrl } from '@/lib/site';

// Sert /sitemap.xml : la liste des pages publiques à proposer aux moteurs de recherche.
const PAGES = ['/', '/conformite', '/diagnostic', '/mentions-legales', '/confidentialite'];

export default function sitemap() {
  const base = siteUrl();
  return PAGES.map((path) => ({ url: base + path }));
}
