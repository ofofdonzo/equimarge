import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

// Onglets de l'espace client : demandes, dossier de conformité, suivi de marge, recettes, compte.
const TABS = [
  { key: 'demandes', href: '/tableau-de-bord/demandes', label: 'Mes demandes' },
  { key: 'conformite', href: '/tableau-de-bord/conformite', label: 'Mon dossier conformité' },
  { key: 'marges', href: '/tableau-de-bord', label: 'Suivi de marge' },
  { key: 'recettes', href: '/tableau-de-bord/recettes', label: 'Recettes' },
  { key: 'compte', href: '/tableau-de-bord/compte', label: 'Mon compte' },
];

// L'administrateur qui consulte l'espace client garde un lien de retour vers son poste de travail.
export default async function SpaceNav({ current }) {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc('is_admin');
  return (
    <nav className="space-nav" aria-label="Mon espace">
      {TABS.map((t) => (
        <Link key={t.key} href={t.href} aria-current={t.key === current ? 'page' : undefined}>
          {t.label}
        </Link>
      ))}
      {isAdmin && <Link href="/admin" className="switch">Poste de travail</Link>}
    </nav>
  );
}
