import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectFileType,
  groupInvoiceLines,
  invoicePrompt,
  marginStatus,
  matchIngredient,
  MAX_INVOICE_LINES,
  normalizeInvoice,
  parseNumber,
  priceIncreases,
  recipeCost,
  suggestedPrice,
  toBaseUnit,
} from '../lib/recettes.mjs';

test('parseNumber lit les saisies françaises avec le nombre de décimales voulu', () => {
  assert.equal(parseNumber('0,025', { decimals: 4 }), 0.025);
  assert.equal(parseNumber(' 1 200 '), 1200);
  assert.equal(parseNumber(''), 0);
  assert.equal(parseNumber('8,904', { decimals: 2 }), 8.9);
  assert.equal(parseNumber('.'), null);
  assert.equal(parseNumber('-2'), null);
  assert.equal(parseNumber('abc'), null);
  assert.equal(parseNumber('100000000', { decimals: 4, max: 99999999.9999 }), null);
});

test('toBaseUnit convertit vers kg, L ou pièce', () => {
  assert.deepEqual(toBaseUnit(25000, 'g'), { quantity: 25, unit: 'kg' });
  assert.deepEqual(toBaseUnit(75, 'cl'), { quantity: 0.75, unit: 'L' });
  assert.deepEqual(toBaseUnit(90, 'pièce'), { quantity: 90, unit: 'pièce' });
  assert.equal(toBaseUnit(0, 'kg'), null);
  assert.equal(toBaseUnit(3, 'sac'), null);
  assert.equal(toBaseUnit('abc', 'kg'), null);
});

test('suggestedPrice vise le taux de marque et arrondit aux 5 centimes supérieurs', () => {
  // 0,30 € HT de matière, 70 % visés, TVA 5,5 % : 0,30 / 0,3 × 1,055 = 1,055 → 1,10 €
  assert.equal(suggestedPrice(0.3, 0.7, 5.5), 1.1);
  // Valeur déjà ronde : pas d'arrondi au-dessus (erreurs de virgule flottante comprises)
  assert.equal(suggestedPrice(0.405, 0.7, 0), 1.35);
  assert.ok(Number.isNaN(suggestedPrice(0, 0.7, 5.5)));
  assert.ok(Number.isNaN(suggestedPrice(1, 1, 5.5)));
});

test('marginStatus classe par rapport à l’objectif', () => {
  assert.equal(marginStatus(0.72, 0.7), 'ok');
  assert.equal(marginStatus(0.7, 0.7), 'ok');
  assert.equal(marginStatus(0.67, 0.7), 'warn');
  assert.equal(marginStatus(0.6, 0.7), 'bad');
  assert.equal(marginStatus(NaN, 0.7), 'none');
});

test('recipeCost calcule coût matière par pièce, marge et prix conseillé', () => {
  const ingredients = new Map([
    ['farine', { unit_cost: 0.8 }],
    ['beurre', { unit_cost: 9 }],
  ]);
  // Fournée de 20 croissants : 1 kg de farine et 0,5 kg de beurre = 5,30 € → 0,265 € par pièce
  const r = recipeCost(
    { portions: 20, price: 1.3, vat: 5.5, target: 0.7 },
    [
      { ingredient_id: 'farine', quantity: 1 },
      { ingredient_id: 'beurre', quantity: 0.5 },
    ],
    ingredients
  );
  assert.equal(r.batch, 5.3);
  assert.equal(r.unitCost, 0.265);
  assert.ok(Math.abs(r.priceHT - 1.3 / 1.055) < 1e-9);
  assert.ok(Math.abs(r.rate - (1 - 0.265 / (1.3 / 1.055))) < 1e-9);
  assert.equal(r.status, 'ok');
  assert.equal(r.missing, 0);
  assert.equal(r.suggested, 0.95);
});

test('recipeCost signale les matières sans coût et l’absence de prix', () => {
  const r = recipeCost(
    { portions: 0, price: 0, vat: 5.5, target: 0.7 },
    [{ ingredient_id: 'inconnue', quantity: 1 }, { ingredient_id: 'sel', quantity: 0 }],
    new Map([['sel', { unit_cost: 0.5 }]])
  );
  assert.equal(r.missing, 2);
  assert.equal(r.unitCost, 0);
  assert.equal(r.status, 'none');
  assert.ok(Number.isNaN(r.suggested));
});

test('priceIncreases compare le dernier prix au précédent', () => {
  const now = Date.parse('2026-11-07T12:00:00Z');
  const history = [
    { ingredient_id: 'beurre', unit_cost: 8, created_at: '2026-06-01T10:00:00Z' },
    { ingredient_id: 'beurre', unit_cost: 9, created_at: '2026-11-01T10:00:00Z' },
    { ingredient_id: 'farine', unit_cost: 0.8, created_at: '2026-10-01T10:00:00Z' },
    { ingredient_id: 'farine', unit_cost: 0.82, created_at: '2026-11-02T10:00:00Z' },
    { ingredient_id: 'sucre', unit_cost: 1, created_at: '2026-01-01T10:00:00Z' },
    { ingredient_id: 'sucre', unit_cost: 2, created_at: '2026-02-01T10:00:00Z' },
    { ingredient_id: 'sel', unit_cost: 0.5, created_at: '2026-11-03T10:00:00Z' },
  ];
  const r = priceIncreases(history, { now });
  // Farine +2,5 % : sous le seuil ; sucre : hausse trop ancienne ; sel : un seul prix
  assert.equal(r.length, 1);
  assert.equal(r[0].ingredient_id, 'beurre');
  assert.equal(r[0].previous, 8);
  assert.equal(r[0].current, 9);
  assert.equal(r[0].change, 0.125);
});

test('detectFileType se fie aux premiers octets', () => {
  const pad = (arr) => Uint8Array.from([...arr, ...new Array(12).fill(0)]);
  assert.equal(detectFileType(pad([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg');
  assert.equal(detectFileType(pad([0x89, 0x50, 0x4e, 0x47])), 'image/png');
  assert.equal(detectFileType(pad([...Buffer.from('%PDF-1.7')])), 'application/pdf');
  assert.equal(detectFileType(pad([...Buffer.from('RIFF'), 0, 0, 0, 0, ...Buffer.from('WEBP')])), 'image/webp');
  assert.equal(detectFileType(pad([...Buffer.from('<html>')])), null);
  assert.equal(detectFileType(Uint8Array.from([0xff])), null);
});

test('normalizeInvoice garde les lignes complètes et calcule le coût unitaire', () => {
  const r = normalizeInvoice({
    fournisseur: '  Moulins   de France ',
    date: '2026-11-03',
    lignes: [
      { designation: 'Farine T65 sac 25 kg', quantite: 100, unite: 'kg', total_ht: 82, matiere: 'Farine T65' },
      { designation: 'Beurre AOP plaque', quantite: 10000, unite: 'g', total_ht: 89, matiere: '' },
      { designation: 'Œufs', quantite: 90, unite: 'pièce', total_ht: 16.2, matiere: '' },
      { designation: 'Sans quantité', quantite: 0, unite: 'kg', total_ht: 5, matiere: '' },
      { designation: 'Unité inconnue', quantite: 2, unite: 'sac', total_ht: 5, matiere: '' },
      { designation: '', quantite: 2, unite: 'kg', total_ht: 5, matiere: '' },
      { designation: 'Remise', quantite: 1, unite: 'pièce', total_ht: -3, matiere: '' },
    ],
  });
  assert.equal(r.supplier, 'Moulins de France');
  assert.equal(r.date, '2026-11-03');
  assert.equal(r.lines.length, 3);
  assert.deepEqual(r.lines[0], { designation: 'Farine T65 sac 25 kg', quantity: 100, unit: 'kg', total: 82, unitCost: 0.82, matiere: 'Farine T65' });
  assert.equal(r.lines[1].quantity, 10);
  assert.equal(r.lines[1].unitCost, 8.9);
  assert.equal(r.lines[2].unitCost, 0.18);
  assert.equal(r.total, 187.2);
});

test('normalizeInvoice résiste à une réponse inattendue', () => {
  assert.deepEqual(normalizeInvoice(null), { supplier: '', date: null, total: 0, lines: [] });
  assert.equal(normalizeInvoice({ date: '03/11/2026', lignes: 'non' }).date, null);
  const many = { lignes: Array.from({ length: 120 }, (_, i) => ({ designation: `P${i}`, quantite: 1, unite: 'kg', total_ht: 1 })) };
  assert.equal(normalizeInvoice(many).lines.length, MAX_INVOICE_LINES);
});

test('matchIngredient : nom proposé par Claude, puis mots en commun, même unité', () => {
  const ingredients = [
    { id: 'a', name: 'Farine T65', unit: 'kg' },
    { id: 'b', name: 'Beurre AOP doux', unit: 'kg' },
    { id: 'c', name: 'Lait entier', unit: 'L' },
    { id: 'd', name: 'Œufs', unit: 'pièce' },
  ];
  assert.equal(matchIngredient({ designation: 'FAR. T65 25KG', unit: 'kg', matiere: 'farine t65' }, ingredients), 'a');
  assert.equal(matchIngredient({ designation: 'Beurre doux AOP Charentes plaque 2 kg', unit: 'kg', matiere: '' }, ingredients), 'b');
  assert.equal(matchIngredient({ designation: 'Oeufs frais calibre M', unit: 'pièce', matiere: '' }, ingredients), 'd');
  // Même nom mais unité différente : pas de rattachement
  assert.equal(matchIngredient({ designation: 'Lait entier', unit: 'kg', matiere: 'Lait entier' }, ingredients), null);
  assert.equal(matchIngredient({ designation: 'Chocolat noir 70 %', unit: 'kg', matiere: '' }, ingredients), null);
});

test('groupInvoiceLines fait la moyenne quand deux lignes visent la même matière', () => {
  const r = groupInvoiceLines([
    { choice: 'b', name: 'Beurre 1', unit: 'kg', quantity: 10, total: 89 },
    { choice: 'b', name: 'Beurre 2', unit: 'kg', quantity: 2, total: 19 },
    { choice: 'new', name: 'Chocolat noir', unit: 'kg', quantity: 5, total: 60 },
    { choice: 'new', name: ' chocolat   NOIR ', unit: 'kg', quantity: 5, total: 70 },
    { choice: 'new', name: '', unit: 'kg', quantity: 1, total: 1 },
    { choice: 'skip', name: 'Port', unit: 'pièce', quantity: 1, total: 15 },
  ]);
  assert.equal(r.updates.length, 1);
  assert.equal(r.updates[0].id, 'b');
  assert.equal(r.updates[0].unit_cost, 9);
  assert.equal(r.creations.length, 1);
  assert.equal(r.creations[0].unit_cost, 13);
  assert.equal(r.creations[0].name, 'Chocolat noir');
});

test('invoicePrompt liste les matières du client', () => {
  const p = invoicePrompt([{ name: 'Farine T65', unit: 'kg' }, { name: '  ', unit: 'kg' }]);
  assert.match(p, /- Farine T65 \(kg\)/);
  assert.doesNotMatch(p, /- {2}\(kg\)/);
  assert.match(invoicePrompt([]), /aucune pour le moment/);
});
