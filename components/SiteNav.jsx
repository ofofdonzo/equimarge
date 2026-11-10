'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// `only` : 'wide' = lien réservé à la barre des grands écrans, 'panel' = lien réservé au menu déroulant des téléphones
const LINKS = [
  { href: '/conformite', label: 'Conformité' },
  { href: '/intermediaires-assurance', label: 'Assurance' },
  { href: '/guides', label: 'Guides' },
  { href: '/#services', label: 'Autres services', only: 'wide' },
  { href: '/diagnostic', label: 'Diagnostic de marge', only: 'panel' },
  { href: '/artisans', label: 'Artisans de l’alimentation', only: 'panel' },
  { href: '/automatisation', label: 'Automatisation', only: 'panel' },
];

// Navigation de l'en-tête. Grands écrans : liens en ligne, soulignés au survol.
// Téléphones : un bouton « Menu » déroule les liens sous l'en-tête.
// `children` reçoit les boutons de connexion (AuthNav), toujours visibles.
export default function SiteNav({ children }) {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState(null);
  // Le menu se referme de lui-même au changement de page : il n'est ouvert que pour la page où il l'a été
  const open = openAt === pathname;
  const close = () => setOpenAt(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpenAt(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // L'en-tête se resserre dès que la page a défilé
  useEffect(() => {
    const onScroll = () => document.documentElement.toggleAttribute('data-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="nav-actions">
        {children}
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpenAt(open ? null : pathname)}
        >
          <span className="nav-toggle-bars" aria-hidden="true"><i /><i /></span>
          {open ? 'Fermer' : 'Menu'}
        </button>
      </div>
      <nav id="menu-principal" className={'nav' + (open ? ' open' : '')} aria-label="Navigation principale">
        <div className="nav-inner">
          {LINKS.map(({ href, label, only }, i) => (
            <Link
              key={href}
              href={href}
              className={'nav-link' + (only ? ' only-' + only : '')}
              style={{ '--i': i }}
              aria-current={pathname === href || pathname.startsWith(href + '/') ? 'page' : undefined}
              onClick={close}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
