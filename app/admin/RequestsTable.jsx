'use client';
import { Fragment, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { STATUSES } from '@/components/offers';

// Demande venue d'une publicité : le lien de la pub portait des paramètres UTM (voir le README, étape 9)
const fromAd = (r) => Boolean(r.utm_source || r.utm_campaign || r.utm_content);

// Demandes par publicité : repérer les pubs qui apportent des clients pour leur donner plus de budget,
// et couper les autres. Le coût de chaque pub se lit dans le Gestionnaire de publicités Meta.
function AdsSummary({ rows }) {
  const groups = new Map();
  for (const r of rows.filter(fromAd)) {
    const key = `${r.utm_campaign || '—'}\n${r.utm_content || '—'}`;
    const g = groups.get(key) || { key, campaign: r.utm_campaign || '—', ad: r.utm_content || '—', total: 0, won: 0 };
    g.total += 1;
    if (r.status === 'Gagnée') g.won += 1;
    groups.set(key, g);
  }
  if (groups.size === 0) return null;
  const list = [...groups.values()].sort((a, b) => b.won - a.won || b.total - a.total);
  const direct = rows.length - rows.filter(fromAd).length;

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Demandes par publicité</h2>
        <span className="note">{direct} demande(s) hors publicité</span>
      </div>
      <div className="scroll">
        <table>
          <thead>
            <tr><th>Campagne</th><th style={{ textAlign: 'left' }}>Publicité</th><th>Demandes</th><th>Gagnées</th></tr>
          </thead>
          <tbody>
            {list.map((g) => (
              <tr key={g.key}>
                <td>{g.campaign}</td>
                <td style={{ textAlign: 'left' }}>{g.ad}</td>
                <td className="num">{g.total}</td>
                <td className="num">{g.won}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

  if (rows.length === 0) return <div className="panel empty note">Aucune demande pour le moment. Elles apparaîtront ici dès qu'un client remplit le formulaire.</div>;

  return (
    <>
      <AdsSummary rows={rows} />
      <div className="panel">
        {msg && <p className="err">{msg}</p>}
        <div className="scroll">
          <table className="tbl-wide" style={{ minWidth: 860 }}>
            <thead>
              <tr><th>Date</th><th>Entreprise</th><th>Demande</th><th>Source</th><th>Contact</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr>
                    <td>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                    <td style={{ textAlign: 'left' }}>{r.company}</td>
                    <td>{r.offer}</td>
                    <td>{fromAd(r) ? <>{r.utm_campaign || r.utm_source}<br /><span className="note">{r.utm_content}</span></> : <span className="note">Directe</span>}</td>
                    <td style={{ textAlign: 'left' }}>{r.contact_name}<br /><span className="note">{r.email}</span></td>
                    <td>
                      <select className="status" aria-label={`Statut de ${r.company}`} value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><button className="btn ghost sm" type="button" onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? 'Fermer' : 'Détails'}</button></td>
                  </tr>
                  {open === r.id && (
                    <tr className="detail">
                      <td colSpan={7} style={{ textAlign: 'left' }}>
                        <div className="grid2" style={{ padding: 8 }}>
                          <div><b>SIREN :</b> {r.siren || '—'}<br /><b>Secteur :</b> {r.sector || '—'}<br /><b>CA :</b> {r.revenue_band || '—'}</div>
                          <div><b>Téléphone :</b> {r.phone || '—'}<br /><b>Disponibilités :</b> {r.availability || '—'}<br /><b>Compte client :</b> {r.user_id ? 'oui' : 'non'}</div>
                        </div>
                        {r.topics?.length > 0 && <p style={{ padding: '0 8px' }}><b>Domaines :</b> {r.topics.join(', ')}</p>}
                        {fromAd(r) && (
                          <p style={{ padding: '0 8px' }}>
                            <b>Publicité :</b> {[r.utm_source, r.utm_medium, r.utm_campaign, r.utm_term, r.utm_content].filter(Boolean).join(' · ')}
                          </p>
                        )}
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
    </>
  );
}
