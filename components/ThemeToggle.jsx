'use client';
import { useSyncExternalStore } from 'react';

const EVENT = 'equimarge:theme';
const read = () => (document.documentElement.dataset.theme === 'nuit' ? 'nuit' : 'clair');
const subscribe = (cb) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

// Bascule entre le thème clair (par défaut) et le thème nuit. Le choix est gardé sur l'appareil ;
// le réglage clair/sombre du téléphone ne change rien tant que le visiteur n'a pas touché ce bouton.
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => 'clair');

  function toggle() {
    const next = theme === 'nuit' ? 'clair' : 'nuit';
    if (next === 'nuit') document.documentElement.dataset.theme = 'nuit';
    else delete document.documentElement.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'nuit' ? '#131C26' : '#D5DFE8');
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Stockage indisponible (navigation privée) : le choix vaut pour la page en cours
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-pressed={theme === 'nuit'}>
      {theme === 'nuit' ? 'Passer au thème clair' : 'Passer au thème nuit'}
    </button>
  );
}
