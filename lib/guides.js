// Guides pratiques publiés sur /guides. Chaque affirmation juridique renvoie à une source officielle listée en bas du guide.
// Un bloc de contenu est soit un paragraphe (chaîne), soit une liste ({ list: [...] }).
export const GUIDES = [
  {
    slug: 'rgpd-cabinet-de-courtage',
    title: 'RGPD : les obligations d’un cabinet de courtage en assurance',
    description: 'Registre des traitements, information des clients, données de santé, sous-traitants, demandes de droits et violations de données : ce que le RGPD impose à un cabinet de courtage.',
    updated: '2026-11-10',
    intro: 'Un cabinet de courtage collecte l’identité, la situation de famille, le patrimoine et parfois l’état de santé de ses clients. Le RGPD s’applique dès le premier dossier, quelle que soit la taille du cabinet.',
    sections: [
      {
        title: 'Tenir un registre des traitements',
        body: [
          'Tout organisme qui traite des données personnelles tient un registre, quelle que soit sa taille. Les structures de moins de 250 salariés peuvent n’y inscrire que trois types de traitements :',
          { list: ['les traitements non occasionnels, comme la gestion des clients, des prospects, des fournisseurs ou de la paie ;', 'les traitements qui présentent un risque pour les personnes ;', 'les traitements de données sensibles, dont les données de santé.'] },
          'La gestion de la clientèle est un traitement non occasionnel. Un cabinet de courtage inscrit donc l’essentiel de son activité au registre. Selon la CNIL, la dérogation ne vise que des cas très particuliers.',
          'Pour chaque traitement, le registre indique la finalité, les catégories de personnes et de données, les destinataires, les transferts hors de l’Union européenne, les durées de conservation et les mesures de sécurité.',
        ],
      },
      {
        title: 'Informer les clients et justifier chaque traitement',
        body: [
          'Au moment de la collecte, vous indiquez au client qui traite ses données, dans quel but, sur quelle base légale, qui les reçoit, combien de temps vous les gardez et comment il exerce ses droits.',
          'Chaque traitement repose sur une base légale. Dans un cabinet de courtage, ce sont le plus souvent l’exécution du contrat, une obligation légale (devoir de conseil, lutte contre le blanchiment), l’intérêt légitime ou le consentement.',
        ],
      },
      {
        title: 'Protéger les données de santé',
        body: [
          'Le RGPD interdit par principe de traiter des données de santé. Il prévoit des exceptions, dont le consentement explicite de la personne. Les questionnaires de santé en prévoyance ou en assurance emprunteur entrent dans ce cadre.',
          'En pratique, limitez l’accès à ces documents aux personnes qui en ont besoin, transmettez-les par un canal sécurisé et supprimez-les à l’issue de la durée prévue au registre.',
        ],
      },
      {
        title: 'Encadrer les sous-traitants',
        body: [
          'L’éditeur de votre logiciel de gestion, votre hébergeur et votre prestataire de signature électronique traitent des données pour votre compte. Le RGPD impose un contrat écrit avec chacun d’eux, qui fixe l’objet du traitement, les mesures de sécurité et le sort des données en fin de contrat.',
          'La relation avec les assureurs se qualifie contrat par contrat : selon les cas, le cabinet est responsable du traitement, responsable conjoint ou sous-traitant.',
        ],
      },
      {
        title: 'Répondre aux demandes de droits',
        body: [
          'Un client peut demander l’accès à ses données, leur rectification ou leur effacement. Vous répondez dans un délai d’un mois. Ce délai peut être prolongé de deux mois si la demande est complexe, à condition d’en informer la personne dans le premier mois.',
        ],
      },
      {
        title: 'Notifier les violations de données',
        body: [
          'Un envoi au mauvais destinataire, un ordinateur volé ou une intrusion dans la messagerie sont des violations de données. Vous notifiez la CNIL dans les 72 heures après en avoir pris connaissance, sauf si la violation ne présente pas de risque pour les personnes. Si le risque est élevé, vous informez aussi les personnes concernées.',
          'Vous consignez chaque violation dans un registre interne, y compris celles que vous ne notifiez pas.',
        ],
      },
      {
        title: 'Les sanctions',
        body: [
          'La CNIL peut prononcer une amende allant jusqu’à 20 millions d’euros ou 4 % du chiffre d’affaires annuel mondial. Elle dispose aussi d’une procédure simplifiée pour les dossiers courants.',
        ],
      },
    ],
    sources: [
      { label: 'CNIL, Le registre des activités de traitement', href: 'https://www.cnil.fr/fr/RGPD-le-registre-des-activites-de-traitement' },
      { label: 'CNIL, texte du RGPD', href: 'https://www.cnil.fr/fr/reglement-europeen-protection-donnees' },
      { label: 'CNIL, RGPD, chapitre IV : responsable du traitement et sous-traitant', href: 'https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre4' },
    ],
    related: { href: '/intermediaires-assurance', label: 'Voir l’accompagnement des cabinets de courtage' },
  },
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
    related: { href: '/conformite', label: 'Voir l’offre de DPO externalisé' },
  },
  {
    slug: 'lcb-ft-courtiers-assurance',
    title: 'LCB-FT : les obligations des courtiers en assurance',
    description: 'Qui est assujetti à la lutte contre le blanchiment, et ce que le code monétaire et financier impose : classification des risques, identification des clients, déclaration à Tracfin, gel des avoirs.',
    updated: '2026-11-10',
    intro: 'Les courtiers en assurance sont assujettis à la lutte contre le blanchiment des capitaux et le financement du terrorisme (LCB-FT). L’ACPR contrôle le respect de ces obligations.',
    sections: [
      {
        title: 'Qui est assujetti',
        body: [
          'L’article L. 561-2 du code monétaire et financier vise les intermédiaires d’assurance, sauf ceux qui agissent sous l’entière responsabilité d’un organisme ou d’un courtier. Les mandataires sont donc exclus. Les agents généraux le sont pour leur activité d’agent, mais ils redeviennent assujettis quand ils agissent comme courtiers.',
          'Le courtage exercé à titre accessoire est exempté si plusieurs conditions sont réunies (article R. 561-4), dont un courtage inférieur à 5 % du chiffre d’affaires et une prime annuelle qui ne dépasse pas 1 000 € par contrat et par client.',
        ],
      },
      {
        title: 'Classer ses risques',
        body: [
          'Le courtier identifie, évalue et classe par écrit ses risques de blanchiment, puis tient cette classification à jour (article L. 561-4-1). Il établit un profil de risque pour chaque relation d’affaires (article L. 561-32).',
        ],
      },
      {
        title: 'Identifier le client et le bénéficiaire effectif',
        body: [
          'Avant d’entrer en relation, le courtier identifie son client et vérifie son identité. Pour une société, il identifie aussi le bénéficiaire effectif et consulte le registre des bénéficiaires effectifs (article R. 561-7).',
        ],
      },
      {
        title: 'Surveiller les opérations',
        body: [
          'La surveillance s’exerce pendant toute la relation, y compris quand le risque est faible. Une opération inhabituelle fait l’objet d’un examen renforcé (article L. 561-10-2).',
        ],
      },
      {
        title: 'Déclarer les soupçons à Tracfin',
        body: [
          'Le courtier déclare lui-même ses soupçons à Tracfin (article L. 561-15). L’assureur ne peut pas le faire à sa place. Le cabinet désigne un déclarant et un correspondant Tracfin. En 2021, l’ACPR relevait que très peu de déclarations émanaient des courtiers.',
        ],
      },
      {
        title: 'Appliquer le gel des avoirs',
        body: [
          'Les mesures de gel des avoirs s’appliquent que le courtier encaisse des fonds ou non (articles L. 562-4 et suivants). Le cabinet met en place une procédure pour vérifier ses clients au regard du registre national des gels.',
        ],
      },
      {
        title: 'Organiser le dispositif',
        body: [
          { list: ['Désigner un responsable LCB-FT.', 'Rédiger des procédures adaptées à la taille du cabinet.', 'Mettre en place un contrôle interne.', 'Former les personnes qui participent au dispositif.', 'Conserver les documents d’identification et les pièces relatives aux opérations pendant cinq ans (article L. 561-12).'] },
        ],
      },
    ],
    sources: [
      { label: 'ACPR, LCB-FT : les obligations des courtiers d’assurance (Revue de l’ACPR, avril 2021)', href: 'https://acpr.banque-france.fr/system/files/import/acpr/medias/documents/20210402_lcbft_courtiers_assurance.pdf' },
      { label: 'Légifrance, code monétaire et financier, articles L. 561-1 à L. 561-50', href: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072026/LEGISCTA000006154830/' },
      { label: 'Légifrance, personnes assujetties (articles L. 561-2 à L. 561-4)', href: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072026/LEGISCTA000020178975/' },
    ],
    related: { href: '/intermediaires-assurance', label: 'Voir l’accompagnement des cabinets de courtage' },
  },
];

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug);
