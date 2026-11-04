import { Browser } from '@capacitor/browser';

// Remplace lib/platform.js dans l'application : documents et pages du site s'ouvrent dans une fenêtre
// Safari intégrée (aperçu, enregistrement, partage), jamais dans la vue de l'appli.
export function openUrl(url) {
  if (!/^https:\/\//.test(String(url))) return;
  Browser.open({ url, presentationStyle: 'popover' });
}
