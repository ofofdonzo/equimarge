'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MISSIONS } from '@/components/offers';
import { Plus, Search } from '@/components/icons';
import { domainScores, globalScore, scoreLevel } from '@/lib/conformite.mjs';

const VIEWS = [
  { key: 'mission', label: 'Missions en cours', test: (d) => d.status === 'En cours' },
  { key: 'diag', label: 'Auto-diagnostics', test: (d) => d.status === 'Auto-diagnostic' },
  { key: 'done', label: 'Terminés', test: (d) => d.status === 'Terminé' || d.status === 'Suspendu' },
  { key: 'all', label: 'Tous', test: () => true },
];
const STATE = { 'En cours': 'warn', Terminé: 'ok', Suspendu: 'none', 'Auto-diagnostic': 'none' };
const pct = (v) => (v === null ? '–' : `${Math.round(v * 100)} %`);

// Mission terminée depuis plus de 3 ans : à supprimer (durée annoncée dans la politique de confidentialité)
const expired = (d) =>
  (d.status === 'Terminé' || d.status === 'Suspendu') && Date.now() - new Date(d.updated_at).getTime() > 3 * 365.25 * 864e5;

export default function ClientsList({ initial }) {
  const router = useRouter();
  const [view, setView] = useState(initial.some((d) => d.status === 'En cours') ? 'mission' : 'all');
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const rows = useMemo(
    () => initial.map((d) => ({ ...d, score: globalScore(domainScores(d.answers || {})) })),
    [initial]
  );
  const counts = Object.fromEntries(VIEWS.map((v) => [v.key, rows.filter(v.test).length]));
  const shown = rows.filter((d) => {
    if (!VIEWS.find((v) => v.key === view).test(d)) return false;
    if (!q) return true;
    return `${d.company} ${d.contact_name} ${d.email} ${d.offer}`.toLowerCase().includes(q.toLowerCase());
  });
  const toRead = rows.reduce((t, d) => t + d.infos_answered, 0);

  async function create(e) {
    e.preventDefault();
    if (!form.company.trim()) return setErr('Indiquez au moins le nom de l’entreprise.');
    if (form.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return setErr('E-mail invalide.');
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('dossiers')
      .insert({
        company: form.company.trim(),
        contact_name: form.contact_name.trim(),
        email: form.email.trim(),
        offer: form.offer,
        status: 'En cours',
      })
      .select('id')
      .single();
    setBusy(false);
    if (error) return setErr('Dossier non créé : ' + error.message);
    router.push(`/admin/clients/${data.id}`);
  }

  return (
    <div className="stack">
      <div className="ws-head">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Dossiers clients</h1>
        </div>
        <button type="button" className="btn" onClick={() => setForm({ company: '', contact_name: '', email: '', offer: MISSIONS[0] })}>
          <Plus size={18} />Nouveau dossier
        </button>
      </div>

      <div className="kpis">
        <div className="kpi"><small>Missions en cours</small><b>{counts.mission}</b></div>
        <div className="kpi"><small>Réponses de clients à lire</small><b className={toRead ? 'neg' : undefined}>{toRead}</b></div>
        <div className="kpi"><small>Informations attendues</small><b>{rows.reduce((t, d) => t + d.infos_pending, 0)}</b></div>
        <div className="kpi"><small>Actions en retard</small><b className={rows.some((d) => d.late_actions) ? 'neg' : undefined}>{rows.reduce((t, d) => t + d.late_actions, 0)}</b></div>
      </div>

      {form && (
        <form className="panel stack" onSubmit={create}>
          <h2 style={{ margin: 0 }}>Nouveau dossier client</h2>
          <div className="grid2">
            <div className="field"><label htmlFor="nc-company">Entreprise *</label><input id="nc-company" maxLength={200} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div className="field"><label htmlFor="nc-contact">Contact</label><input id="nc-contact" maxLength={200} value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></div>
            <div className="field">
              <label htmlFor="nc-email">E-mail du client</label>
              <input id="nc-email" type="email" maxLength={320} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="nc-offer">Prestation</label>
              <select id="nc-offer" value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })}>
                {MISSIONS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <p className="note" style={{ margin: 0 }}>
            Le client verra ce dossier dans son espace dès qu’il se connecte avec cet e-mail (confirmé).
          </p>
          {err && <p className="err" role="alert">{err}</p>}
          <div className="row">
            <button type="submit" className="btn" disabled={busy}>{busy ? 'Création…' : 'Créer le dossier'}</button>
            <button type="button" className="btn ghost" onClick={() => { setForm(null); setErr(''); }}>Annuler</button>
          </div>
        </form>
      )}

      <section className="panel">
        <div className="panel-head">
          <div className="chips" role="group" aria-label="Filtrer les dossiers">
            {VIEWS.map((v) => (
              <button key={v.key} type="button" aria-pressed={view === v.key} onClick={() => setView(v.key)}>
                {v.label} <span className="count">{counts[v.key]}</span>
              </button>
            ))}
          </div>
          <label className="search">
            <Search size={16} />
            <input type="search" placeholder="Entreprise, contact, prestation…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher un dossier" />
          </label>
        </div>
        {shown.length === 0 ? (
          <div className="empty">
            <p className="note">
              {rows.length === 0
                ? 'Aucun dossier. Ouvrez-en un depuis une demande (bouton « Ouvrir le dossier client ») ou avec « Nouveau dossier ».'
                : 'Aucun dossier dans ce filtre.'}
            </p>
          </div>
        ) : (
          <div className="scroll">
            <table className="tbl-wide tbl-form dossiers-table">
              <thead>
                <tr><th className="col-main">Client</th><th>Statut</th><th>Score</th><th>Informations</th><th>Actions</th><th>Documents</th><th>Mis à jour</th></tr>
              </thead>
              <tbody>
                {shown.map((d) => {
                  const l = scoreLevel(d.score);
                  return (
                    <tr key={d.id}>
                      <td>
                        <Link href={`/admin/clients/${d.id}`} className="dossier-link">
                          <b>{d.company || 'Sans nom'}</b>
                          <span className="note">{[d.contact_name, d.offer].filter(Boolean).join(' · ') || d.email}</span>
                        </Link>
                        {!d.client_id && <span className="pill none">Compte non rattaché</span>}
                        {expired(d) && <span className="pill bad">À supprimer (3 ans)</span>}
                      </td>
                      <td><span className={'pill ' + STATE[d.status]}>{d.status}</span></td>
                      <td><span className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>{pct(d.score)}{d.score !== null && <span className={'pill ' + l.state}>{l.label}</span>}</span></td>
                      <td>
                        {d.infos_answered > 0 && <span className="pill warn">{d.infos_answered} à lire</span>}
                        {d.infos_pending > 0 && <span className="note"> {d.infos_pending} attendue{d.infos_pending > 1 ? 's' : ''}</span>}
                        {!d.infos_answered && !d.infos_pending && <span className="note">–</span>}
                      </td>
                      <td>{d.open_actions}{d.late_actions > 0 && <span className="pill bad"> {d.late_actions} en retard</span>}</td>
                      <td><span className="note">{d.client_documents} reçu{d.client_documents > 1 ? 's' : ''} · {d.deliverables} livré{d.deliverables > 1 ? 's' : ''}</span></td>
                      <td><span className="note nowrap">{new Date(d.updated_at).toLocaleDateString('fr-FR')}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
