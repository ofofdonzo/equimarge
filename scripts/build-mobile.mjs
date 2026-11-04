// Construit l'application mobile dans mobile/www (pages intégrées à l'appli, copiées dans le projet iOS
// par « npx cap sync ios »). Aucune page n'est chargée depuis internet : seules les données passent par
// Supabase et par l'adresse /api/compte du site.
//   node scripts/build-mobile.mjs            construction normale
//   EQUIMARGE_SITE_URL=https://equimarge.fr  autre adresse du site (par défaut https://equimarge.netlify.app)
import { build } from 'esbuild';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// EQUIMARGE_DEMO=1 : version de démonstration hors ligne pour les captures d'écran, dans mobile/demo
const DEMO = process.env.EQUIMARGE_DEMO === '1';
const out = resolve(root, DEMO ? 'mobile/demo' : 'mobile/www');
const SITE = (process.env.EQUIMARGE_SITE_URL || 'https://equimarge.netlify.app').replace(/\/+$/, '');
const config = await readFile(resolve(root, 'lib/supabase/config.js'), 'utf8');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || config.match(/'(https:\/\/[a-z0-9]+\.supabase\.co)'/)[1];
if (!/^https:\/\//.test(SITE) || !/^https:\/\//.test(SUPABASE_URL)) throw new Error('Adresses https obligatoires');

// Modules du site remplacés dans l'application
const REPLACED = {
  '@/lib/supabase/client': 'mobile/src/supabase.js',
  '@/lib/platform': 'mobile/src/platform.js',
  'next/link': 'mobile/src/shims/link.jsx',
};
const replace = {
  name: 'equimarge-app',
  setup(b) {
    b.onResolve({ filter: /^(@\/lib\/supabase\/client|@\/lib\/platform|next\/link)$/ }, (args) => ({ path: resolve(root, REPLACED[args.path]) }));
    // Tout autre module de Next.js est propre au serveur ou au site : il ne doit pas entrer dans l'appli
    b.onResolve({ filter: /^next(\/|$)/ }, (args) => ({ errors: [{ text: `Module du site non disponible dans l'application : ${args.path} (importé par ${args.importer})` }] }));
  },
};

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const result = await build({
  entryPoints: [resolve(root, 'mobile/src/main.jsx')],
  outfile: resolve(out, 'app.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['safari15'],
  jsx: 'automatic',
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'warning',
  absWorkingDir: root,
  plugins: [replace],
  define: {
    __SITE__: JSON.stringify(SITE),
    __DEMO__: JSON.stringify(DEMO),
    'process.env.NODE_ENV': '"production"',
    'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
  },
  metafile: true,
});

// La politique de sécurité de l'appli : uniquement ses propres fichiers, Supabase et le site Equimarge
const supabaseOrigin = new URL(SUPABASE_URL).origin;
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src ${supabaseOrigin} ${supabaseOrigin.replace(/^https/, 'wss')} ${new URL(SITE).origin}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');
await writeFile(
  resolve(out, 'index.html'),
  `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="color-scheme" content="light dark">
<meta name="format-detection" content="telephone=no">
<title>Equimarge</title>
<link rel="stylesheet" href="globals.css">
<link rel="stylesheet" href="app.css">
</head>
<body>
<div id="root"></div>
<script src="app.js"></script>
</body>
</html>
`
);
await copyFile(resolve(root, 'app/globals.css'), resolve(out, 'globals.css'));
await copyFile(resolve(root, 'mobile/src/app.css'), resolve(out, 'app.css'));

const js = await readFile(resolve(out, 'app.js'), 'utf8');
if (!DEMO && js.includes('courtage-beta')) throw new Error('Les données de démonstration ne doivent pas être dans l’application publiée');
if (/process\.env/.test(js)) console.warn('Attention : process.env reste dans app.js');
const kb = Math.round(js.length / 1024);
console.log(`Application construite dans ${DEMO ? "mobile/demo" : "mobile/www"} (app.js : ${kb} Ko, site : ${SITE}, ${result.warnings.length} avertissement(s))`);
