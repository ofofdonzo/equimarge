# Equimarge

Site et application pour PME, en deux pôles : suivi de marge (outil gratuit et diagnostic) et mise en conformité (sur devis).

- **Accueil** : présentation et formules.
- **Mon espace** (`/tableau-de-bord`) : chaque client saisit ses produits ; marge, taux de marque, alertes et seuil de rentabilité sont calculés et sauvegardés.
- **Diagnostic** (`/diagnostic`) : formulaire ouvert à tous ; les demandes sont enregistrées dans la base.
- **Conformité** (`/conformite`) : domaines d'intervention, démarche et formulaire de demande de devis (mêmes demandes, formule « Conformité »).
- **Administration** (`/admin`) : vous seul voyez les demandes et changez leur statut.
- **Mentions légales** et **Confidentialité** : remplies pour une SASU en cours de constitution ; à compléter après l'immatriculation (voir l'étape 7).

Technique : Next.js 14 (site), Supabase (comptes et base de données, offre gratuite), Netlify (hébergement, offre gratuite).

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
3. (Facultatif) Dans **Site configuration** > **Environment variables**, ajoutez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` ; sinon les valeurs de `lib/supabase/config.js` sont utilisées.
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
Dans Netlify > site > **Domain management**, ajoutez `equimarge.fr` et suivez les instructions DNS chez votre registraire (OVH, Gandi…). Mettez ensuite à jour l'étape 4.

### 7. Avant d'ouvrir au public
- Après l'immatriculation de la SASU, complétez `app/mentions-legales/page.jsx` et `app/confidentialite/page.jsx` : retirez « en cours de constitution », ajoutez l'adresse complète du siège, le SIREN, le capital social, « RCS Paris » et le n° de TVA intracommunautaire.
- Si vous avez exécuté `supabase/schema.sql` avant une mise à jour de ce fichier, exécutez-le à nouveau (il est relançable sans perte de données).
- Ajustez les formules, prix et domaines de conformité dans `components/offers.js`.
- Supabase envoie les e-mails de confirmation avec un expéditeur générique et une limite d'envois par heure. Pour un volume réel, branchez un service d'e-mail (Supabase > Authentication > SMTP Settings, ex. Brevo, gratuit jusqu'à 300 e-mails/jour).

### 8. Apparaître dans Google
Le site fournit déjà tout ce que Google lit : `/sitemap.xml` (liste des pages publiques), `/robots.txt` (espaces privés exclus), titres, descriptions et image de partage. Les adresses suivent automatiquement le domaine utilisé (`xxx.netlify.app`, puis `equimarge.fr`). Il reste à signaler le site à Google, de préférence **après** l'étape 6 :
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
```
