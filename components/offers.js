// Formules de diagnostic : modifiez les prix et contenus ici, ils se mettent à jour partout.
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
    items: ['Analyse produit par produit', "Revue des prix et des coûts d'achat", 'Rapport écrit et restitution'],
  },
  {
    id: 'Complet',
    delay: 'Sous 3 semaines',
    price: '1 290 € HT',
    items: ["Tout l'Essentiel", 'Cartographie des risques financiers', "Plan d'action chiffré et suivi à 3 mois"],
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
