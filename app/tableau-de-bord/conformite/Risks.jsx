'use client';
import { Plus } from '@/components/icons';
import { DOMAINS, RISK_STATUSES, riskLevel } from '@/lib/conformite.mjs';

const SCALE = [1, 2, 3, 4, 5];

// readOnly : le client consulte la cartographie établie par Equimarge sans pouvoir la modifier.
export default function Risks({ risks, domain, readOnly = false, onAdd, onUpdate, onRemove }) {
  const rows = risks.filter((r) => !domain || r.domain === domain);
  const set = (id, field, number) => (e) => onUpdate(id, { [field]: number ? Number(e.target.value) : e.target.value });

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Cartographie des risques</h2>
        {!readOnly && (
          <button
            className="btn ghost sm"
            type="button"
            onClick={() => onAdd({ domain: domain || 'rgpd', title: '', probability: 3, impact: 3, measure: '', status: 'Ouvert' })}
          >
            <Plus size={16} />Ajouter un risque
          </button>
        )}
      </div>
      <p className="note" style={{ marginTop: 0 }}>
        Probabilité et impact de 1 (faible) à 5 (très fort). Score égal à probabilité × impact : de 1 à 6 faible, de 8 à
        12 moyen, de 15 à 25 élevé.
      </p>
      {rows.length === 0 ? (
        <div className="empty"><p className="note">Aucun risque recensé{domain ? ' pour ce domaine' : ''}.</p></div>
      ) : (
        <fieldset className="plain" disabled={readOnly}>
        <div className="scroll">
          <table className="tbl-wide tbl-form">
            <thead>
              <tr>
                <th className="col-main">Risque</th><th>Domaine</th><th>Probabilité</th><th>Impact</th><th>Score</th><th className="col-mid">Mesure de maîtrise</th><th>Statut</th>{!readOnly && <th></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const l = riskLevel(r.probability, r.impact);
                return (
                  <tr key={r.id}>
                    <td><input aria-label="Risque" maxLength={300} value={r.title} placeholder="Décrivez le risque" onChange={set(r.id, 'title')} /></td>
                    <td>
                      <select className="status" aria-label="Domaine" value={r.domain} onChange={set(r.id, 'domain')}>
                        {DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="status" aria-label="Probabilité" value={r.probability} onChange={set(r.id, 'probability', true)}>
                        {SCALE.map((n) => <option key={n}>{n}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="status" aria-label="Impact" value={r.impact} onChange={set(r.id, 'impact', true)}>
                        {SCALE.map((n) => <option key={n}>{n}</option>)}
                      </select>
                    </td>
                    <td className="num"><span className="row" style={{ gap: 8, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>{l.score}<span className={'pill ' + l.state}>{l.label}</span></span></td>
                    <td><input aria-label="Mesure de maîtrise" maxLength={1000} value={r.measure} placeholder="Ce qui réduit le risque" onChange={set(r.id, 'measure')} /></td>
                    <td>
                      <select className="status" aria-label="Statut" value={r.status} onChange={set(r.id, 'status')}>
                        {RISK_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    {!readOnly && (
                      <td><button className="del" type="button" aria-label={`Supprimer ${r.title || 'le risque'}`} onClick={() => onRemove(r.id)}>×</button></td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </fieldset>
      )}
    </section>
  );
}
