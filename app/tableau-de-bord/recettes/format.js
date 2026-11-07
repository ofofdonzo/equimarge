// Mise en forme des montants et pourcentages du module « Recettes »

export const eur = (n, digits = 2) =>
  Number.isFinite(n)
    ? n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits })
    : '–';

export const pct = (n, digits = 0) =>
  Number.isFinite(n) ? (n * 100).toLocaleString('fr-FR', { maximumFractionDigits: digits }) + ' %' : '–';

export const num = (n, digits = 4) => (Number.isFinite(n) ? n.toLocaleString('fr-FR', { maximumFractionDigits: digits }) : '–');

// Valeur affichée dans un champ de saisie : virgule décimale (« 1,2 » et non « 1.2 »)
export const fr = (n) => String(n).replace('.', ',');

export const perUnit = (unit) => (unit === 'pièce' ? '/ pièce' : `/ ${unit}`);

export const date = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export const STATUS = {
  ok: ['ok', "Dans l'objectif"],
  warn: ['warn', 'Proche'],
  bad: ['bad', "Sous l'objectif"],
  none: ['none', 'À compléter'],
};
