'use client';
import { Fragment, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { STATUSES } from '@/components/offers';

export default function RequestsTable({ initial }) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState(initial);
  const [open, setOpen] = useState(null);
  const [msg, setMsg] = useState('');

  async function setStatus(id, status) {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error } = await supabase.from('diagnostic_requests').update({ status }).eq('id', id);
    if (error) {
      setRows(prev);
      setMsg('Statut non enregistré : ' + error.message);
    } else setMsg('');
  }

  if (rows.length === 0) return <div className="panel note">Aucune demande pour le moment. Elles apparaîtront ici dès qu'un client remplit le formulaire.</div>;

  return (
    <div className="panel">
      {msg && <p className="err">{msg}</p>}
      <div className="scroll">
        <table className="tbl-wide">
          <thead>
            <tr><th>Date</th><th>Entreprise</th><th>Formule</th><th>Contact</th><th>Statut</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Fragment key={r.id}>
                <tr>
                  <td>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                  <td style={{ textAlign: 'left' }}>{r.company}</td>
                  <td>{r.offer}</td>
                  <td style={{ textAlign: 'left' }}>{r.contact_name}<br /><span className="note">{r.email}</span></td>
                  <td>
                    <select className="status" aria-label={`Statut de ${r.company}`} value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><button className="btn ghost" style={{ padding: '4px 10px' }} type="button" onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? 'Fermer' : 'Détails'}</button></td>
                </tr>
                {open === r.id && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'left', background: 'var(--soft)' }}>
                      <div className="grid2" style={{ padding: 8 }}>
                        <div><b>SIREN :</b> {r.siren || '—'}<br /><b>Secteur :</b> {r.sector || '—'}<br /><b>CA :</b> {r.revenue_band || '—'}</div>
                        <div><b>Téléphone :</b> {r.phone || '—'}<br /><b>Disponibilités :</b> {r.availability || '—'}<br /><b>Compte client :</b> {r.user_id ? 'oui' : 'non'}</div>
                      </div>
                      {r.message && <p style={{ padding: '0 8px', whiteSpace: 'pre-wrap' }}>{r.message}</p>}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
