// Formules de diagnostic : modifiez les prix et contenus ici, ils se mettent à jour partout.
// `featured: true` met une formule en avant sur l'accueil (badge « Recommandée »).
export const OFFERS = [
  {
    id: 'Flash',
    delay: '30 min, en visio',
    price: 'Gratuit',
    items: ['Lecture de vos marges actuelles', "Trois points d'alerte"],
  },
  {
    id: 'Essentiel',
    delay: 'Sous 10 jours',
    price: '490 € HT',
    featured: true,
    items: ['Analyse produit par produit', "Revue des prix et des coûts d'achat", 'Rapport écrit et restitution'],
  },
  {
    id: 'Complet',
    delay: 'Sous 3 semaines',
    price: '1 290 € HT',
    items: ["Tout l'Essentiel", 'Cartographie des risques financiers', "Plan d'action chiffré et suivi à 3 mois"],
  },
];

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
    intro: "Organiser le dispositif anti-blanchiment des professions assujetties : agences immobilières, intermédiaires d'assurance, experts-comptables, domiciliataires…",
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
    intro: 'Formaliser vos règles de fonctionnement pour sécuriser les décisions et les contrôles.',
    items: ['État des lieux de vos pratiques', 'Formalisation des politiques et procédures', 'Mise en place des contrôles et du suivi'],
  },
  {
    key: 'social',
    id: 'Droit social',
    intro: "Vérifier que vos obligations d'employeur sont couvertes, au quotidien comme en cas de contrôle.",
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
    intro: 'Chaque demande est triée et sa réponse préparée, même à 2 h du matin : vous la relisez et l’envoyez.',
    items: ['Tri et classement de la boîte de réception', 'Réponses préparées, validées par vous', 'Appels manqués transformés en tâches'],
  },
  {
    key: 'factures',
    floor: 'Étage 2',
    id: 'Factures et relances',
    intro: 'Les factures partent, les retards de paiement sont repérés et relancés au bon moment.',
    items: ['Suivi des factures émises et reçues', 'Relances graduées des impayés', 'Échéancier des paiements fournisseurs'],
  },
  {
    key: 'planning',
    floor: 'Étage 3',
    id: 'Planning et achats',
    intro: 'Rendez-vous, tâches de l’équipe et commandes fournisseurs suivis sans ressaisie.',
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
  'Assurance / courtage',
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
    who: "Agences immobilières, intermédiaires d'assurance, experts-comptables, domiciliataires…",
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
