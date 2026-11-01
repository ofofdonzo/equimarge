'use client';
import { useState } from 'react';
import { Plus } from '@/components/icons';
import { LEGAL_BASES } from '@/lib/conformite.mjs';

// Champs du registre des activités de traitement (article 30 du RGPD)
const FIELDS = [
  { key: 'name', label: 'Nom du traitement', max: 200, placeholder: 'ex. Gestion des clients' },
  { key: 'purpose', label: 'Finalité', max: 1000, area: true, placeholder: 'À quoi servent les données ?' },
  { key: 'data_subjects', label: 'Personnes concernées', max: 500, placeholder: 'ex. clients, salariés, prospects' },
  { key: 'data_categories', label: 'Catégories de données', max: 1000, area: true, placeholder: 'ex. identité, coordonnées, données de facturation' },
  { key: 'recipients', label: 'Destinataires', max: 1000, area: true, placeholder: 'Services internes, prestataires, organismes' },
  { key: 'transfers', label: 'Transferts hors de l’Union européenne', max: 500, placeholder: 'Pays et garanties, ou « aucun »' },
  { key: 'retention', label: 'Durée de conservation', max: 500, placeholder: 'ex. 3 ans après le dernier contact' },
  { key: 'security', label: 'Mesures de sécurité', max: 1000, area: true, placeholder: 'ex. accès par mot de passe, sauvegardes, chiffrement' },
];

const EMPTY = {
  name: '', purpose: '', legal_basis: 'Contrat', data_subjects: '', data_categories: '',
  sensitive: false, recipients: '', transfers: '', retention: '', security: '',
};

export default function Register({ records, onAdd, onUpdate, onRemove }) {
  const [open, setOpen] = useState(null);

  async function add() {
    const row = await onAdd(EMPTY);
    if (row) setOpen(row.id);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Registre des activités de traitement</h2>
        <button className="btn ghost sm" type="button" onClick={add}><Plus size={16} />Ajouter un traitement</button>
      </div>
      <p className="note" style={{ marginTop: 0 }}>
        Une fiche par traitement de données personnelles (article 30 du RGPD) : gestion des clients, paie, prospection,
        vidéoprotection… La CNIL peut demander ce registre lors d’un contrôle.
      </p>
      {records.length === 0 ? (
        <div className="empty"><p className="note">Aucun traitement recensé. Commencez par celui que vous utilisez le plus.</p></div>
      ) : (
        <div className="stack" style={{ gap: 10 }}>
          {records.map((r) => (
            <details key={r.id} className="record" open={open === r.id} onToggle={(e) => e.currentTarget.open && setOpen(r.id)}>
              <summary>
                <span className="record-name">{r.name || 'Traitement sans nom'}</span>
                <span className="row" style={{ gap: 8 }}>
                  {r.sensitive && <span className="pill warn">Données sensibles</span>}
                  <span className="pill none">{r.legal_basis}</span>
                </span>
              </summary>
              <div className="grid2 record-body">
                {FIELDS.map((f) => (
                  <div key={f.key} className="field">
                    <label htmlFor={`${f.key}-${r.id}`}>{f.label}</label>
                    {f.area ? (
                      <textarea id={`${f.key}-${r.id}`} rows={2} maxLength={f.max} placeholder={f.placeholder} value={r[f.key]} onChange={(e) => onUpdate(r.id, { [f.key]: e.target.value })} />
                    ) : (
                      <input id={`${f.key}-${r.id}`} maxLength={f.max} placeholder={f.placeholder} value={r[f.key]} onChange={(e) => onUpdate(r.id, { [f.key]: e.target.value })} />
                    )}
                  </div>
                ))}
                <div className="field">
                  <label htmlFor={`basis-${r.id}`}>Base légale</label>
                  <select id={`basis-${r.id}`} value={r.legal_basis} onChange={(e) => onUpdate(r.id, { legal_basis: e.target.value })}>
                    {LEGAL_BASES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <label className="check" style={{ alignSelf: 'end' }}>
                  <input type="checkbox" checked={r.sensitive} onChange={(e) => onUpdate(r.id, { sensitive: e.target.checked })} />
                  <span>Données sensibles (santé, opinions, origine, biométrie…) ou relatives aux infractions</span>
                </label>
              </div>
              <div className="row" style={{ justifyContent: 'flex-end', paddingBottom: 14 }}>
                <button type="button" className="link-btn" onClick={() => onRemove(r.id)}>Supprimer ce traitement</button>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
