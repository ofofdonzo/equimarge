// Calculs du module « Recettes » (coût matière, prix conseillé, hausses de prix, lecture des factures),
// isolés ici pour être testés (tests/recettes.test.mjs). Aucun appel réseau dans ce fichier.

// Unités de base des matières premières (colonne ingredients.unit)
export const UNITS = ['kg', 'L', 'pièce'];
// Taux de TVA possibles d'un produit vendu (colonne recipes.vat). 5,5 % : la plupart des produits alimentaires.
export const VAT_RATES = [5.5, 10, 20, 0];
// Plus grandes valeurs acceptées par la base : numeric(12,2) pour les prix, numeric(12,4) pour les coûts unitaires
export const MAX_PRICE = 9999999999.99;
export const MAX_COST = 99999999.9999;
// Lignes gardées au plus par facture lue
export const MAX_INVOICE_LINES = 80;
// Taille maximale d'une facture envoyée (les fonctions Netlify refusent les requêtes de plus de 6 Mo)
export const MAX_INVOICE_BYTES = 4 * 1024 * 1024;

const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;

// Lit une saisie française (« 12,5 », « 0,025 », « 1 200 ») arrondie à `decimals` décimales.
// Renvoie null si ce n'est pas un nombre entre 0 et `max`.
export function parseNumber(v, { decimals = 2, max = MAX_PRICE } = {}) {
  const s = String(v ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (s === '') return 0;
  if (!/^\d*\.?\d*$/.test(s) || s === '.') return null;
  const n = round(parseFloat(s), decimals);
  return Number.isFinite(n) && n >= 0 && n <= max ? n : null;
}

// ---------- Unités ----------

// Unités que Claude peut renvoyer pour une ligne de facture, et leur conversion vers l'unité de base
const CONVERSIONS = {
  kg: ['kg', 1],
  g: ['kg', 0.001],
  L: ['L', 1],
  cl: ['L', 0.01],
  ml: ['L', 0.001],
  pièce: ['pièce', 1],
};
export const INVOICE_UNITS = Object.keys(CONVERSIONS);

// 25 000 g → { quantity: 25, unit: 'kg' } ; null pour une unité inconnue ou une quantité nulle
export function toBaseUnit(quantity, unit) {
  const c = CONVERSIONS[unit];
  const q = Number(quantity);
  if (!c || !Number.isFinite(q) || q <= 0) return null;
  return { quantity: round(q * c[1], 4), unit: c[0] };
}

// ---------- Recettes ----------

// Prix de vente TTC conseillé pour atteindre le taux de marque visé sur le coût matière,
// arrondi aux 5 centimes supérieurs (prix affichable en boutique). NaN s'il manque le coût.
export function suggestedPrice(unitCostHT, target, vat) {
  if (!(unitCostHT > 0) || !(target >= 0 && target < 1)) return NaN;
  const ttc = (unitCostHT / (1 - target)) * (1 + vat / 100);
  return Math.ceil(ttc * 20 - 1e-9) / 20;
}

// 'ok' : objectif atteint ; 'warn' : moins de 5 points en dessous ; 'bad' : plus loin ; 'none' : calcul impossible
export function marginStatus(rate, target) {
  if (!Number.isFinite(rate)) return 'none';
  if (rate >= target - 1e-9) return 'ok';
  if (rate >= target - 0.05) return 'warn';
  return 'bad';
}

// Coût matière d'une recette et marge sur le prix affiché.
// recipe : { portions, price (TTC d'une pièce), vat (%), target (taux de marque visé, 0 à 1) }
// items : [{ ingredient_id, quantity }] ; ingredients : Map id → { unit_cost }
export function recipeCost(recipe, items, ingredients) {
  let batch = 0;
  let missing = 0;
  const lines = items.map((it) => {
    const ing = ingredients.get(it.ingredient_id);
    if (!ing || !(ing.unit_cost > 0) || !(it.quantity > 0)) missing += 1;
    const cost = ing ? ing.unit_cost * it.quantity : 0;
    batch += cost;
    return { ...it, cost };
  });
  const portions = recipe.portions > 0 ? recipe.portions : 1;
  const unitCost = batch / portions;
  const priceHT = recipe.price / (1 + recipe.vat / 100);
  const margin = priceHT - unitCost;
  const rate = priceHT > 0 && unitCost > 0 ? margin / priceHT : NaN;
  return {
    lines,
    batch,
    unitCost,
    priceHT,
    margin,
    rate,
    coef: unitCost > 0 && priceHT > 0 ? priceHT / unitCost : NaN,
    suggested: suggestedPrice(unitCost, recipe.target, recipe.vat),
    missing,
    status: marginStatus(rate, recipe.target),
  };
}

// ---------- Hausses de prix ----------

// Dernier prix comparé au précédent pour chaque matière, à partir de l'historique (ingredient_price_changes).
// Ne garde que les hausses d'au moins `threshold` dont le dernier prix date de moins de `days` jours.
export function priceIncreases(history, { days = 60, threshold = 0.05, now = Date.now() } = {}) {
  const byIngredient = new Map();
  for (const h of history) {
    const list = byIngredient.get(h.ingredient_id) || [];
    list.push(h);
    byIngredient.set(h.ingredient_id, list);
  }
  const out = [];
  for (const [id, list] of byIngredient) {
    if (list.length < 2) continue;
    list.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    const [last, prev] = list;
    if (now - Date.parse(last.created_at) > days * 86400000 || !(prev.unit_cost > 0)) continue;
    const change = (last.unit_cost - prev.unit_cost) / prev.unit_cost;
    if (change >= threshold - 1e-9) {
      out.push({ ingredient_id: id, previous: prev.unit_cost, current: last.unit_cost, change, at: last.created_at });
    }
  }
  return out.sort((a, b) => b.change - a.change);
}

// ---------- Lecture des factures ----------

// Format de la réponse demandée à Claude (sorties structurées : la réponse respecte ce schéma)
export const INVOICE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['fournisseur', 'date', 'lignes'],
  properties: {
    fournisseur: { type: 'string', description: "Nom du fournisseur qui a émis la facture" },
    date: { type: 'string', description: 'Date de la facture au format AAAA-MM-JJ, ou chaîne vide' },
    lignes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['designation', 'quantite', 'unite', 'total_ht', 'matiere'],
        properties: {
          designation: { type: 'string', description: 'Libellé du produit tel qu’écrit sur la facture' },
          quantite: { type: 'number', description: 'Quantité totale livrée, dans l’unité indiquée' },
          unite: { type: 'string', enum: INVOICE_UNITS },
          total_ht: { type: 'number', description: 'Montant hors taxes de la ligne, remises de ligne déduites' },
          matiere: { type: 'string', description: 'Nom exact de la matière première du client correspondante, ou chaîne vide' },
        },
      },
    },
  },
};

export const INVOICE_SYSTEM =
  "Tu lis des factures de fournisseurs pour des artisans de l'alimentation (boulangers, pâtissiers, traiteurs, " +
  "restaurateurs). Tu recopies fidèlement ce qui est écrit. Tu n'inventes aucune valeur : une ligne illisible est laissée de côté.";

// Consigne envoyée avec la facture. ingredients : [{ name, unit }] du client, pour rattacher les lignes.
export function invoicePrompt(ingredients = []) {
  const list = ingredients
    .filter((i) => i.name?.trim())
    .slice(0, 500)
    .map((i) => `- ${i.name.trim().slice(0, 200)} (${i.unit})`)
    .join('\n');
  return [
    'Lis cette facture fournisseur et renvoie :',
    '- fournisseur : le nom du fournisseur (émetteur de la facture) ;',
    '- date : la date de la facture au format AAAA-MM-JJ, ou une chaîne vide si elle est illisible ;',
    `- lignes : une entrée par produit acheté (${MAX_INVOICE_LINES} au plus), avec :`,
    '  - designation : le libellé du produit tel qu’il est écrit ;',
    '  - quantite et unite : la quantité TOTALE livrée, dans l’une des unités kg, g, L, cl, ml ou pièce. ' +
      'Convertis les conditionnements : « 4 sacs de 25 kg » donne 100 kg ; « 2 cartons de 6 bouteilles de 1 L » donne 12 L ; ' +
      '« 3 plateaux de 30 œufs » donne 90 pièce ;',
    '  - total_ht : le montant hors taxes de la ligne, remises de ligne déduites ;',
    '  - matiere : si le produit est le même qu’une des matières premières du client listées plus bas (même produit, ' +
      'mesuré dans la même unité), recopie exactement son nom ; sinon une chaîne vide.',
    'Ignore ce qui n’est pas un produit : frais de port ou de livraison, consignes, remises globales, sous-totaux, TVA, acomptes.',
    '',
    'Matières premières du client :',
    list || '(aucune pour le moment)',
  ].join('\n');
}

// Type réel du fichier d'après ses premiers octets (le type annoncé par le navigateur ne suffit pas)
export function detectFileType(bytes) {
  const b = bytes;
  if (!b || b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  const ascii = (from, to) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (ascii(0, 5) === '%PDF-') return 'application/pdf';
  return null;
}

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

// Vérifie et met en forme la réponse de Claude : lignes complètes seulement, unités de base, coût unitaire calculé.
export function normalizeInvoice(raw) {
  const o = raw && typeof raw === 'object' ? raw : {};
  const date = /^\d{4}-\d{2}-\d{2}$/.test(o.date) && !Number.isNaN(Date.parse(o.date)) ? o.date : null;
  const lines = [];
  for (const l of Array.isArray(o.lignes) ? o.lignes : []) {
    if (lines.length >= MAX_INVOICE_LINES) break;
    const designation = clean(l?.designation, 200);
    const total = Number(l?.total_ht);
    const base = toBaseUnit(l?.quantite, l?.unite);
    if (!designation || !base || !Number.isFinite(total) || total < 0 || total > MAX_PRICE) continue;
    const unitCost = round(total / base.quantity, 4);
    if (unitCost > MAX_COST) continue;
    lines.push({ designation, quantity: base.quantity, unit: base.unit, total: round(total, 2), unitCost, matiere: clean(l?.matiere, 200) });
  }
  const total = round(lines.reduce((s, l) => s + l.total, 0), 2);
  return { supplier: clean(o.fournisseur, 200), date, total: Math.min(total, MAX_PRICE), lines };
}

// Mots qui ne servent pas à reconnaître un produit (conditionnements, liaisons)
const STOP = new Set(
  'les des une aux pour avec sans sac sacs carton cartons colis plaque plaques bidon bidons seau seaux boite boites boîte boîtes pot pots bouteille bouteilles barquette barquettes paquet paquets lot lots kg gr litre litres piece pieces pièce pièces unite unites'.split(' ')
);
function words(s) {
  return new Set(
    String(s || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/œ/g, 'oe')
      .replace(/æ/g, 'ae')
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3 && !/\d/.test(w) && !STOP.has(w))
  );
}
const key = (s) => [...words(s)].sort().join(' ');
const same = (a, b) => key(a) !== '' && key(a) === key(b);

// Matière du client qui correspond à une ligne de facture (même unité obligatoire), ou null.
// D'abord le nom proposé par Claude, puis les mots en commun (au moins la moitié).
export function matchIngredient(line, ingredients) {
  const candidates = ingredients.filter((i) => i.unit === line.unit && i.name?.trim());
  if (line.matiere) {
    const exact = candidates.find((i) => i.name.trim().toLowerCase() === line.matiere.toLowerCase()) || candidates.find((i) => same(i.name, line.matiere));
    if (exact) return exact.id;
  }
  const w = words(line.designation);
  let best = null;
  let bestScore = 0;
  for (const i of candidates) {
    const v = words(i.name);
    if (!v.size || !w.size) continue;
    const common = [...v].filter((x) => w.has(x)).length;
    const score = common / Math.min(v.size, w.size);
    if (score > bestScore) [best, bestScore] = [i.id, score];
  }
  return bestScore >= 0.5 ? best : null;
}

// Regroupe les lignes validées par cible avant la mise à jour des prix :
// plusieurs lignes vers la même matière donnent un coût moyen (total / quantité).
// lines : [{ choice: id | 'new' | 'skip', name, unit, quantity, total }]
export function groupInvoiceLines(lines) {
  const updates = new Map();
  const creations = new Map();
  for (const l of lines) {
    if (l.choice === 'skip' || !(l.quantity > 0)) continue;
    const isNew = l.choice === 'new';
    const name = clean(l.name, 200);
    if (isNew && !name) continue;
    const key = isNew ? `${name.toLowerCase()}|${l.unit}` : l.choice;
    const target = isNew ? creations : updates;
    const g = target.get(key) || { id: isNew ? null : l.choice, name, unit: l.unit, quantity: 0, total: 0 };
    g.quantity += l.quantity;
    g.total += l.total;
    target.set(key, g);
  }
  const finish = (g) => ({ ...g, unit_cost: Math.min(round(g.total / g.quantity, 4), MAX_COST) });
  return { updates: [...updates.values()].map(finish), creations: [...creations.values()].map(finish) };
}
