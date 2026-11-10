import Link from 'next/link';
import { GUIDES } from '@/lib/guides';

export const metadata = {
  title: 'Guides conformité : RGPD, DPO, anti-blanchiment | Equimarge',
  description: 'Des guides pratiques sur le RGPD, le délégué à la protection des données et la lutte contre le blanchiment, avec les sources officielles.',
  alternates: { canonical: '/guides' },
};

export default function GuidesPage() {
  return (
    <div className="stack">
      <section className="page-hero">
        <h1>Guides</h1>
        <p className="lead">
          Ce que les textes imposent, expliqué pour un dirigeant de PME ou un cabinet de courtage. Chaque guide cite ses
          sources officielles.
        </p>
      </section>
      <ul className="linklist">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`}><b>{g.title}</b><span>{g.description}</span></Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
