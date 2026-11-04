import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Vérifie les limites de longueur d'App Store Connect pour la fiche (docs/app-store/fiche.md)
const fiche = readFileSync(new URL('../docs/app-store/fiche.md', import.meta.url), 'utf8');
const row = (label) => fiche.match(new RegExp(`\\| ${label}[^|]*\\| ([^|]+) \\|`))[1].trim();
const section = (title) => fiche.split(`## ${title}`)[1].split('\n## ')[0].replace(/^[^\n]*\n/, '').trim();

test('nom et sous-titre : 30 caractères au plus', () => {
  assert.ok(row('Nom').length <= 30);
  assert.ok(row('Sous-titre').length <= 30, row('Sous-titre'));
});

test('texte promotionnel : 170 caractères au plus', () => {
  const t = section('Texte promotionnel (170 max.)');
  assert.ok(t.length <= 170, `${t.length} caractères`);
});

test('description : 4000 caractères au plus', () => {
  const t = section('Description (4 000 max.)');
  assert.ok(t.length > 500 && t.length <= 4000, `${t.length} caractères`);
});

test('mots-clés : 100 caractères au plus, sans doublon ni mot du nom', () => {
  const t = section('Mots-clés (100 max., séparés par des virgules)');
  assert.ok(t.length <= 100, `${t.length} caractères`);
  const words = t.split(',');
  assert.equal(new Set(words.map((w) => w.toLowerCase())).size, words.length);
  assert.ok(!words.some((w) => w.toLowerCase() === 'equimarge'));
});
