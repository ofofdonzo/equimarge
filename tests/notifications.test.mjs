import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http2';
import { createPublicKey, generateKeyPairSync, verify } from 'node:crypto';
import { apnsConfig, apnsJwt, apnsPayload, isApnsToken, sendApns } from '../lib/apns.mjs';
import { adminMessage, CLIENT_EVENTS, parseEvent } from '../lib/notify.mjs';

const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const fromB64url = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

test('apnsConfig exige les trois variables et accepte une clé écrite avec \\n', () => {
  assert.equal(apnsConfig({}), null);
  assert.equal(apnsConfig({ APNS_KEY_ID: 'K', APNS_TEAM_ID: 'T' }), null);
  const c = apnsConfig({ APNS_KEY_ID: 'K', APNS_TEAM_ID: 'T', APNS_PRIVATE_KEY: pem.replace(/\n/g, '\\n') });
  assert.equal(c.key, pem);
  assert.equal(c.topic, 'fr.equimarge.app');
  assert.equal(c.host, 'https://api.push.apple.com');
  assert.equal(apnsConfig({ APNS_KEY_ID: 'K', APNS_TEAM_ID: 'T', APNS_PRIVATE_KEY: pem, APNS_ENV: 'sandbox' }).host, 'https://api.sandbox.push.apple.com');
});

test('apnsJwt produit un jeton ES256 vérifiable avec la clé publique', () => {
  const jwt = apnsJwt({ keyId: 'ABC123DEFG', teamId: 'TEAM123456', key: pem }, 1_800_000_000_000);
  const [h, c, s] = jwt.split('.');
  assert.deepEqual(JSON.parse(fromB64url(h)), { alg: 'ES256', kid: 'ABC123DEFG' });
  assert.deepEqual(JSON.parse(fromB64url(c)), { iss: 'TEAM123456', iat: 1_800_000_000 });
  const ok = verify('sha256', Buffer.from(`${h}.${c}`), { key: createPublicKey(pem), dsaEncoding: 'ieee-p1363' }, fromB64url(s));
  assert.ok(ok);
});

test('apnsPayload ne contient que le titre, le texte et l’onglet', () => {
  assert.deepEqual(JSON.parse(apnsPayload({ title: 'T', body: 'B', tab: 'messages' })), {
    aps: { alert: { title: 'T', body: 'B' }, sound: 'default' },
    tab: 'messages',
  });
});

test('isApnsToken refuse ce qui n’est pas un jeton Apple', () => {
  assert.ok(isApnsToken('a'.repeat(64)));
  assert.ok(!isApnsToken('a'.repeat(63)));
  assert.ok(!isApnsToken('../../3/device/x'.padEnd(64, 'a')));
  assert.ok(!isApnsToken(null));
});

test('sendApns envoie à un faux serveur APNs et repère les jetons à oublier', async () => {
  const seen = [];
  const server = createServer();
  server.on('stream', (stream, headers) => {
    let body = '';
    stream.on('data', (c) => (body += c));
    stream.on('end', () => {
      seen.push({ path: headers[':path'], topic: headers['apns-topic'], type: headers['apns-push-type'], auth: headers.authorization, body });
      const token = headers[':path'].split('/').pop();
      if (token.startsWith('dead')) {
        stream.respond({ ':status': 410 });
        stream.end(JSON.stringify({ reason: 'Unregistered' }));
      } else if (token.startsWith('bad0')) {
        stream.respond({ ':status': 400 });
        stream.end(JSON.stringify({ reason: 'BadDeviceToken' }));
      } else if (token.startsWith('fa11')) {
        stream.respond({ ':status': 500 });
        stream.end(JSON.stringify({ reason: 'InternalServerError' }));
      } else {
        stream.respond({ ':status': 200 });
        stream.end();
      }
    });
  });
  await new Promise((r) => server.listen(0, r));
  const config = { keyId: 'K', teamId: 'T', key: pem, topic: 'fr.equimarge.app', host: `http://localhost:${server.address().port}` };
  const good = 'a'.repeat(64);
  const dead = 'dead'.padEnd(64, '0');
  const bad = 'bad0'.padEnd(64, '0');
  const fail = 'fa11'.padEnd(64, '0');
  const r = await sendApns(config, [good, dead, bad, fail, 'pas-un-jeton'], CLIENT_EVENTS.message_cabinet);
  server.close();

  assert.equal(r.sent, 1);
  assert.deepEqual(r.invalid.sort(), [bad, dead].sort());
  assert.deepEqual(r.errors, ['500 InternalServerError']);
  assert.equal(seen.length, 4, 'le texte qui n’est pas un jeton n’est jamais envoyé');
  for (const s of seen) {
    assert.equal(s.topic, 'fr.equimarge.app');
    assert.equal(s.type, 'alert');
    assert.match(s.auth, /^bearer [\w-]+\.[\w-]+\.[\w-]+$/);
    assert.equal(JSON.parse(s.body).tab, 'messages');
  }
});

test('parseEvent n’accepte que les événements connus et un identifiant de dossier valide', () => {
  const id = '0b5c1a3e-2d4f-4a6b-8c9d-0e1f2a3b4c5d';
  assert.deepEqual(parseEvent({ event: 'demande', dossier_id: id }), { event: 'demande', dossierId: id, audience: 'client' });
  assert.equal(parseEvent({ event: 'message_client', dossier_id: id }).audience, 'admin');
  assert.equal(parseEvent({ event: 'inconnu', dossier_id: id }), null);
  assert.equal(parseEvent({ event: 'demande', dossier_id: 'x' }), null);
  assert.equal(parseEvent({ event: '__proto__', dossier_id: id }), null);
  assert.equal(parseEvent(null), null);
});

test('adminMessage nomme le client et pointe vers son dossier, sans saut de ligne', () => {
  const m = adminMessage('message_client', { id: 'abc', company: 'Courtage\nBêta' });
  assert.equal(m.title, 'Courtage Bêta : nouveau message');
  assert.equal(m.url, '/admin/clients/abc');
});

test('les notifications vers le client restent générales (écran verrouillé)', () => {
  for (const m of Object.values(CLIENT_EVENTS)) {
    assert.equal(m.title, 'Equimarge');
    assert.ok(m.body.length < 80);
  }
});
