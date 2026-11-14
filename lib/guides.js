// Guides pratiques publiés sur /guides. Chaque affirmation juridique renvoie à une source officielle listée en bas du guide.
// Un bloc de contenu est soit un paragraphe (chaîne), soit une liste ({ list: [...] }).
export const GUIDES = [
  {
    slug: 'dpo-obligatoire',
    title: 'DPO : dans quels cas la désignation est-elle obligatoire ?',
    description: 'Les trois cas où le RGPD impose un délégué à la protection des données, ce que recouvre la « grande échelle », et le choix entre un DPO interne et un DPO externalisé.',
    updated: '2026-11-10',
    intro: 'Le délégué à la protection des données (DPO) conseille l’entreprise et contrôle le respect du RGPD. Sa désignation est obligatoire dans trois cas, et facultative dans les autres.',
    sections: [
      {
        title: 'Les trois cas de désignation obligatoire',
        body: [
          { list: ['Les autorités et organismes publics.', 'Les organismes dont l’activité de base consiste en un suivi régulier et systématique des personnes à grande échelle. La CNIL cite les assureurs et les banques pour leurs fichiers clients, ainsi que les opérateurs téléphoniques.', 'Les organismes qui traitent à grande échelle des données sensibles (santé, biométrie, génétique) ou des données relatives à des condamnations pénales.'] },
          'En dehors de ces cas, la désignation n’est pas obligatoire. La CNIL l’encourage.',
        ],
      },
      {
        title: 'Ce que recouvre la « grande échelle »',
        body: [
          'Le RGPD ne fixe aucun seuil chiffré. Les lignes directrices européennes invitent à tenir compte de quatre critères :',
          { list: ['le nombre de personnes concernées ;', 'le volume de données traitées ;', 'la durée du traitement ;', 'son étendue géographique.'] },
          'Une PME peut donc être concernée si son activité consiste à traiter des données de santé pour un grand nombre de personnes.',
        ],
      },
      {
        title: 'Le rôle du DPO',
        body: [
          { list: ['Il informe et conseille l’entreprise et ses salariés.', 'Il contrôle le respect du RGPD.', 'Il donne son avis sur les analyses d’impact.', 'Il est l’interlocuteur de la CNIL et des personnes qui exercent leurs droits.'] },
          'Le DPO rend compte au plus haut niveau de la direction. Il ne reçoit pas d’instruction sur l’exercice de ses missions et ne doit pas se trouver en conflit d’intérêts. L’entreprise reste responsable de sa conformité : le DPO n’en répond pas personnellement.',
        ],
      },
      {
        title: 'DPO interne ou externalisé',
        body: [
          'Le RGPD laisse le choix entre un salarié et un prestataire lié par un contrat de service. Dans une petite structure, un salarié cumule souvent la fonction avec un autre poste, ce qui peut créer un conflit d’intérêts s’il décide lui-même des traitements. Un DPO externalisé évite cette difficulté.',
        ],
      },
      {
        title: 'Déclarer le DPO à la CNIL',
        body: [
          'Vous désignez votre DPO en ligne sur le site de la CNIL, puis vous publiez ses coordonnées, par exemple dans votre politique de confidentialité.',
        ],
      },
    ],
    sources: [
      { label: 'CNIL, Le délégué à la protection des données : est-ce obligatoire ?', href: 'https://www.cnil.fr/fr/cnil-direct/question/reglement-europeen-le-delegue-la-protection-des-donnees-cest-obligatoire' },
      { label: 'Groupe de travail « Article 29 », lignes directrices concernant les délégués à la protection des données (WP 243)', href: 'https://www.cnil.fr/sites/cnil/files/atoms/files/wp243rev01_fr.pdf' },
      { label: 'CNIL, Désignez en ligne votre délégué à la protection des données', href: 'https://www.cnil.fr/fr/designez-en-ligne-votre-delegue-la-protection-des-donnees-aupres-de-la-cnil' },
      { label: 'CNIL, RGPD, chapitre IV (articles 37 à 39)', href: 'https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre4' },
    ],
    related: { href: '/offres#dpo', label: 'Voir l’offre de DPO externalisé' },
  },
];

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug);
