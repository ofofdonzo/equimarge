'use client';
import { Plus } from '@/components/icons';
import { ANSWERS, DOMAINS, QUESTIONS, scoreLevel } from '@/lib/conformite.mjs';

const pct = (v) => (v === null ? '–' : `${Math.round(v * 100)} %`);
const needsAction = (a) => a === 'non' || a === 'partiel';

// canPlan : seul Equimarge ajoute des actions au plan ; le client voit l'action recommandée.
export default function Questionnaire({ answers, scores, domain, actions, canPlan = false, onAnswer, onAddActions }) {
  const inPlan = new Set(actions.map((a) => a.source).filter(Boolean));

  return (
    <div className="stack">
      <p className="note" style={{ margin: 0 }}>
        Répondez « Non concerné » quand une question ne s’applique pas : elle ne compte pas dans le score. Cliquez à
        nouveau sur une réponse pour l’effacer.{!canPlan && ' Vos réponses sont visibles par Equimarge pour préparer votre accompagnement.'}
      </p>
      {DOMAINS.filter((d) => !domain || d.key === domain).map((d) => {
        const qs = QUESTIONS.filter((q) => q.domain === d.key);
        const s = scores.find((x) => x.key === d.key);
        const level = scoreLevel(s.score);
        const missing = qs.filter((q) => needsAction(answers[q.key]) && !inPlan.has(q.key));
        return (
          <section key={d.key} className="panel">
            <div className="panel-head">
              <h2>{d.label}</h2>
              <span className="row" style={{ gap: 8 }}>
                <span className="note">{s.answered} / {s.total} réponses · {pct(s.score)}</span>
                <span className={'pill ' + level.state}>{level.label}</span>
              </span>
            </div>
            {qs.map((q) => {
              const a = answers[q.key];
              return (
                <div key={q.key} className="question">
                  <p id={`q-${q.key}`}>{q.text}</p>
                  <div className="answers" role="radiogroup" aria-labelledby={`q-${q.key}`}>
                    {ANSWERS.map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        role="radio"
                        aria-checked={a === o.key}
                        className={'a-' + o.key}
                        onClick={() => onAnswer(q.key, o.key)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {needsAction(a) && (
                    <div className="q-action">
                      <span>Action recommandée : {q.action}</span>
                      {inPlan.has(q.key) ? (
                        <span className="pill ok">Dans le plan d’action</span>
                      ) : !canPlan ? null : (
                        <button type="button" className="btn ghost sm" onClick={() => onAddActions([q])}>
                          <Plus size={14} />Ajouter au plan
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {canPlan && missing.length > 1 && (
              <div className="row" style={{ marginTop: 14 }}>
                <button type="button" className="btn sm" onClick={() => onAddActions(missing)}>
                  <Plus size={14} />Ajouter les {missing.length} actions recommandées au plan
                </button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
