// Notifications vers les iPhone (service APNs d'Apple), sans dépendance : HTTP/2 et jeton signé ES256.
// Variables Netlify (toutes nécessaires, sinon rien n'est envoyé) :
//   APNS_KEY_ID      identifiant de la clé « Apple Push Notifications » (10 caractères)
//   APNS_TEAM_ID     identifiant de l'équipe Apple Developer (10 caractères)
//   APNS_PRIVATE_KEY contenu du fichier AuthKey_XXXX.p8 (les retours à la ligne peuvent être écrits \n)
// Facultatif : APNS_BUNDLE_ID (fr.equimarge.app par défaut), APNS_ENV=sandbox pour une appli lancée depuis Xcode.
import { connect } from 'node:http2';
import { createPrivateKey, sign } from 'node:crypto';

export const DEFAULT_BUNDLE_ID = 'fr.equimarge.app';

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

export function apnsConfig(env = process.env) {
  const { APNS_KEY_ID: keyId, APNS_TEAM_ID: teamId, APNS_PRIVATE_KEY: raw } = env;
  if (!keyId || !teamId || !raw) return null;
  return {
    keyId,
    teamId,
    key: raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw,
    topic: env.APNS_BUNDLE_ID || DEFAULT_BUNDLE_ID,
    host: env.APNS_ENV === 'sandbox' ? 'https://api.sandbox.push.apple.com' : 'https://api.push.apple.com',
  };
}

// Jeton d'authentification du fournisseur (valable une heure côté Apple ; on en signe un par envoi)
export function apnsJwt({ keyId, teamId, key }, now = Date.now()) {
  const header = b64url(JSON.stringify({ alg: 'ES256', kid: keyId }));
  const claims = b64url(JSON.stringify({ iss: teamId, iat: Math.floor(now / 1000) }));
  const data = `${header}.${claims}`;
  const signature = sign('sha256', Buffer.from(data), { key: createPrivateKey(key), dsaEncoding: 'ieee-p1363' });
  return `${data}.${b64url(signature)}`;
}

// Contenu de la notification : titre et texte courts, et l'onglet de l'appli à ouvrir.
export function apnsPayload({ title, body, tab }) {
  return JSON.stringify({ aps: { alert: { title, body }, sound: 'default' }, ...(tab ? { tab } : {}) });
}

// Jeton d'appareil Apple : 64 caractères hexadécimaux (plus long possible à l'avenir)
export const isApnsToken = (t) => typeof t === 'string' && /^[0-9a-f]{64,200}$/i.test(t);

// Envoie une notification à plusieurs appareils sur une seule connexion.
// Renvoie le nombre d'envois réussis et les jetons à oublier (appli supprimée, jeton invalide).
export async function sendApns(config, tokens, message, { timeoutMs = 8000 } = {}) {
  const list = tokens.filter(isApnsToken);
  if (!list.length) return { sent: 0, invalid: [], errors: [] };
  const jwt = apnsJwt(config);
  const payload = apnsPayload(message);
  const client = connect(config.host);
  client.on('error', () => {});

  const results = await Promise.all(
    list.map(
      (token) =>
        new Promise((resolve) => {
          let status = 0;
          let data = '';
          let done = false;
          const finish = (r) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            resolve({ token, ...r });
          };
          const req = client.request({
            ':method': 'POST',
            ':path': `/3/device/${token}`,
            authorization: `bearer ${jwt}`,
            'apns-topic': config.topic,
            'apns-push-type': 'alert',
            'apns-priority': '10',
            'apns-expiration': String(Math.floor(Date.now() / 1000) + 24 * 3600),
            'content-type': 'application/json',
          });
          const timer = setTimeout(() => {
            req.close();
            finish({ status: 0, reason: 'timeout' });
          }, timeoutMs);
          req.setEncoding('utf8');
          req.on('response', (h) => (status = Number(h[':status']) || 0));
          req.on('data', (c) => (data += c));
          req.on('end', () => {
            let reason = '';
            try {
              reason = JSON.parse(data || '{}').reason || '';
            } catch {
              reason = '';
            }
            finish({ status, reason });
          });
          req.on('error', (e) => finish({ status: 0, reason: e.code || 'error' }));
          req.end(payload);
        })
    )
  );
  client.close();
  const gone = (r) => r.status === 410 || (r.status === 400 && ['BadDeviceToken', 'DeviceTokenNotForTopic'].includes(r.reason));
  return {
    sent: results.filter((r) => r.status === 200).length,
    invalid: results.filter(gone).map((r) => r.token),
    errors: results.filter((r) => r.status !== 200 && !gone(r)).map((r) => `${r.status} ${r.reason}`.trim()),
  };
}
