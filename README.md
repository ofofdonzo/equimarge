# Equimarge

Application de suivi de marge pour PME, avec commande de diagnostic.

- **Accueil** : présentation et formules.
- **Mon espace** (`/tableau-de-bord`) : chaque client saisit ses produits ; marge, taux de marque, alertes et seuil de rentabilité sont calculés et sauvegardés.
- **Diagnostic** (`/diagnostic`) : formulaire ouvert à tous ; les demandes sont enregistrées dans la base.
- **Administration** (`/admin`) : vous seul voyez les demandes et changez leur statut.
- **Mentions légales** et **Confidentialité** : modèles à compléter (cherchez `[À COMPLÉTER]`).

Technique : Next.js 14 (site), Supabase (comptes et base de données, offre gratuite), Vercel (hébergement, offre gratuite).

## Mise en ligne, pas à pas

Comptez une heure. Tout se fait depuis un navigateur, sur ordinateur de préférence.

### 1. Base de données (Supabase)
1. Créez un compte sur supabase.com, puis **New project**. Nom : `equimarge`. Région : **Europe (Paris ou Frankfurt)** pour le RGPD. Notez le mot de passe de la base.
2. Menu **SQL Editor** > **New query** : collez tout le contenu de `supabase/schema.sql`, cliquez **Run**.
3. Menu **Project Settings** > **API** : notez la **Project URL** et la clé **anon public**.

### 2. Code (GitHub)
1. Créez un compte sur github.com et un dépôt **privé** vide nommé `equimarge`.
2. Donnez-moi le nom du dépôt (ex. `votre-pseudo/equimarge`) : j'y envoie le code. Ou importez les fichiers vous-même.

### 3. Hébergement (Vercel)
1. Créez un compte sur vercel.com **avec votre compte GitHub**.
2. **Add New** > **Project** > choisissez `equimarge` > **Import**.
3. Dans **Environment Variables**, ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL` = la Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la clé anon public
4. **Deploy**. Après 1 à 2 minutes, le site est en ligne sur une adresse `equimarge-xxx.vercel.app`.

### 4. Relier Supabase au site
Dans Supabase > **Authentication** > **URL Configuration** :
- **Site URL** : l'adresse du site (Vercel, puis `https://equimarge.fr` une fois le domaine branché).
- **Redirect URLs** : ajoutez `https://VOTRE-ADRESSE/auth/callback`.

### 5. Vous déclarer administrateur
1. Sur le site, créez votre compte avec contact@equimarge.fr et confirmez l'e-mail.
2. Dans Supabase > SQL Editor, exécutez :
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'contact@equimarge.fr';
   ```
3. Reconnectez-vous : un bouton **Voir les demandes de diagnostic** apparaît dans votre espace.

### 6. Nom de domaine equimarge.fr
Dans Vercel > projet > **Settings** > **Domains**, ajoutez `equimarge.fr` et suivez les instructions DNS chez votre registraire (OVH, Gandi…). Mettez ensuite à jour l'étape 4.

### 7. Avant d'ouvrir au public
- Complétez les `[À COMPLÉTER]` des pages légales (SIREN, adresse, responsable).
- Ajustez les formules et prix dans `components/offers.js`.
- Supabase envoie les e-mails de confirmation avec un expéditeur générique et une limite d'envois par heure. Pour un volume réel, branchez un service d'e-mail (Supabase > Authentication > SMTP Settings, ex. Brevo, gratuit jusqu'à 300 e-mails/jour).

## Travailler en local (optionnel)
```bash
npm install
cp .env.example .env.local   # puis remplissez les deux valeurs
npm run dev                  # http://localhost:3000
```
