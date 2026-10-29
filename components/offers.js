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
// Pré-diagnostic conformité offert : l'offre des publicités (page /pre-diagnostic, textes dans app/pre-diagnostic/page.jsx)
export const PRE_DIAGNOSTIC_OFFER = 'Pré-diagnostic';
export const COMPLIANCE = [
  {
    key: 'procedures',
    id: 'Politiques et procédures internes',
    intro: 'Formaliser vos règles de fonctionnement pour sécuriser les décisions et les contrôles.',
    items: ['État des lieux de vos pratiques', 'Formalisation des politiques et procédures', 'Mise en place des contrôles et du suivi'],
  },
  {
    key: 'rgpd',
    id: 'RGPD',
    intro: 'Mettre en ordre le traitement des données personnelles de vos clients, salariés et prospects.',
    items: ['Cartographie des traitements et registre', "Mentions d'information et gestion des demandes", 'Encadrement des sous-traitants et de la sécurité'],
  },
  {
    key: 'lcbft',
    id: 'Anti-blanchiment (LCB-FT)',
    intro: 'Organiser le dispositif de lutte contre le blanchiment et le financement du terrorisme des professions assujetties.',
    items: ['Classification des risques', 'Procédures de vigilance sur les clients', 'Contrôle interne et sensibilisation des équipes'],
  },
  {
    key: 'sapin',
    id: 'Anticorruption (Sapin II)',
    intro: "Prévenir la corruption et le trafic d'influence, une exigence croissante des grands donneurs d'ordre envers leurs fournisseurs.",
    items: ['Cartographie des risques de corruption', "Code de conduite et dispositif d'alerte", 'Évaluation des tiers et contrôles'],
  },
  {
    key: 'social',
    id: 'Droit social',
    intro: "Vérifier que vos obligations d'employeur sont couvertes, au quotidien comme en cas de contrôle.",
    items: ['Affichages et registres obligatoires', 'Vérification du document unique (DUERP) et du règlement intérieur', 'Audit des pratiques et documents RH'],
  },
];

export const SECTORS = [
  'Commerce de détail',
  'Négoce / distribution',
  'Restauration',
  'Artisanat / BTP',
  'Industrie',
  'Services aux entreprises',
  'Autre',
];

export const REVENUE_BANDS = ['Moins de 500 k€', '500 k€ à 2 M€', '2 à 10 M€', 'Plus de 10 M€'];

export const STATUSES = ['Nouvelle', 'Contactée', 'Devis envoyé', 'Gagnée', 'Perdue'];
