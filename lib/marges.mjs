// Calculs du tableau de bord, isolés ici pour être testés (tests/marges.test.mjs).

// Plus grande valeur acceptée par la base (colonnes numeric(12,2)).
export const MAX_AMOUNT = 9999999999.99;

// Lit une saisie (« 12,5 », « 3 ») ; renvoie null si elle n'est pas un nombre entre 0 et MAX_AMOUNT.
export function parseAmount(v) {
  const s = String(v).trim().replace(/\s/g, '').replace(',', '.');
  if (s === '') return 0;
  if (!/^\d*\.?\d*$/.test(s)) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0 && n <= MAX_AMOUNT ? Math.round(n * 100) / 100 : null;
}

// Marge, taux de marque et seuil de rentabilité à partir des lignes et des charges fixes.
export function computeMargins(products, fixedCosts) {
  let CA = 0, CV = 0;
  const lines = products.map((p) => {
    const ca = p.price * p.quantity;
    const cv = p.cost * p.quantity;
    CA += ca;
    CV += cv;
    return { ...p, m: ca - cv, tm: p.price ? (p.price - p.cost) / p.price : NaN };
  });
  const MB = CA - CV;
  const TM = CA ? MB / CA : NaN;
  const F = fixedCosts;
  const SR = TM > 0 ? F / TM : NaN;
  return { lines, CA, MB, TM, F, SR, res: MB - F };
}
