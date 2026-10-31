# Equimarge

Site et application pour PME, en trois pôles : mise en conformité (sur devis), suivi de marge (outil gratuit et diagnostic) et automatisation des tâches répétitives par agents IA (sur devis).

- **Accueil** : présentation et formules.
- **Mon espace** (`/tableau-de-bord`) : chaque client saisit ses produits ; marge, taux de marque, alertes et seuil de rentabilité sont calculés et sauvegardés.
- **Diagnostic** (`/diagnostic`) : formulaire ouvert à tous ; les demandes sont enregistrées dans la base.
- **Conformité** (`/conformite`) : domaines d'intervention, démarche et formulaire de demande de devis (mêmes demandes, formule « Conformité »).
- **Automatisation** (`/automatisation`) : les « étages » d'agents IA (mails et appels manqués, factures et relances, planning et achats, superviseur et rapport du soir) et le formulaire de devis (formule « Automatisation »).
- **Poste de travail** (`/admin`) : réservé à vous. Les demandes arrivent en direct (son, notification du navigateur, compteur dans l'onglet). Pour chacune : réponse e-mail préparée en un clic, appel, statut, montant du devis, prochaine relance datée, notes privées, et « Copier pour Claude » pour préparer la réponse avec Claude. En bas, vos agents IA et leurs horaires. Les montants et les notes sont dans des tables à part que le client ne voit jamais.
- **Mentions légales** et **Confidentialité** : remplies pour une SASU en cours de constitution ; à compléter après l'immatriculation (voir l'étape 7).

Technique : Next.js 16 (site), Supabase (comptes et base de données, offre gratuite), Netlify (hébergement, offre gratuite).

## Mise en ligne, pas à pas

Comptez une heure. Tout se fait depuis un navigateur, sur ordinateur de préférence.

### 1. Base de données (Supabase)
1. Créez un compte sur supabase.com, puis **New project**. Nom : `equimarge`. Région : **Europe (Paris ou Frankfurt)** pour le RGPD. Notez le mot de passe de la base.
2. Menu **SQL Editor** > **New query** : collez tout le contenu de `supabase/schema.sql`, cliquez **Run**.
3. Menu **Project Settings** > **API** : notez la **Project URL** et la clé **anon public**.

### 2. Code (GitHub)
1. Créez un compte sur github.com et un dépôt **privé** vide nommé `equimarge`.
2. Donnez-moi le nom du dépôt (ex. `votre-pseudo/equimarge`) : j'y envoie le code. Ou importez les fichiers vous-même.

### 3. Hébergement (Netlify)
1. Créez un compte sur netlify.com **avec votre compte GitHub**.
2. **Add new site** > **Import an existing project** > GitHub > choisissez `equimarge`. Les réglages de build sont lus dans `netlify.toml`.
3. **Obligatoire** : dans **Site configuration** > **Environment variables**, ajoutez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (valeurs notées à l'étape 1.3). Sans elles, le déploiement s'arrête avec un message d'erreur et l'ancienne version du site reste en ligne.
4. **Deploy**. Après 1 à 2 minutes, le site est en ligne sur une adresse `xxx.netlify.app`.

### 4. Relier Supabase au site
Dans Supabase > **Authentication** > **URL Configuration** :
- **Site URL** : l'adresse du site (Netlify, puis `https://equimarge.fr` une fois le domaine branché).
- **Redirect URLs** : ajoutez `https://VOTRE-ADRESSE/auth/callback`.

### 5. Vous déclarer administrateur
1. Sur le site, créez votre compte avec contact@equimarge.fr et confirmez l'e-mail.
2. Dans Supabase > SQL Editor, exécutez :
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'contact@equimarge.fr';
   ```
3. Reconnectez-vous : un bouton **Voir les demandes de diagnostic** apparaît dans votre espace.

### 6. Nom de domaine equimarge.fr
Dans Netlify > site > **Domain management**, ajoutez `equimarge.fr`, définissez-le comme **domaine principal** et suivez les instructions DNS chez votre registraire (OVH, Gandi…). Mettez ensuite à jour l'étape 4, puis relancez un déploiement (**Deploys** > **Trigger deploy**) : l'adresse du site utilisée par Google (plan du site, liens canoniques) est fixée au moment du déploiement.

### 7. Avant d'ouvrir au public
- Après l'immatriculation de la SASU, complétez `app/mentions-legales/page.jsx` et `app/confidentialite/page.jsx` : retirez « en cours de constitution », ajoutez l'adresse complète du siège, le SIREN, le capital social, « RCS Paris » et le n° de TVA intracommunautaire.
- Si vous avez exécuté `supabase/schema.sql` avant une mise à jour de ce fichier, exécutez-le à nouveau (il est relançable sans perte de données).
- La purge automatique des demandes de plus de 3 ans utilise l'extension **pg_cron**. Si l'exécution du fichier affiche « Purge automatique non programmée », activez `pg_cron` dans Supabase > **Database** > **Extensions**, puis relancez le fichier.
- Ajustez les formules, prix et domaines de conformité dans `components/offers.js`.
- Supabase envoie les e-mails de confirmation avec un expéditeur générique et une limite d'envois par heure. Pour un volume réel, branchez un service d'e-mail (Supabase > Authentication > SMTP Settings, ex. Brevo, gratuit jusqu'à 300 e-mails/jour).

### 8. Activer le poste de travail
Si votre base a été créée avant cette version, exécutez à nouveau tout `supabase/schema.sql` dans Supabase > SQL Editor (relançable sans perte de données). Il ajoute la formule « Automatisation », les tables de suivi et de notes, et le temps réel. Ouvrez ensuite `/admin` et cliquez **Activer les alertes**.

### 9. Être prévenu par e-mail, même page fermée (facultatif, 10 minutes)
1. Créez un compte gratuit sur [resend.com](https://resend.com) **avec l'adresse qui doit recevoir les alertes** (sans domaine vérifié, Resend n'écrit qu'à cette adresse). Menu **API Keys** > **Create API key**.
2. Netlify > **Site configuration** > **Environment variables** : ajoutez `RESEND_API_KEY` (la clé), `ALERT_EMAIL` (cette adresse) et `WEBHOOK_SECRET` (une longue phrase de votre choix). Relancez un déploiement.
3. Supabase > **Database** > **Webhooks** > **Create a new hook** : table `diagnostic_requests`, événement **Insert**, type **HTTP Request**, méthode **POST**, URL `https://VOTRE-ADRESSE/api/alerte-demande`, et un en-tête `x-webhook-secret` avec la même phrase que `WEBHOOK_SECRET`.
4. Faites une demande test sur le site : l'e-mail arrive en quelques secondes, et votre « Agent Mails » le range sous « Equimarge ».
5. Une fois `equimarge.fr` acheté et vérifié dans Resend, ajoutez `ALERT_FROM=Equimarge <alertes@equimarge.fr>`.

### 10. Apparaître dans Google
Le site fournit déjà tout ce que Google lit : `/sitemap.xml` (liste des pages publiques), `/robots.txt` (espaces privés exclus), titres, descriptions et image de partage. Les adresses utilisent le domaine principal du site sur Netlify (`xxx.netlify.app`, puis `equimarge.fr` après l'étape 6), ou la variable `SITE_URL` si vous la définissez. Il reste à signaler le site à Google, de préférence **après** l'étape 6 :
1. Ouvrez [Google Search Console](https://search.google.com/search-console) avec votre compte Google, puis **Ajouter une propriété**.
2. Deux façons de prouver que le site est à vous :
   - **Domaine** (recommandé, avec `equimarge.fr`) : copiez l'enregistrement TXT proposé et ajoutez-le dans la zone DNS de votre registraire, puis cliquez **Valider** (quelques minutes à quelques heures).
   - **Préfixe d'URL** (avec l'adresse Netlify) : méthode **Balise HTML**. Copiez uniquement la valeur de `content="…"`, ajoutez-la dans Netlify > **Site configuration** > **Environment variables** sous le nom `GOOGLE_SITE_VERIFICATION`, relancez un déploiement (**Deploys** > **Trigger deploy**), puis cliquez **Valider**.
3. Menu **Sitemaps** : saisissez `sitemap.xml` et cliquez **Envoyer**.
4. Menu **Inspection de l'URL** : collez l'adresse de l'accueil, puis **Demander l'indexation**.
5. Comptez quelques jours à deux semaines. Au début, le site sort surtout sur une recherche de son nom (« Equimarge ») ; les recherches générales viennent avec le temps et les liens vers le site.
6. (Facultatif) [Bing Webmaster Tools](https://www.bing.com/webmasters) : **Importer depuis Google Search Console**. Bing alimente aussi DuckDuckGo et Ecosia.

Pour être trouvé plus vite, créez des liens vers le site : fiche Google Business Profile, page LinkedIn, annuaires professionnels, signature e-mail.

## Travailler en local (optionnel)
```bash
npm install
cp .env.example .env.local   # puis remplissez les deux valeurs
npm run dev                  # http://localhost:3000
npm run lint && npm test     # vérifications, aussi lancées par GitHub à chaque modification
```

## Sécurité et conformité
- **Accès aux données** : chaque table est protégée par des règles Supabase (RLS) ; un client ne voit que ses propres données.
- **Formulaire public** : 3 demandes par heure au plus pour un même e-mail, 30 par heure au total, et un champ piège contre les robots.
- **En-têtes de sécurité** (`next.config.mjs`) : le site ne peut pas être affiché dans une autre page et ne charge que ses propres fichiers.
- **RGPD** : polices servies par le site (aucun appel à Google), demandes supprimables depuis `/admin`, purge automatique après 3 ans sans échange.
- **Dépendances** : `npm audit` est lancé par GitHub à chaque modification.
