// Les agents IA qui font tourner Equimarge (tâches planifiées dans Claude).
// Affichés dans le poste de travail (/admin). Modifiez ici si vous changez un horaire.
const GMAIL = 'https://mail.google.com/mail/u/0/';

export const AGENTS = [
  {
    name: 'Agent Mails',
    when: 'Chaque jour, 7 h 38',
    does: 'Trie la boîte, range le pro sous « Equimarge », prépare des brouillons de réponse.',
    link: { label: 'À traiter', href: `${GMAIL}#label/Equimarge%2F%C3%80+traiter` },
  },
  {
    name: 'Factures et relances',
    when: 'Lundi, 8 h 33',
    does: 'Repère les factures à encaisser ou à payer, prépare les relances.',
    link: { label: 'Brouillons', href: `${GMAIL}#drafts` },
  },
  {
    name: 'Veille juridique',
    when: 'Lundi, 8 h 37',
    does: 'Nouveautés SASU, facturation électronique, RGPD, AI Act, contrats B2B.',
    link: { label: 'Le document', href: 'https://drive.google.com/drive/search?q=%22Equimarge%20%E2%80%93%20Veille%20juridique%22' },
  },
  {
    name: 'Prospection',
    when: 'Mardi et jeudi, 9 h 32',
    does: '10 entreprises ciblées, un angle d’approche chacune, 3 brouillons d’e-mail.',
    link: { label: 'Les prospects', href: 'https://drive.google.com/drive/search?q=%22Equimarge%20%E2%80%93%20Prospects%22' },
  },
  {
    name: 'Analyse financière',
    when: 'Vendredi, 17 h 35',
    does: 'Trésorerie, mois d’avance, point mort, analyse de marché et risques cotés.',
    link: { label: 'Le document', href: 'https://drive.google.com/drive/search?q=%22Equimarge%20%E2%80%93%20Analyses%20financi%C3%A8res%22' },
  },
  {
    name: 'Superviseur',
    when: 'Chaque soir, 19 h 34',
    does: 'Contrôle les autres agents et vous envoie le rapport de cinq lignes.',
    link: null,
  },
];
