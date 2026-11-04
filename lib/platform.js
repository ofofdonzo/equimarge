// Fonctions qui diffèrent entre le site et l'application mobile.
// Sur le site : le fichier s'ouvre dans l'onglet courant. L'application remplace ce module
// par mobile/src/platform.js (ouverture dans une fenêtre Safari intégrée).
export function openUrl(url) {
  window.location.assign(url);
}
