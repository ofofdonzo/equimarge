'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const TARGETS = 'main :is(.section, .band, .cta)';

// Fait apparaître les blocs des pages publiques quand ils entrent dans l'écran.
// Sans JavaScript, ou si le visiteur a demandé moins d'animations, rien n'est masqué.
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute('data-reveal', 'in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    // Seuls les blocs encore sous l'écran sont masqués : ce qui est déjà visible ne bouge pas
    for (const el of document.querySelectorAll(TARGETS)) {
      if (el.hasAttribute('data-reveal') || el.getBoundingClientRect().top < window.innerHeight * 0.92) continue;
      el.setAttribute('data-reveal', '');
      io.observe(el);
    }
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
