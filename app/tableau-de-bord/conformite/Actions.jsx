'use client';
import { useState } from 'react';
import { Plus } from '@/components/icons';
import { ACTION_STATUSES, DOMAINS, isLate, PRIORITIES } from '@/lib/conformite.mjs';

const FILTERS = ['Toutes', ...ACTION_STATUSES, 'En retard'];

// readOnly : le client consulte le plan rédigé par Equimarge sans pouvoir le modifier.
export default function Actions({ actions, domain, today, readOnly = false, onAdd, onUpdate, onRemove }) {
  const [filter, setFilter] = useState('Toutes');
  const inDomain = actions.filter((a) => !domain || a.domain === domain);
  const count = (f) => inDomain.filter((a) => (f === 'Toutes' ? true : f === 'En retard' ? isLate(a, today) : a.status === f)).length;
  const rows = inDomain.filter((a) => (filter === 'Toutes' ? true : filter === 'En retard' ? isLate(a, today) : a.status === filter));
  const set = (id, field) => (e) => onUpdate(id, { [field]: e.target.value || (field === 'due_date' ? null : '') });

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Plan d’action</h2>
        {!readOnly && (
          <button
            className="btn ghost sm"
            type="button"
            onClick={() => onAdd({ domain: domain || 'rgpd', title: '', owner: '', due_date: null, priority: 'Moyenne', status: 'À faire', source: null })}
          >
            <Plus size={16} />Ajouter une action
          </button>
        )}
      </div>
      <div className="chips" role="group" aria-label="Filtrer par statut" style={{ marginBottom: 14 }}>
        {FILTERS.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f} <span className="count">{count(f)}</span>
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="empty">
          <p className="note">
            {inDomain.length > 0
              ? 'Aucune action ne correspond à ce filtre.'
              : readOnly
                ? 'Equimarge n’a pas encore établi votre plan d’action.'
                : 'Aucune action. Ajoutez-en une, ou utilisez les actions recommandées de l’auto-diagnostic.'}
          </p>
        </div>
      ) : (
        <fieldset className="plain" disabled={readOnly}>
          <div className="scroll">
            <table className="tbl-wide tbl-form">
              <thead>
                <tr>
                  <th className="col-main">Action</th><th>Domaine</th><th>Responsable</th><th>Échéance</th><th>Priorité</th><th>Statut</th>{!readOnly && <th></th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className={isLate(a, today) ? 'late' : undefined}>
                    <td><input aria-label="Action" maxLength={300} value={a.title} placeholder="Décrivez l’action" onChange={set(a.id, 'title')} /></td>
                    <td>
                      <select className="status" aria-label="Domaine" value={a.domain} onChange={set(a.id, 'domain')}>
                        {DOMAINS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                      </select>
                    </td>
                    <td><input aria-label="Responsable" maxLength={120} value={a.owner} placeholder={readOnly ? '' : 'Qui ?'} onChange={set(a.id, 'owner')} /></td>
                    <td>
                      <input className="date" type="date" aria-label="Échéance" value={a.due_date || ''} onChange={set(a.id, 'due_date')} />
                      {isLate(a, today) && <span className="pill bad">En retard</span>}
                    </td>
                    <td>
                      <select className="status" aria-label="Priorité" value={a.priority} onChange={set(a.id, 'priority')}>
                        {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="status" aria-label="Statut" value={a.status} onChange={set(a.id, 'status')}>
                        {ACTION_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    {!readOnly && (
                      <td><button className="del" type="button" aria-label={`Supprimer ${a.title || 'l’action'}`} onClick={() => onRemove(a.id)}>×</button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </fieldset>
      )}
    </section>
  );
}
