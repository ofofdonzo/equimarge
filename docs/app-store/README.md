# Publier l'application iPhone Equimarge

L'application est prête dans le dépôt : écrans intégrés (`mobile/`), projet Xcode (`ios/`), construction
automatique sur GitHub (`.github/workflows/ios.yml`) et envoi sur l'App Store en un clic
(`.github/workflows/app-store.yml`). **Aucun Mac n'est nécessaire** : GitHub construit et signe l'application sur
ses machines Apple.

Ce qui suit ne peut être fait que par vous, avec vos comptes. Comptez une heure, plus les délais d'Apple.

## 1. Mettre le site à jour (5 minutes)

1. Fusionnez la pull request de l'application sur GitHub. Netlify met le site en ligne tout seul.
2. **Netlify** > votre site > *Site configuration* > *Environment variables* : vérifiez que
   `SUPABASE_SERVICE_ROLE_KEY` existe (Supabase > *Project Settings* > *API keys* > clé `service_role`, ou clé secrète
   `sb_secret_…`). **Sans elle, la suppression du compte ne fonctionne pas, et Apple refusera l'application.**
   `WEBHOOK_SECRET` doit déjà y être (alertes des nouvelles demandes).
3. **Supabase** > *Authentication* > *URL Configuration* > *Redirect URLs* : ajoutez
   `https://equimarge.netlify.app/**` (liens de confirmation et de mot de passe oublié). Remplacez par
   `https://equimarge.fr/**` si le domaine est branché.
4. **Supabase** > *Authentication* > réglages des mots de passe : longueur minimale **8**, et activez la protection
   contre les mots de passe piratés (*leaked password protection*) si votre offre la propose.

## 2. Compte Apple Developer (99 $ par an)

<https://developer.apple.com/programs/enroll/>

- **Equimarge n'est pas encore immatriculée** : l'inscription « organisation » demande une société existante et un
  numéro D-U-N-S. En attendant, inscrivez-vous comme **particulier** : l'App Store affichera alors votre nom comme
  vendeur. Après l'immatriculation, l'assistance Apple peut transformer le compte en compte d'organisation.
- Activez la double authentification sur votre identifiant Apple (obligatoire).

## 3. Identifiant de l'application et clé de notifications

Dans <https://developer.apple.com/account> > *Certificates, Identifiers & Profiles* :

1. *Identifiers* > **+** > *App IDs* > *App* : description `Equimarge`, Bundle ID **explicite**
   `fr.equimarge.app`, cochez **Push Notifications**. Enregistrez.
2. *Keys* > **+** : nom `Equimarge notifications`, cochez **Apple Push Notifications service (APNs)** >
   *Continue* > *Register* > **Download** (fichier `AuthKey_XXXXXXXXXX.p8`, téléchargeable une seule fois).
3. Dans **Netlify** > *Environment variables*, ajoutez :
   - `APNS_KEY_ID` : les 10 caractères de la clé (affichés sur la page de la clé) ;
   - `APNS_TEAM_ID` : votre *Team ID* (en haut à droite du compte développeur, 10 caractères) ;
   - `APNS_PRIVATE_KEY` : tout le contenu du fichier `.p8`, lignes `-----BEGIN` et `-----END` comprises.
   Puis *Deploys* > *Trigger deploy* pour que le site les prenne en compte.

## 4. Créer l'application dans App Store Connect

<https://appstoreconnect.apple.com> > *Apps* > **+** > *Nouvelle app* :
plateforme **iOS**, nom **Equimarge**, langue principale **Français (France)**, identifiant de lot
**fr.equimarge.app**, SKU **equimarge-ios**, accès complet.

Si le nom « Equimarge » est déjà pris sur l'App Store, utilisez « Equimarge Conformité ».

## 5. Autoriser GitHub à envoyer l'application

1. App Store Connect > *Utilisateurs et accès* > *Intégrations* > *App Store Connect API* > *Clés d'équipe* >
   **+** : nom `GitHub`, accès **Admin** (nécessaire pour créer les certificats de signature). Téléchargez la clé
   (`AuthKey_XXXXXXXXXX.p8`, une seule fois) et notez le **Key ID** et l'**Issuer ID** affichés au-dessus du tableau.
2. GitHub > dépôt `equimarge` > *Settings* > *Secrets and variables* > *Actions* > *New repository secret*, quatre
   secrets :
   - `APPLE_TEAM_ID` : votre Team ID ;
   - `APP_STORE_CONNECT_KEY_ID` : le Key ID ;
   - `APP_STORE_CONNECT_ISSUER_ID` : l'Issuer ID ;
   - `APP_STORE_CONNECT_PRIVATE_KEY` : tout le contenu du fichier `.p8`.

   Le dépôt est public, mais les secrets ne sont jamais visibles, ni dans le code ni dans les journaux.

## 6. Construire et tester sur votre iPhone

1. GitHub > *Actions* > **Envoi sur l'App Store** > *Run workflow* (branche `main`). Comptez 15 à 25 minutes.
2. La version apparaît dans App Store Connect > *TestFlight* après le traitement par Apple (10 à 30 minutes).
3. Installez l'app **TestFlight** sur votre iPhone, ajoutez-vous comme testeur interne, installez Equimarge.
4. Vérifiez : connexion, dossier, réponse à une demande avec une photo, ouverture d'un livrable, message,
   notifications (activez-les dans *Mon compte*, puis envoyez un message depuis le poste de travail), suppression
   d'un compte de test.

Pour chaque nouvelle version : modifiez `MARKETING_VERSION` (par exemple 1.1) dans le projet Xcode si vous le
souhaitez, puis relancez le workflow ; le numéro de build augmente tout seul.

## 7. Compte de démonstration pour Apple

Apple exige un compte de test avec un dossier rempli (règle 2.1).

1. Créez un compte sur le site ou dans l'application avec une adresse que vous recevez, par exemple
   `votre.adresse+apple@gmail.com`. Confirmez-le.
2. Sur le poste de travail : *Clients* > ouvrez ce dossier > statut **En cours**, offre « DPO externalisé ».
   Ajoutez une demande d'information, déposez un livrable et écrivez un message.
3. Notez l'adresse et le mot de passe dans les notes de validation (étape 8).

## 8. Remplir la fiche et envoyer à la validation

App Store Connect > votre app > version **1.0** :

- textes, mots-clés, adresses et catégories : `docs/app-store/fiche.md` ;
- captures d'écran iPhone 6,9 pouces : `docs/app-store/captures/` (1 à 4, la 5 en option) ;
- *Confidentialité de l'app* : `docs/app-store/confidentialite.md` ;
- *Classification par âge* : voir la fin de `fiche.md` ;
- *Informations pour la validation* : compte de démonstration et `docs/app-store/notes-validation.md` ;
- *Statut de commerçant* (Union européenne) : déclarez-vous commerçant, avec adresse, téléphone et e-mail publics ;
- *Build* : choisissez la version envoyée par GitHub ;
- **Ajouter pour validation**. Apple répond en général sous 24 à 48 heures.

## Si Apple refuse

Le message d'Apple cite une règle (par exemple 4.2 ou 5.1.1). Collez-le dans une session Claude Code sur ce dépôt :
la réponse ou la correction se prépare à partir de ce message.

## Pour les développeurs

```bash
node scripts/build-mobile.mjs        # écrans de l'application dans mobile/www
npx cap sync ios                      # copie dans le projet Xcode (ios/App/App/public)
EQUIMARGE_DEMO=1 node scripts/build-mobile.mjs   # version de démonstration hors ligne (captures)
```

- Les écrans de l'application réutilisent ceux du site (`app/tableau-de-bord/conformite/`) ; seuls trois modules
  sont remplacés (`next/link`, `@/lib/supabase/client`, `@/lib/platform`, voir `scripts/build-mobile.mjs`).
- Aucune page n'est chargée depuis internet : l'appli ne parle qu'à Supabase (mêmes règles d'accès que le site) et à
  `/api/compte` (suppression du compte, jeton de session obligatoire).
- Notifications : la base appelle `/api/notification` (`notifier_dossier`, `supabase/schema.sql`), qui envoie à
  Apple (`lib/apns.mjs`) sans jamais transmettre le contenu des messages.
