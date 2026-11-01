import Link from 'next/link';

// Onglets de l'espace client : suivi de marge et outils de conformité.
const TABS = [
  { key: 'marges', href: '/tableau-de-bord', label: 'Marges' },
  { key: 'conformite', href: '/tableau-de-bord/conformite', label: 'Conformité' },
];

export default function SpaceNav({ current }) {
  return (
    <nav className="space-nav" aria-label="Mon espace">
      {TABS.map((t) => (
        <Link key={t.key} href={t.href} aria-current={t.key === current ? 'page' : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
