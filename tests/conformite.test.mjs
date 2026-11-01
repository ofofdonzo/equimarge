import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actionStats, DOMAINS, domainScores, fileSize, globalScore, isMission, QUESTIONS, riskLevel, scoreLevel, storageName } from '../lib/conformite.mjs';

test('chaque question a une clé unique, un domaine connu et une action', () => {
  const keys = new Set(QUESTIONS.map((q) => q.key));
  assert.equal(keys.size, QUESTIONS.length);
  for (const q of QUESTIONS) {
    assert.ok(DOMAINS.some((d) => d.key === q.domain), q.key);
    assert.ok(q.key.length <= 60 && q.text && q.action, q.key);
  }
});

test('domainScores ignore « Non concerné » et les questions sans réponse', () => {
  const s = domainScores({ rgpd_registre: 'oui', rgpd_droits: 'partiel', rgpd_cookies: 'non', rgpd_dpo: 'na' });
  const rgpd = s.find((d) => d.key === 'rgpd');
  assert.equal(rgpd.answered, 4);
  assert.equal(rgpd.score, 0.5);
  assert.equal(s.find((d) => d.key === 'ia').score, null);
});

test('globalScore fait la moyenne des domaines évalués', () => {
  const s = domainScores({ rgpd_registre: 'oui', ia_charte: 'non' });
  assert.equal(globalScore(s), 0.5);
  assert.equal(globalScore(domainScores({})), null);
});

test('scoreLevel et riskLevel suivent les seuils affichés', () => {
  assert.equal(scoreLevel(0.8).label, 'Conforme');
  assert.equal(scoreLevel(0.5).label, 'En cours');
  assert.equal(scoreLevel(0.49).label, 'À traiter');
  assert.equal(scoreLevel(null).label, 'Non évalué');
  assert.deepEqual(riskLevel(5, 3), { score: 15, state: 'bad', label: 'Élevé' });
  assert.equal(riskLevel(2, 4).label, 'Moyen');
  assert.equal(riskLevel(2, 3).label, 'Faible');
});

test('actionStats compte les statuts et les retards', () => {
  const st = actionStats(
    [
      { status: 'À faire', due_date: '2026-10-01' },
      { status: 'En cours', due_date: '2026-12-01' },
      { status: 'Terminé', due_date: '2026-09-01' },
      { status: 'À faire', due_date: null },
    ],
    '2026-11-01'
  );
  assert.deepEqual(st.byStatus, { 'À faire': 2, 'En cours': 1, 'Terminé': 1 });
  assert.equal(st.late, 1);
  assert.equal(st.open, 3);
});

test('storageName produit un nom de fichier sûr', () => {
  assert.equal(storageName('Contrat signé (v2).PDF'), 'Contrat-signe-v2-.PDF');
  assert.equal(storageName('../../etc/passwd'), 'etc-passwd');
  assert.equal(storageName('  '), 'document');
  assert.equal(storageName('a'.repeat(300) + '.pdf').length, 100);
  assert.equal(fileSize(2048), '2 Ko');
  assert.equal(isMission({ status: 'Auto-diagnostic' }), false);
  assert.equal(isMission({ status: 'En cours' }), true);
});
