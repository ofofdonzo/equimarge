import Link from 'next/link';

// Onglets de l'espace client : dossier de conformité, suivi de marge, recettes, compte.
const TABS = [
  { key: 'conformite', href: '/tableau-de-bord/conformite', label: 'Mon dossier conformité' },
  { key: 'marges', href: '/tableau-de-bord', label: 'Suivi de marge' },
  { key: 'recettes', href: '/tableau-de-bord/recettes', label: 'Recettes' },
  { key: 'compte', href: '/tableau-de-bord/compte', label: 'Mon compte' },
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
