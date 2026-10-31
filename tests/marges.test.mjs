import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeMargins, MAX_AMOUNT, parseAmount } from '../lib/marges.mjs';

test('parseAmount lit les saisies françaises', () => {
  assert.equal(parseAmount('12,5'), 12.5);
  assert.equal(parseAmount(' 1 200 '), 1200);
  assert.equal(parseAmount(''), 0);
  assert.equal(parseAmount('0.005'), 0.01);
});

test('parseAmount refuse les valeurs que la base rejetterait', () => {
  assert.equal(parseAmount('-3'), null);
  assert.equal(parseAmount('abc'), null);
  assert.equal(parseAmount('1e13'), null);
  assert.equal(parseAmount(String(MAX_AMOUNT + 1)), null);
  assert.equal(parseAmount(String(MAX_AMOUNT)), MAX_AMOUNT);
});

test('computeMargins calcule marge, taux de marque et seuil de rentabilité', () => {
  const r = computeMargins(
    [
      { id: 1, price: 100, cost: 60, quantity: 10 },
      { id: 2, price: 50, cost: 10, quantity: 20 },
    ],
    600
  );
  assert.equal(r.CA, 2000);
  assert.equal(r.MB, 1200);
  assert.equal(r.TM, 0.6);
  assert.equal(r.SR, 1000);
  assert.equal(r.res, 600);
  assert.equal(r.lines[0].m, 400);
  assert.equal(r.lines[0].tm, 0.4);
});

test('computeMargins sans vente ni prix', () => {
  const r = computeMargins([{ id: 1, price: 0, cost: 5, quantity: 0 }], 100);
  assert.equal(r.CA, 0);
  assert.ok(Number.isNaN(r.TM));
  assert.ok(Number.isNaN(r.SR));
  assert.ok(Number.isNaN(r.lines[0].tm));
  assert.equal(r.res, -100);
});
