import { buildXlsx } from '@/lib/xlsx.mjs';
import { ANSWERS, domainLabel, domainScores, globalScore, isLate, QUESTIONS, riskLevel, scoreLevel, storageName, todayISO } from '@/lib/conformite.mjs';

const pct = (v) => (v === null ? '' : { value: Math.round(v * 100) / 100, format: 'pct' });

// Classeur Excel du dossier : une feuille par outil, avec filtres automatiques.
export function workbookSheets({ answers, actions, records, risks, infos = [], documents = [] }, today = todayISO()) {
  const scores = domainScores(answers);
  const all = globalScore(scores);
  return [
    {
      name: 'Synthèse',
      widths: [28, 10, 14, 22],
      rows: [
        ['Domaine', 'Score', 'Niveau', 'Questions répondues'],
        ...scores.map((s) => [s.label, pct(s.score), scoreLevel(s.score).label, `${s.answered} sur ${s.total}`]),
        ['Ensemble des domaines', pct(all), scoreLevel(all).label, ''],
      ],
    },
    {
      name: 'Auto-diagnostic',
      widths: [24, 70, 14, 60],
      rows: [
        ['Domaine', 'Question', 'Réponse', 'Action recommandée'],
        ...QUESTIONS.map((q) => {
          const a = answers[q.key];
          return [domainLabel(q.domain), q.text, ANSWERS.find((x) => x.key === a)?.label || 'Sans réponse', a === 'non' || a === 'partiel' ? q.action : ''];
        }),
      ],
    },
    {
      name: 'Plan d’action',
      widths: [50, 24, 20, 12, 10, 10, 10],
      rows: [
        ['Action', 'Domaine', 'Responsable', 'Échéance', 'Priorité', 'Statut', 'En retard'],
        ...actions.map((a) => [a.title, domainLabel(a.domain), a.owner, a.due_date || '', a.priority, a.status, isLate(a, today) ? 'Oui' : 'Non']),
      ],
    },
    {
      name: 'Registre RGPD',
      widths: [28, 40, 22, 28, 36, 12, 32, 24, 26, 36],
      rows: [
        ['Traitement', 'Finalité', 'Base légale', 'Personnes concernées', 'Catégories de données', 'Données sensibles', 'Destinataires', 'Transferts hors UE', 'Durée de conservation', 'Mesures de sécurité'],
        ...records.map((r) => [r.name, r.purpose, r.legal_basis, r.data_subjects, r.data_categories, r.sensitive ? 'Oui' : 'Non', r.recipients, r.transfers, r.retention, r.security]),
      ],
    },
    {
      name: 'Risques',
      widths: [44, 24, 11, 8, 8, 9, 44, 10],
      rows: [
        ['Risque', 'Domaine', 'Probabilité', 'Impact', 'Score', 'Niveau', 'Mesure de maîtrise', 'Statut'],
        ...risks.map((r) => {
          const l = riskLevel(r.probability, r.impact);
          return [r.title, domainLabel(r.domain), r.probability, r.impact, l.score, l.label, r.measure, r.status];
        }),
      ],
    },
    {
      name: 'Demandes d’informations',
      widths: [44, 44, 12, 12, 60],
      rows: [
        ['Demande', 'Précisions', 'Échéance', 'Statut', 'Réponse du client'],
        ...infos.map((i) => [i.title, i.details, i.due_date || '', i.status, i.response]),
      ],
    },
    {
      name: 'Documents',
      widths: [44, 18, 12, 12],
      rows: [
        ['Document', 'Origine', 'Date', 'Taille (Ko)'],
        ...documents.map((d) => [d.name, d.kind === 'Livrable' ? 'Livrable Equimarge' : 'Client', (d.created_at || '').slice(0, 10), Math.round(d.size / 1024)]),
      ],
    },
  ];
}

export function downloadWorkbook(data, company = '') {
  const today = todayISO();
  const blob = new Blob([buildXlsx(workbookSheets(data, today))], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conformite-${company ? storageName(company).toLowerCase() + '-' : ''}${today}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
