// Référentiel et calculs de l'espace conformité, isolés ici pour être testés (tests/conformite.test.mjs).
// Les questions sont des repères d'organisation, pas une consultation juridique.

// `key` est enregistré en base (colonne domain) : ne le changez pas.
export const DOMAINS = [
  { key: 'rgpd', label: 'RGPD et DPO' },
  { key: 'ia', label: 'Intelligence artificielle' },
  { key: 'lcbft', label: 'Anti-blanchiment' },
  { key: 'sapin', label: 'Anticorruption' },
  { key: 'procedures', label: 'Procédures internes' },
  { key: 'social', label: 'Droit social' },
];

export const domainLabel = (key) => DOMAINS.find((d) => d.key === key)?.label || 'Autre';

// `key` est enregistré en base (colonne question) : ne le changez pas une fois en ligne.
export const QUESTIONS = [
  { key: 'rgpd_registre', domain: 'rgpd', text: 'Tenez-vous un registre à jour de vos traitements de données personnelles ?', action: 'Établir le registre des traitements (onglet Registre RGPD).' },
  { key: 'rgpd_information', domain: 'rgpd', text: 'Clients, salariés et prospects sont-ils informés de l’usage de leurs données (mentions d’information, politique de confidentialité) ?', action: 'Mettre en place les mentions d’information sur chaque formulaire et document de collecte.' },
  { key: 'rgpd_droits', domain: 'rgpd', text: 'Savez-vous répondre sous un mois à une demande d’accès, de rectification ou d’effacement ?', action: 'Écrire la procédure de réponse aux demandes de droits et désigner qui la traite.' },
  { key: 'rgpd_soustraitants', domain: 'rgpd', text: 'Vos contrats avec les prestataires qui traitent des données pour vous contiennent-ils les clauses de l’article 28 du RGPD ?', action: 'Recenser les sous-traitants et faire compléter leurs contrats (clauses de l’article 28).' },
  { key: 'rgpd_violations', domain: 'rgpd', text: 'Savez-vous documenter une violation de données et la notifier à la CNIL sous 72 heures lorsqu’elle présente un risque ?', action: 'Créer un registre des violations et une procédure de notification à la CNIL.' },
  { key: 'rgpd_securite', domain: 'rgpd', text: 'Les accès aux données sont-ils limités et protégés (mots de passe robustes, droits par profil, sauvegardes) ?', action: 'Revoir les droits d’accès, imposer des mots de passe robustes et tester les sauvegardes.' },
  { key: 'rgpd_conservation', domain: 'rgpd', text: 'Avez-vous fixé une durée de conservation pour chaque type de données, et la respectez-vous ?', action: 'Fixer les durées de conservation dans le registre et organiser les suppressions.' },
  { key: 'rgpd_cookies', domain: 'rgpd', text: 'Votre site recueille-t-il le consentement avant de déposer des cookies de mesure d’audience ou de publicité ?', action: 'Installer un bandeau de consentement conforme aux recommandations de la CNIL.' },
  { key: 'rgpd_dpo', domain: 'rgpd', text: 'Si vous êtes un organisme public ou traitez des données sensibles ou à grande échelle, avez-vous désigné un DPO ?', action: 'Désigner un délégué à la protection des données, interne ou externe, et le déclarer à la CNIL.' },

  { key: 'ia_inventaire', domain: 'ia', text: 'Avez-vous recensé les outils d’IA utilisés dans l’entreprise (assistants, chatbots, logiciels intégrant de l’IA) ?', action: 'Dresser l’inventaire des outils d’IA et de leurs usages.' },
  { key: 'ia_formation', domain: 'ia', text: 'Les personnes qui utilisent ces outils sont-elles formées à leurs limites et à leurs risques ?', action: 'Organiser une formation à l’usage de l’IA pour les utilisateurs.' },
  { key: 'ia_charte', domain: 'ia', text: 'Une charte précise-t-elle les usages autorisés et les informations à ne jamais saisir dans un outil d’IA ?', action: 'Rédiger et diffuser une charte d’usage de l’IA.' },
  { key: 'ia_transparence', domain: 'ia', text: 'Les personnes qui échangent avec un chatbot, ou reçoivent un contenu généré par IA, en sont-elles informées ?', action: 'Ajouter une mention d’information sur les échanges et contenus produits par IA.' },
  { key: 'ia_interdits', domain: 'ia', text: 'Avez-vous vérifié qu’aucun usage ne relève des pratiques interdites (notation sociale, reconnaissance des émotions au travail…) ?', action: 'Vérifier chaque usage au regard des pratiques interdites par le règlement européen sur l’IA.' },
  { key: 'ia_hautrisque', domain: 'ia', text: 'Si l’IA sert au recrutement, à l’évaluation des salariés ou à l’octroi de crédit, avez-vous identifié les obligations des systèmes à haut risque ?', action: 'Identifier les systèmes à haut risque et les obligations qui s’y appliquent.' },
  { key: 'ia_rgpd', domain: 'ia', text: 'Les données personnelles traitées par vos outils d’IA sont-elles inscrites au registre et encadrées par contrat ?', action: 'Inscrire les traitements par IA au registre et vérifier les contrats des fournisseurs.' },

  { key: 'lcbft_assujetti', domain: 'lcbft', text: 'Avez-vous vérifié si votre activité est soumise à la lutte contre le blanchiment (article L561-2 du Code monétaire et financier) ?', action: 'Vérifier l’assujettissement de l’activité à la LCB-FT.' },
  { key: 'lcbft_classification', domain: 'lcbft', text: 'Disposez-vous d’une classification des risques de blanchiment propre à votre activité ?', action: 'Établir la classification des risques de blanchiment et de financement du terrorisme.' },
  { key: 'lcbft_identification', domain: 'lcbft', text: 'Identifiez-vous et vérifiez-vous l’identité de vos clients et de leurs bénéficiaires effectifs avant d’entrer en relation ?', action: 'Formaliser la procédure d’identification des clients et des bénéficiaires effectifs.' },
  { key: 'lcbft_vigilance', domain: 'lcbft', text: 'Adaptez-vous la vigilance au risque (vigilance renforcée pour les personnes politiquement exposées et les pays à risque) ?', action: 'Définir les niveaux de vigilance et les cas de vigilance renforcée.' },
  { key: 'lcbft_tracfin', domain: 'lcbft', text: 'Avez-vous désigné un déclarant et un correspondant Tracfin, et savez-vous faire une déclaration de soupçon ?', action: 'Désigner le déclarant et le correspondant Tracfin et écrire la procédure de déclaration.' },
  { key: 'lcbft_gel', domain: 'lcbft', text: 'Contrôlez-vous vos clients au regard des mesures de gel des avoirs ?', action: 'Mettre en place le contrôle des clients au regard du registre des gels des avoirs.' },
  { key: 'lcbft_formation', domain: 'lcbft', text: 'Vos collaborateurs sont-ils formés régulièrement à la lutte contre le blanchiment ?', action: 'Planifier une formation LCB-FT des collaborateurs.' },
  { key: 'lcbft_conservation', domain: 'lcbft', text: 'Conservez-vous pendant 5 ans les documents d’identification et les informations sur les opérations ?', action: 'Organiser l’archivage des documents LCB-FT pendant 5 ans.' },

  { key: 'sapin_concerne', domain: 'sapin', text: 'Savez-vous si l’article 17 de la loi Sapin II vous concerne, ou si vos clients attendent de vous un dispositif anticorruption ?', action: 'Vérifier l’application de la loi Sapin II et les exigences des clients grands comptes.' },
  { key: 'sapin_cartographie', domain: 'sapin', text: 'Avez-vous une cartographie des risques de corruption ?', action: 'Réaliser la cartographie des risques de corruption (onglet Risques).' },
  { key: 'sapin_code', domain: 'sapin', text: 'Un code de conduite définit-il les comportements interdits (cadeaux, invitations, conflits d’intérêts) ?', action: 'Rédiger le code de conduite anticorruption.' },
  { key: 'sapin_alerte', domain: 'sapin', text: 'Disposez-vous d’un dispositif d’alerte interne (obligatoire à partir de 50 salariés) ?', action: 'Mettre en place la procédure interne de recueil et de traitement des alertes.' },
  { key: 'sapin_tiers', domain: 'sapin', text: 'Évaluez-vous l’intégrité de vos clients, fournisseurs et intermédiaires ?', action: 'Mettre en place l’évaluation des tiers selon leur niveau de risque.' },
  { key: 'sapin_controles', domain: 'sapin', text: 'Des contrôles comptables permettent-ils de repérer des paiements inhabituels ?', action: 'Définir des contrôles comptables anticorruption.' },
  { key: 'sapin_formation', domain: 'sapin', text: 'Les personnes les plus exposées sont-elles formées à la prévention de la corruption ?', action: 'Former les fonctions exposées (achats, commerce, direction).' },

  { key: 'proc_delegations', domain: 'procedures', text: 'Les pouvoirs et les délégations de signature sont-ils formalisés ?', action: 'Formaliser les délégations de pouvoir et de signature.' },
  { key: 'proc_achats', domain: 'procedures', text: 'Une procédure encadre-t-elle les achats et la validation des dépenses ?', action: 'Écrire la procédure d’achat et les seuils de validation.' },
  { key: 'proc_separation', domain: 'procedures', text: 'Les tâches sensibles (commande, réception, paiement) sont-elles réparties entre plusieurs personnes ?', action: 'Séparer les tâches de commande, de réception et de paiement.' },
  { key: 'proc_documentees', domain: 'procedures', text: 'Vos procédures clés sont-elles écrites, à jour et accessibles aux équipes ?', action: 'Rassembler et mettre à jour les procédures clés dans un espace partagé.' },
  { key: 'proc_controle', domain: 'procedures', text: 'Des contrôles réguliers vérifient-ils que les procédures sont appliquées ?', action: 'Planifier des contrôles réguliers de l’application des procédures.' },
  { key: 'proc_continuite', domain: 'procedures', text: 'Savez-vous continuer l’activité en cas d’absence d’une personne clé ou de panne informatique ?', action: 'Préparer un plan de continuité d’activité.' },

  { key: 'social_duerp', domain: 'social', text: 'Votre document unique d’évaluation des risques professionnels (DUERP) est-il à jour ?', action: 'Mettre à jour le document unique d’évaluation des risques.' },
  { key: 'social_affichages', domain: 'social', text: 'Les affichages obligatoires sont-ils en place (inspection du travail, médecine du travail, horaires, consignes de sécurité) ?', action: 'Mettre en place les affichages obligatoires.' },
  { key: 'social_registre', domain: 'social', text: 'Tenez-vous le registre unique du personnel ?', action: 'Ouvrir et tenir à jour le registre unique du personnel.' },
  { key: 'social_reglement', domain: 'social', text: 'Si vous avez au moins 50 salariés, votre règlement intérieur est-il à jour ?', action: 'Mettre à jour le règlement intérieur.' },
  { key: 'social_temps', domain: 'social', text: 'Le temps de travail et les repos sont-ils décomptés et respectés ?', action: 'Mettre en place le décompte du temps de travail et des repos.' },
  { key: 'social_entretiens', domain: 'social', text: 'Les entretiens professionnels ont-ils lieu tous les deux ans ?', action: 'Planifier les entretiens professionnels.' },
  { key: 'social_harcelement', domain: 'social', text: 'Les obligations de prévention du harcèlement sont-elles respectées (information des salariés, référents lorsque requis) ?', action: 'Mettre en place l’information et les référents harcèlement requis.' },
];

export const ANSWERS = [
  { key: 'oui', label: 'Oui', value: 1 },
  { key: 'partiel', label: 'En partie', value: 0.5 },
  { key: 'non', label: 'Non', value: 0 },
  { key: 'na', label: 'Non concerné', value: null },
];

export const ACTION_STATUSES = ['À faire', 'En cours', 'Terminé'];
export const PRIORITIES = ['Haute', 'Moyenne', 'Basse'];
export const RISK_STATUSES = ['Ouvert', 'Maîtrisé'];
export const LEGAL_BASES = [
  'Consentement',
  'Contrat',
  'Obligation légale',
  'Sauvegarde des intérêts vitaux',
  'Mission d’intérêt public',
  'Intérêt légitime',
];

// Score d'un domaine : moyenne des réponses (Oui = 1, En partie = 0,5, Non = 0), « Non concerné » exclu.
// Renvoie aussi le nombre de questions répondues ; score = null tant que rien n'est répondu.
export function domainScores(answers) {
  return DOMAINS.map((d) => {
    const qs = QUESTIONS.filter((q) => q.domain === d.key);
    let sum = 0, counted = 0, answered = 0;
    for (const q of qs) {
      const a = ANSWERS.find((x) => x.key === answers[q.key]);
      if (!a) continue;
      answered += 1;
      if (a.value === null) continue;
      sum += a.value;
      counted += 1;
    }
    return { ...d, total: qs.length, answered, score: counted ? sum / counted : null };
  });
}

// Score global : moyenne des domaines évalués (chaque domaine pèse autant).
export function globalScore(scores) {
  const s = scores.filter((d) => d.score !== null);
  return s.length ? s.reduce((t, d) => t + d.score, 0) / s.length : null;
}

// Niveau d'un score de domaine, affiché avec son libellé (jamais la couleur seule).
export function scoreLevel(score) {
  if (score === null || score === undefined) return { state: 'none', label: 'Non évalué' };
  if (score >= 0.8) return { state: 'ok', label: 'Conforme' };
  if (score >= 0.5) return { state: 'warn', label: 'En cours' };
  return { state: 'bad', label: 'À traiter' };
}

// Cotation d'un risque : probabilité × impact, de 1 à 25.
export function riskLevel(probability, impact) {
  const score = probability * impact;
  if (score >= 15) return { score, state: 'bad', label: 'Élevé' };
  if (score >= 8) return { score, state: 'warn', label: 'Moyen' };
  return { score, state: 'ok', label: 'Faible' };
}

// Une action est en retard si elle n'est pas terminée et que son échéance (AAAA-MM-JJ) est passée.
export function isLate(action, today) {
  return action.status !== 'Terminé' && Boolean(action.due_date) && action.due_date < today;
}

export function actionStats(actions, today) {
  const byStatus = Object.fromEntries(ACTION_STATUSES.map((s) => [s, 0]));
  let late = 0;
  for (const a of actions) {
    if (a.status in byStatus) byStatus[a.status] += 1;
    if (isLate(a, today)) late += 1;
  }
  return { total: actions.length, byStatus, late, open: actions.length - byStatus['Terminé'] };
}

// Date du jour au format AAAA-MM-JJ, en heure locale.
export function todayISO(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
