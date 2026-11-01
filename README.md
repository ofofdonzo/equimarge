# Equimarge

Site et application pour PME, en trois pôles : mise en conformité (sur devis), suivi de marge (outil gratuit et diagnostic) et automatisation des tâches répétitives par agents IA (sur devis).

- **Accueil** : présentation et formules.
- **Mon espace** (`/tableau-de-bord`) : chaque client saisit ses produits ; marge, taux de marque, alertes et seuil de rentabilité sont calculés et sauvegardés.
- **Mon dossier conformité** (`/tableau-de-bord/conformite`) : chaque client a un dossier. Sans mission, il y fait l'auto-diagnostic gratuit (44 questions sur six domaines) ; pendant une mission, il répond à vos demandes d'informations, dépose ses documents et consulte tableau de bord, plan d'action, registre RGPD, risques et livrables (en lecture seule), exportables vers Excel. Les questions se modifient dans `lib/conformite.mjs`.
- **Dossiers clients** (`/admin/clients`, administrateur) : la liste de tous les dossiers (missions, auto-diagnostics, terminés) et, pour chacun, une fiche où vous réalisez la mission : demandes d'informations, documents et livrables, auto-diagnostic, plan d'action, registre, risques. Un dossier s'ouvre depuis une demande (bouton « Ouvrir un dossier client », automatique quand elle passe en « Gagnée ») ou avec « Nouveau dossier ». Le client y accède en créant son espace avec l'e-mail du dossier (bouton « Inviter le client »).
- **Diagnostic** (`/diagnostic`) : formulaire ouvert à tous ; les demandes sont enregistrées dans la base.
- **Conformité** (`/conformite`) : qui est concerné par quelle obligation, domaines d'intervention (RGPD, DPO externalisé, IA, anti-blanchiment, anticorruption, procédures, droit social), démarche et formulaire de demande de devis (mêmes demandes, formule « Conformité »).
- **Automatisation** (`/automatisation`) : les « étages » d'agents IA (mails et appels manqués, factures et relances, planning et achats, superviseur et rapport du soir) et le formulaire de devis (formule « Automatisation »).
- **Poste de travail** (`/admin`) : réservé à vous. S'installe comme une appli sur l'iPhone ou l'ordinateur. Les demandes arrivent en direct (son, compteur dans l'onglet) et une notification vous prévient même appli fermée. Pour chacune : réponse e-mail préparée en un clic, appel, statut, montant du devis, prochaine relance datée, notes privées, et « Copier pour Claude » pour préparer la réponse avec Claude. En bas, vos agents IA et leurs horaires. Les montants et les notes sont dans des tables à part que le client ne voit jamais.
- **Mentions légales**, **Conditions générales** et **Confidentialité** : remplies pour une SASU en cours de constitution ; à compléter après l'immatriculation (voir l'étape 7).

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
3. (Facultatif) Le site utilise par défaut le projet Supabase d'Equimarge, inscrit dans `lib/supabase/config.js`. Pour un autre projet, ajoutez dans **Site configuration** > **Environment variables** `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (valeurs notées à l'étape 1.3).
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
- Faites relire `app/conditions-generales/page.jsx` avant la première vente (prix, délais de paiement, responsabilité). Si la SASU relève de la franchise en base de TVA, indiquez « TVA non applicable, art. 293 B du CGI » sur les devis et factures.
- Chaque e-mail de prospection doit dire d'où viennent les coordonnées du destinataire et lui permettre de refuser tout nouvel envoi (voir la politique de confidentialité).
- Si vous avez exécuté `supabase/schema.sql` avant une mise à jour de ce fichier, exécutez-le à nouveau (il est relançable sans perte de données). C'est nécessaire pour les dossiers clients : tant que leurs tables n'existent pas, les pages l'indiquent et rien ne s'enregistre. Le fichier crée aussi l'espace de stockage privé « dossiers » des documents (Supabase > Storage).
- La purge automatique des demandes de plus de 3 ans utilise l'extension **pg_cron**. Si l'exécution du fichier affiche « Purge automatique non programmée », activez `pg_cron` dans Supabase > **Database** > **Extensions**, puis relancez le fichier.
- Ajustez les formules, prix et domaines de conformité dans `components/offers.js`.
- Supabase envoie les e-mails de confirmation avec un expéditeur générique et une limite d'envois par heure. Pour un volume réel, branchez un service d'e-mail (Supabase > Authentication > SMTP Settings, ex. Brevo, gratuit jusqu'à 300 e-mails/jour).

### 8. Activer le poste de travail
Si votre base a été créée avant cette version, exécutez à nouveau tout `supabase/schema.sql` dans Supabase > SQL Editor (relançable sans perte de données). Il ajoute la formule « Automatisation », les tables de suivi et de notes, et le temps réel. Ouvrez ensuite `/admin` et cliquez **Activer les alertes**.

### 9. Être prévenu sur votre téléphone, même appli fermée (10 minutes)
Le poste de travail s'installe comme une appli (iPhone, Android, ordinateur) et reçoit une notification à chaque nouvelle demande. La base Supabase prévient le site, qui envoie la notification (et un e-mail si vous le souhaitez).

1. **Netlify** > **Site configuration** > **Environment variables**, ajoutez :
   - `WEBHOOK_SECRET` : une longue phrase secrète de votre choix ;
   - `VAPID_PRIVATE_KEY` : la clé privée des notifications (celle qui va avec la clé publique de `lib/push.js` ; pour en générer une nouvelle paire : `npx web-push generate-vapid-keys`, puis mettez la publique dans `lib/push.js`) ;
   - `SUPABASE_SERVICE_ROLE_KEY` : Supabase > **Project Settings** > **API Keys** > clé **service_role** (secrète : jamais dans le code).

   Puis **Deploys** > **Trigger deploy**.
2. **Supabase** > **SQL Editor** : exécutez `supabase/schema.sql` (étapes 7 et 8), puis rangez le secret dans le coffre-fort, avec la même phrase que `WEBHOOK_SECRET` :
   ```sql
   select vault.create_secret('VOTRE-PHRASE', 'equimarge_webhook_secret');
   ```
   (Pour la changer plus tard : `select vault.update_secret(id, 'NOUVELLE-PHRASE') from vault.secrets where name = 'equimarge_webhook_secret';`)
3. **Sur iPhone** : ouvrez `https://VOTRE-ADRESSE/admin` dans **Safari** > **Partager** > **Sur l'écran d'accueil**. Ouvrez Equimarge depuis l'icône, puis **Activer les alertes** > **Autoriser**. (Sur ordinateur ou Android, **Activer les alertes** suffit.) Faites-le sur chaque appareil à prévenir.
4. Faites une demande test sur le site : la notification arrive en quelques secondes. Un appui dessus ouvre directement la fiche.

**E-mail en plus (facultatif)** : créez un compte sur [resend.com](https://resend.com) avec l'adresse qui doit recevoir les alertes, **API Keys** > **Create API key**, puis ajoutez dans Netlify `RESEND_API_KEY` et `ALERT_EMAIL`. Une fois `equimarge.fr` vérifié dans Resend, ajoutez `ALERT_FROM=Equimarge <alertes@equimarge.fr>`.

N'ajoutez pas en plus un « Database Webhook » dans le tableau de bord Supabase : chaque alerte arriverait deux fois.

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
