// Pôle conformité : domaines d'intervention (sur devis). Modifiez textes et listes ici.
// `key` sert à l'icône et au lien direct /conformite?domaine=… ; ne le changez pas.
export const COMPLIANCE_OFFER = 'Conformité';
export const COMPLIANCE = [
  {
    key: 'rgpd',
    id: 'RGPD',
    intro: 'Mettre en ordre le traitement des données personnelles de vos clients, salariés et prospects.',
    items: ['Cartographie des traitements et registre', "Mentions d'information et gestion des demandes", 'Revue des contrats de sous-traitance et de la sécurité'],
  },
  {
    key: 'dpo',
    id: 'DPO externalisé',
    intro: 'Un délégué à la protection des données externe, désigné auprès de la CNIL : obligatoire pour les organismes publics et certaines entreprises.',
    items: ['Désignation auprès de la CNIL et point de contact unique', 'Registre, demandes de droits et violations de données', 'Sensibilisation des équipes et rapport annuel'],
  },
  {
    key: 'ia',
    id: 'Intelligence artificielle (AI Act)',
    intro: "Encadrer l'usage de l'IA : le règlement européen impose déjà de former vos équipes et d'informer les personnes qui échangent avec une IA.",
    items: ["Inventaire des outils d'IA et classement des risques", "Charte d'usage et formation des équipes", 'Transparence envers clients et salariés, RGPD des outils'],
  },
  {
    key: 'lcbft',
    id: 'Anti-blanchiment (LCB-FT)',
    intro: "Organiser le dispositif anti-blanchiment des professions assujetties : agences immobilières, experts-comptables, domiciliataires…",
    items: ['Classification des risques', 'Procédures de vigilance sur les clients', 'Contrôle interne et sensibilisation des équipes'],
  },
  {
    key: 'sapin',
    id: 'Anticorruption (Sapin II)',
    intro: "Prévenir la corruption et le trafic d'influence, une exigence croissante des grands donneurs d'ordre envers leurs fournisseurs.",
    items: ['Cartographie des risques de corruption', "Code de conduite et dispositif d'alerte", 'Évaluation des tiers et contrôles'],
  },
  {
    key: 'procedures',
    id: 'Politiques et procédures internes',
    intro: 'Mettre par écrit vos règles de fonctionnement et les contrôles qui vont avec.',
    items: ['État des lieux de vos pratiques', 'Formalisation des politiques et procédures', 'Mise en place des contrôles et du suivi'],
  },
  {
    key: 'social',
    id: 'Droit social',
    intro: "Vérifier que vous remplissez vos obligations d'employeur avant un contrôle.",
    items: ['Affichages et registres obligatoires', 'Vérification du document unique (DUERP) et du règlement intérieur', 'Audit des pratiques et documents RH'],
  },
];

// Pôle automatisation : les « étages » d'agents IA installés chez le client (sur devis).
// Modifiez textes et listes ici. `key` sert à l'icône et au lien /automatisation?etage=… ; ne le changez pas.
export const AUTOMATION_OFFER = 'Automatisation';
export const AUTOMATION = [
  {
    key: 'messages',
    floor: 'Étage 1',
    id: 'Mails, messages et appels manqués',
    intro: 'L’agent trie chaque demande et prépare une réponse, y compris la nuit. Vous la relisez et vous l’envoyez.',
    items: ['Tri et classement de la boîte de réception', 'Réponses préparées, validées par vous', 'Appels manqués transformés en tâches'],
  },
  {
    key: 'factures',
    floor: 'Étage 2',
    id: 'Factures et relances',
    intro: 'L’agent prépare les factures, repère les retards de paiement et rédige les relances.',
    items: ['Suivi des factures émises et reçues', 'Relances graduées des impayés', 'Échéancier des paiements fournisseurs'],
  },
  {
    key: 'planning',
    floor: 'Étage 3',
    id: 'Planning et achats',
    intro: 'L’agent suit les rendez-vous, les tâches de l’équipe et les commandes fournisseurs. Vous ne ressaisissez rien.',
    items: ['Planning et rappels automatiques', 'Suivi des commandes et des stocks', 'Alertes avant les ruptures'],
  },
  {
    key: 'superviseur',
    floor: 'Dernier étage',
    id: 'Superviseur et rapport du soir',
    intro: 'Un agent surveille les autres et vous envoie cinq lignes chaque soir : ce qui est fait, ce qui vous attend.',
    items: ['Contrôle du travail des autres agents', 'Rapport de cinq lignes chaque soir', 'Alerte immédiate en cas de problème'],
  },
];

// Pôle de chaque demande, d'après sa formule (utilisé par le poste de travail)
export function poleOf(offer) {
  if (offer === COMPLIANCE_OFFER) return 'Conformité';
  if (offer === AUTOMATION_OFFER) return 'Automatisation';
  return 'Marges';
}

export const SECTORS = [
  'Commerce de détail',
  'Négoce / distribution',
  'Restauration',
  'Artisanat / BTP',
  'Industrie',
  'Services aux entreprises',
  'Immobilier (agence, gestion)',
  'Professions du chiffre et du droit',
  'Santé / médico-social',
  'Association / fondation',
  'Logement social',
  'Collectivité / établissement public',
  'Autre',
];

// Qui est concerné par quelle obligation (page /conformite). `key` renvoie au domaine du devis.
export const OBLIGATIONS = [
  {
    key: 'rgpd',
    who: 'Toute entreprise ou association',
    what: 'RGPD : registre des traitements, information des personnes, sécurité des données et contrats avec les sous-traitants.',
  },
  {
    key: 'dpo',
    who: 'Collectivités, établissements publics, offices HLM',
    what: "Désignation obligatoire d'un délégué à la protection des données (DPO), qui peut être externe.",
  },
  {
    key: 'lcbft',
    who: "Agences immobilières, experts-comptables, domiciliataires…",
    what: 'Dispositif anti-blanchiment : classification des risques, vigilance sur la clientèle, déclarations de soupçon à Tracfin, formation.',
  },
  {
    key: 'sapin',
    who: 'Entreprises de 500 salariés et plus, et plus de 100 M€ de chiffre d’affaires',
    what: 'Programme anticorruption Sapin II. Leurs fournisseurs sont évalués dans ce cadre et reçoivent des questionnaires.',
  },
  {
    key: 'ia',
    who: "Toute entreprise qui utilise l'IA",
    what: "Règlement européen sur l'IA : maîtrise de l'IA par les équipes et transparence envers les personnes concernées.",
  },
  {
    key: 'social',
    who: 'Tout employeur',
    what: 'Document unique d’évaluation des risques dès le premier salarié, règlement intérieur à partir de 50 salariés, affichages et registres.',
  },
];

export const REVENUE_BANDS = ['Moins de 500 k€', '500 k€ à 2 M€', '2 à 10 M€', 'Plus de 10 M€'];

export const STATUSES = ['Nouvelle', 'Contactée', 'Devis envoyé', 'Gagnée', 'Perdue'];

// Prestations proposées à l'ouverture d'un dossier client (modifiables librement dans la fiche)
export const MISSIONS = [
  'Mise en conformité RGPD',
  'DPO externalisé',
  'Anti-blanchiment (LCB-FT)',
  'Intelligence artificielle (AI Act)',
  'Anticorruption (Sapin II)',
  'Procédures internes',
  'Droit social',
];

// Offres présentées sur le site public (accueil, /offres, formulaire de /contact).
// `key` correspond aux domaines de COMPLIANCE : la demande enregistre le nom du domaine (`topic`).
// `tier` : 'principale', 'suivi' ou 'secondaire' (ordre et mise en avant sur les pages).
export const PRESTATIONS = [
  {
    key: 'rgpd',
    tier: 'principale',
    name: 'Mise en conformité RGPD',
    topic: 'RGPD',
    price: 'Forfait sur devis',
    short: 'Nous faisons l’état des lieux de vos traitements de données, puis nous rédigeons les documents que le RGPD exige.',
    who: 'Toute entreprise qui traite des données de clients, de salariés ou de prospects.',
    includes: [
      'Entretiens et relecture de vos documents pour repérer les écarts',
      'Registre des traitements',
      'Mentions d’information et politique de confidentialité',
      'Procédure de réponse aux demandes d’accès, de rectification et d’effacement',
      'Registre des violations de données et procédure de notification à la CNIL',
      'Durées de conservation, droits d’accès, cookies du site',
      'Liste des sous-traitants et des clauses à ajouter à leurs contrats',
      'Plan d’action classé par priorité',
    ],
  },
  {
    key: 'dpo',
    tier: 'suivi',
    name: 'DPO externalisé',
    topic: 'DPO externalisé',
    price: 'Abonnement mensuel sur devis',
    short: 'Equimarge est désignée comme délégué à la protection des données auprès de la CNIL et tient votre conformité à jour.',
    who: 'Obligatoire pour les organismes publics et les entreprises qui traitent à grande échelle des données sensibles ou suivent des personnes de façon systématique. Facultatif pour les autres.',
    includes: [
      'Désignation auprès de la CNIL',
      'Point de contact des personnes concernées et de la CNIL',
      'Registre des traitements tenu à jour',
      'Réponse aux demandes d’exercice des droits',
      'Traitement des violations de données, notification à la CNIL sous 72 heures si nécessaire',
      'Avis sur les nouveaux traitements et les analyses d’impact',
      'Sensibilisation des équipes et rapport annuel',
    ],
  },
  {
    key: 'ia',
    tier: 'secondaire',
    name: 'Conformité IA (AI Act)',
    topic: 'Intelligence artificielle (AI Act)',
    price: 'Forfait sur devis',
    short: 'Le règlement européen sur l’IA impose déjà de former les personnes qui utilisent ces outils et d’informer celles qui échangent avec une IA.',
    who: 'Toute entreprise dont les équipes utilisent des outils d’IA : assistants, chatbots, logiciels qui intègrent de l’IA.',
    includes: [
      'Inventaire des outils d’IA utilisés et de leurs usages',
      'Classement des usages selon les niveaux de risque du règlement',
      'Charte d’usage : ce qui est autorisé, ce qui ne doit jamais être saisi',
      'Formation des utilisateurs',
      'Information des clients et des salariés',
      'Vérification RGPD des outils',
    ],
  },
  {
    key: 'lcbft',
    tier: 'secondaire',
    name: 'Anti-blanchiment (LCB-FT)',
    topic: 'Anti-blanchiment (LCB-FT)',
    price: 'Forfait sur devis',
    short: 'Nous mettons en place le dispositif de lutte contre le blanchiment et le financement du terrorisme exigé des professions assujetties.',
    who: 'Professions assujetties : agences immobilières, administrateurs de biens, experts-comptables, sociétés de domiciliation, marchands d’art, entre autres.',
    includes: [
      'Classification des risques de votre activité',
      'Procédures de vigilance : identification du client et du bénéficiaire effectif',
      'Procédure de déclaration de soupçon à Tracfin',
      'Contrôle interne et conservation des pièces',
      'Formation des équipes',
    ],
  },
];

// Choix « je ne sais pas » du formulaire de devis
export const PRESTATION_UNSURE = { key: 'autre', name: 'Je ne sais pas encore', topic: 'À préciser' };
