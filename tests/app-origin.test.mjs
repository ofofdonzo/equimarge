import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bearerToken, corsHeaders, originAllowed } from '../lib/app-origin.mjs';

const HOST = 'equimarge.netlify.app';

test('originAllowed : le site et l’application, jamais un autre site', () => {
  assert.ok(originAllowed('https://equimarge.netlify.app', HOST));
  assert.ok(originAllowed('capacitor://localhost', HOST));
  assert.ok(originAllowed(null, HOST));
  assert.ok(!originAllowed('http://equimarge.netlify.app', HOST), 'pas de http en dehors du poste local');
  assert.ok(!originAllowed('https://pirate.example', HOST));
  assert.ok(!originAllowed('https://equimarge.netlify.app.pirate.example', HOST));
  assert.ok(!originAllowed('null', HOST));
  assert.ok(!originAllowed('https://equimarge.netlify.app', null));
  assert.ok(originAllowed('http://localhost:3000', 'localhost:3000'));
});

test('corsHeaders n’ouvre l’accès qu’à l’application', () => {
  assert.equal(corsHeaders('capacitor://localhost')['Access-Control-Allow-Origin'], 'capacitor://localhost');
  assert.deepEqual(corsHeaders('https://pirate.example'), {});
  assert.deepEqual(corsHeaders(null), {});
  assert.equal(corsHeaders('capacitor://localhost')['Access-Control-Allow-Credentials'], undefined);
});

test('bearerToken ne lit qu’un jeton bien formé', () => {
  assert.equal(bearerToken('Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.sig_nature-1'), 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.sig_nature-1');
  assert.equal(bearerToken('Bearer court'), null);
  assert.equal(bearerToken('Basic abcdefghijklmnopqrstuvwxyz'), null);
  assert.equal(bearerToken('Bearer abc def ghi jkl mno pqr stu'), null);
  assert.equal(bearerToken(undefined), null);
});
