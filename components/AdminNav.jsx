import Link from 'next/link';

// Navigation du poste de travail : les demandes reçues, puis les dossiers clients.
const TABS = [
  { key: 'demandes', href: '/admin', label: 'Demandes' },
  { key: 'clients', href: '/admin/clients', label: 'Dossiers clients' },
];

export default function AdminNav({ current }) {
  return (
    <nav className="space-nav" aria-label="Poste de travail">
      {TABS.map((t) => (
        <Link key={t.key} href={t.href} aria-current={t.key === current ? 'page' : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
