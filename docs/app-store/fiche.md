# Fiche App Store — à copier dans App Store Connect

Langue principale : **Français (France)**. Les longueurs sont vérifiées par `node --test tests/app-store.test.mjs`.

## Informations de l'app

| Champ | Valeur |
|---|---|
| Nom (30 caractères max.) | Equimarge |
| Sous-titre (30 max.) | Votre dossier de conformité |
| Identifiant de lot (bundle ID) | fr.equimarge.app |
| SKU | equimarge-ios |
| Catégorie principale | Économie et entreprise |
| Catégorie secondaire | Productivité |
| Prix | Gratuit |
| URL de la politique de confidentialité | https://equimarge.netlify.app/confidentialite |
| URL d'assistance | https://equimarge.netlify.app/assistance |
| URL marketing | https://equimarge.netlify.app |
| Copyright | 2026 Equimarge |

Si le domaine equimarge.fr est branché avant l'envoi, remplacez `equimarge.netlify.app` par `equimarge.fr` partout.

## Texte promotionnel (170 max.)

Suivez votre mise en conformité RGPD, DPO externalisé et anti-blanchiment avec votre consultant : demandes, documents, livrables et messages, au même endroit.

## Description (4 000 max.)

Equimarge accompagne les PME et les intermédiaires d’assurance dans leur mise en conformité : RGPD et DPO externalisé, anti-blanchiment, intelligence artificielle, anticorruption, procédures internes.

L’application Equimarge est votre espace client. Votre consultant réalise la mission ; vous suivez l’avancement et vous lui transmettez ce dont il a besoin, depuis votre iPhone.

VOTRE DOSSIER EN UN COUP D’ŒIL
• Ce que vous avez à fournir, avec les échéances
• L’avancement du plan d’action et les prochaines étapes
• Le registre des traitements et la cartographie des risques établis pour vous

RÉPONDRE AUX DEMANDES
• Répondez aux demandes d’informations de votre consultant
• Joignez un document ou photographiez-le avec l’iPhone
• PDF, Word, Excel, images : 10 Mo au plus par fichier

VOS LIVRABLES
• Retrouvez les documents livrés par Equimarge : registre, rapports, procédures
• Ouvrez-les, enregistrez-les ou partagez-les

ÉCHANGER AVEC VOTRE CONSULTANT
• Une messagerie dans votre dossier, sans perdre le fil dans vos e-mails
• Des notifications pour une nouvelle demande, un livrable ou un message (si vous les activez)

AUTO-DIAGNOSTIC GRATUIT
• Évaluez votre conformité domaine par domaine et obtenez votre score

DES DONNÉES PROTÉGÉES
• Données hébergées dans l’Union européenne
• Documents dans un espace privé : seuls vous et Equimarge y avez accès
• Notifications sans contenu : rien de confidentiel sur l’écran verrouillé
• Ni publicité, ni pistage, ni mesure d’audience
• Suppression du compte à tout moment depuis l’application

Application réservée aux professionnels. L’accompagnement Equimarge fait l’objet d’un devis ; l’application et l’auto-diagnostic sont gratuits.

## Mots-clés (100 max., séparés par des virgules)

conformité,RGPD,DPO,anti-blanchiment,LCB-FT,courtier,assurance,DDA,registre,PME,audit,dossier

## Nouveautés de la version 1.0

Première version : votre dossier de conformité, les demandes de votre consultant, vos documents et livrables, et la messagerie.

## Captures d'écran (iPhone 6,9 pouces, 1320 × 2868)

Dans l'ordre, depuis `docs/app-store/captures/` :
1. `1-accueil.png` — tableau de bord du dossier
2. `2-demandes.png` — répondre à une demande et joindre un document
3. `3-documents.png` — livrables et documents transmis
4. `4-messages.png` — messagerie avec le consultant
5. `5-compte.png` — compte, notifications et suppression du compte (facultative)

Elles montrent l'application avec un dossier d'exemple fictif (« Courtage Bêta »). Pour les refaire :
`EQUIMARGE_DEMO=1 node scripts/build-mobile.mjs`, puis ouvrir `mobile/demo/index.html?onglet=infos` (onglets : `infos`,
`documents`, `messages` ; `?ecran=account` pour le compte) dans une fenêtre de 440 × 956 points.

## Classification par âge

Répondez « Aucun » ou « Non » à toutes les questions de contenu (violence, contenu sexuel, jeux d'argent, etc.).
Pour les questions sur les échanges : l'application contient une messagerie privée **uniquement entre le client et son
consultant Equimarge** (pas entre utilisateurs, pas de contenu public). Pas de navigateur web libre, pas d'achat intégré.
