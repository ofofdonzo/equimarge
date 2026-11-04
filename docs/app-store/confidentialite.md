# Confidentialité de l'app — réponses pour App Store Connect

App Store Connect > votre app > **Confidentialité de l'app**. Ces réponses correspondent à ce que fait réellement
l'application (et au fichier `ios/App/App/PrivacyInfo.xcprivacy`).

**Collectez-vous des données à partir de cette app ?** Oui.

| Type de données | Collecté | Lié à l'utilisateur | Utilisé pour le suivi (pistage) | Finalité |
|---|---|---|---|---|
| Coordonnées > Adresse e-mail | Oui | Oui | Non | Fonctionnalités de l'app |
| Contenu utilisateur > Photos ou vidéos (photos de documents transmis) | Oui | Oui | Non | Fonctionnalités de l'app |
| Contenu utilisateur > Autre contenu utilisateur (réponses, documents, messages) | Oui | Oui | Non | Fonctionnalités de l'app |
| Identifiants > Identifiant de l'utilisateur | Oui | Oui | Non | Fonctionnalités de l'app |
| Identifiants > Identifiant de l'appareil (jeton de notification, seulement si activées) | Oui | Oui | Non | Fonctionnalités de l'app |

Non collectés : localisation, contacts, historique de navigation, historique de recherche, données financières,
santé, données d'utilisation, diagnostics, achats, informations sensibles.

**Pistage (App Tracking Transparency)** : aucun. L'application ne contient ni publicité, ni outil de mesure
d'audience, ni SDK tiers de suivi. Ne pas activer la demande de pistage.

**Chiffrement (export)** : l'application n'utilise que le chiffrement standard d'iOS (HTTPS). La clé
`ITSAppUsesNonExemptEncryption = NO` est déjà dans `Info.plist` : App Store Connect ne posera plus la question.

**Statut de commerçant (Union européenne, DSA)** : Equimarge est un professionnel. App Store Connect demande une
adresse, un téléphone et un e-mail qui seront affichés publiquement sur la fiche dans l'Union européenne.
