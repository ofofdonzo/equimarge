// Bloque tout secret publié par erreur dans le dépôt (lancé par GitHub à chaque modification : npm run secrets).
// Autorisé : la clé publique « anon » de Supabase. Refusé : toute autre clé Supabase (service_role…),
// les clés secrètes Supabase (sb_secret_…) et les clés privées.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const problems = [];

for (const file of files) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (text.includes('\0')) continue; // fichier binaire

  for (const [jwt] of text.matchAll(/eyJ[\w-]{10,}\.eyJ[\w-]{10,}\.[\w-]{10,}/g)) {
    let role;
    try {
      role = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString()).role;
    } catch {
      continue;
    }
    if (role && role !== 'anon') problems.push(`${file} : jeton Supabase « ${role} » (clé secrète)`);
  }
  if (/sb_secret_[\w-]{10,}/.test(text)) problems.push(`${file} : clé secrète Supabase (sb_secret_…)`);
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)) problems.push(`${file} : clé privée`);
}

if (problems.length) {
  console.error('Secrets trouvés dans le dépôt — retirez-les et changez ces clés :\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log(`Aucun secret dans les ${files.length} fichiers suivis.`);
