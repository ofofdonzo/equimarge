'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AUTOMATION, COMPLIANCE, STATUSES, poleOf } from '@/components/offers';
import { AGENTS } from '@/components/agents';
import {
  Alert, ArrowLeft, Bell, Bot, Calendar, Check, Clock, Copy, External, Mail, Phone, Search, Wallet,
} from '@/components/icons';

// Poste de travail de l'administrateur : les demandes arrivent en direct, se traitent dans une fiche
// (réponse, statut, devis, prochaine action, notes) et les agents IA sont à portée de clic.

const VIEWS = [
  { key: 'todo', label: 'À traiter', test: (r) => r.status === 'Nouvelle' },
  { key: 'active', label: 'En cours', test: (r) => r.status === 'Contactée' || r.status === 'Devis envoyé' },
  { key: 'won', label: 'Gagnées', test: (r) => r.status === 'Gagnée' },
  { key: 'all', label: 'Toutes', test: () => true },
];
const POLES = ['Tous', 'Marges', 'Conformité', 'Automatisation'];
const OPEN = (r) => r.status !== 'Gagnée' && r.status !== 'Perdue';

const euros = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
const today = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-JJ, heure locale

function ago(iso) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'hier' : `il y a ${d} j`;
}

function subjectOf(r) {
  const pole = poleOf(r.offer);
  if (pole === 'Marges') return `diagnostic de marge ${r.offer}`;
  if (pole === 'Automatisation') return "devis d'automatisation";
  return 'devis de mise en conformité';
}

function replyMailto(r) {
  const what = subjectOf(r) + (r.topics?.length ? ` (${r.topics.join(', ')})` : '');
  const body = [
    `Bonjour ${r.contact_name},`,
    '',
    `Merci pour votre demande de ${what} pour ${r.company}.`,
    '',
    'Pour bien comprendre votre situation, je vous propose un premier échange de 30 minutes, par téléphone ou en visio.' +
      (r.availability ? ` Vous avez indiqué être disponible « ${r.availability} » : quel créneau vous conviendrait ?` : ' Quels créneaux vous conviendraient cette semaine ?'),
    '',
    'Bien cordialement,',
    '',
    'Equimarge',
    'contact@equimarge.fr',
  ].join('\n');
  return `mailto:${r.email}?subject=${encodeURIComponent(`Votre demande de ${subjectOf(r)} — Equimarge`)}&body=${encodeURIComponent(body)}`;
}

function briefForClaude(r, t, notes) {
  return [
    "Aide-moi à traiter cette demande reçue sur le site d'Equimarge (diagnostic de marge, conformité, automatisation par agents IA pour PME).",
    "Propose-moi : 1) une réponse e-mail courte et personnalisée, 2) les questions à poser lors du premier appel, 3) une fourchette de devis argumentée si c'est pertinent.",
    '',
    `Date : ${new Date(r.created_at).toLocaleString('fr-FR')}`,
    `Demande : ${r.offer} (pôle ${poleOf(r.offer)})${r.topics?.length ? ' — ' + r.topics.join(', ') : ''}`,
    `Entreprise : ${r.company}${r.siren ? ' (SIREN ' + r.siren + ')' : ''}`,
    `Secteur : ${r.sector || '—'} · Chiffre d'affaires : ${r.revenue_band || '—'}`,
    `Contact : ${r.contact_name}${r.availability ? ' · disponible ' + r.availability : ''}`,
    `Message du client : ${r.message || '(aucun)'}`,
    `Statut : ${r.status}${t?.amount ? ' · devis ' + euros(t.amount) : ''}`,
    notes?.length ? 'Mes notes :\n' + notes.map((n) => `- ${n.body}`).join('\n') : '',
  ].filter(Boolean).join('\n');
}

// Petit signal sonore à l'arrivée d'une demande (pas de fichier audio à charger)
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.16);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + i * 0.16 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.16 + 0.14);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.16);
      o.stop(ctx.currentTime + i * 0.16 + 0.15);
    });
  } catch {
    // Son indisponible : la notification visuelle suffit.
  }
}

export default function Workspace({ initialRequests, initialTracking, setupMissing }) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState(initialRequests);
  const [tracking, setTracking] = useState(() => Object.fromEntries(initialTracking.map((t) => [t.request_id, t])));
  const [view, setView] = useState(initialRequests.some((r) => r.status === 'Nouvelle') ? 'todo' : 'all');
  const [pole, setPole] = useState('Tous');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [live, setLive] = useState(false);
  const [fresh, setFresh] = useState(() => new Set());
  const [perm, setPerm] = useState('default');
  const [msg, setMsg] = useState('');

  // ---------- Temps réel ----------
  const notify = useCallback((r) => {
    beep();
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const n = new Notification('Nouvelle demande — Equimarge', {
          body: `${r.company} · ${r.offer}`,
          tag: r.id,
        });
        n.onclick = () => { window.focus(); setSelected(r.id); n.close(); };
      }
    } catch {
      // Notifications non prises en charge (certains navigateurs mobiles)
    }
  }, []);

  useEffect(() => {
    if ('Notification' in window) setPerm(Notification.permission);
    const channel = supabase
      .channel('poste-de-travail')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diagnostic_requests' }, (p) => {
        if (p.eventType === 'INSERT') {
          setRows((rs) => (rs.some((x) => x.id === p.new.id) ? rs : [p.new, ...rs]));
          setFresh((s) => new Set(s).add(p.new.id));
          notify(p.new);
        } else if (p.eventType === 'UPDATE') {
          setRows((rs) => rs.map((x) => (x.id === p.new.id ? { ...x, ...p.new } : x)));
        } else if (p.eventType === 'DELETE') {
          setRows((rs) => rs.filter((x) => x.id !== p.old.id));
        }
      })
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));
    return () => { supabase.removeChannel(channel); };
  }, [supabase, notify]);

  // Nombre de demandes à traiter dans le titre de l'onglet
  const todoCount = rows.filter((r) => r.status === 'Nouvelle').length;
  useEffect(() => {
    document.title = (todoCount ? `(${todoCount}) ` : '') + 'Poste de travail — Equimarge';
  }, [todoCount]);

  async function askPermission() {
    if (!('Notification' in window)) return setMsg("Ce navigateur n'affiche pas les notifications.");
    setPerm(await Notification.requestPermission());
  }

  // ---------- Filtres et indicateurs ----------
  const due = (r) => OPEN(r) && tracking[r.id]?.next_action_at && tracking[r.id].next_action_at <= today();
  const counts = Object.fromEntries(VIEWS.map((v) => [v.key, rows.filter(v.test).length]));
  const shown = rows.filter((r) => {
    if (!VIEWS.find((v) => v.key === view).test(r)) return false;
    if (pole !== 'Tous' && poleOf(r.offer) !== pole) return false;
    if (!q) return true;
    const hay = `${r.company} ${r.contact_name} ${r.email} ${r.message || ''}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  const dueCount = rows.filter(due).length;
  const quoted = rows.filter((r) => r.status === 'Devis envoyé').reduce((s, r) => s + Number(tracking[r.id]?.amount || 0), 0);
  const won = rows.filter((r) => r.status === 'Gagnée').reduce((s, r) => s + Number(tracking[r.id]?.amount || 0), 0);
  const current = rows.find((r) => r.id === selected) || null;

  function open(id) {
    setSelected(id);
    setFresh((s) => { const n = new Set(s); n.delete(id); return n; });
  }

  async function setStatus(id, status) {
    const prev = rows;
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error } = await supabase.from('diagnostic_requests').update({ status }).eq('id', id);
    if (error) { setRows(prev); setMsg('Statut non enregistré : ' + error.message); } else setMsg('');
  }

  return (
    <div className="stack ws">
      <div className="ws-head">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Poste de travail</h1>
        </div>
        <div className="row">
          <span className={'live' + (live ? ' on' : '')} title="Les nouvelles demandes s'affichent sans recharger la page">
            {live ? 'En direct' : 'Connexion…'}
          </span>
          {perm !== 'granted' && (
            <button type="button" className="btn ghost sm" onClick={askPermission}>
              <Bell size={16} /> Activer les alertes
            </button>
          )}
        </div>
      </div>

      {setupMissing && (
        <p className="err">
          Le suivi des devis et les notes ne sont pas encore activés : exécutez à nouveau <b>supabase/schema.sql</b> dans
          Supabase &gt; SQL Editor.
        </p>
      )}
      {msg && <p className="err" role="alert">{msg}</p>}

      <div className="kpis">
        <div className="kpi"><span className="kpi-icon"><Mail size={18} /></span><small>À traiter</small><b>{counts.todo}</b></div>
        <div className="kpi"><span className="kpi-icon"><Calendar size={18} /></span><small>Relances dues</small><b className={dueCount ? 'neg' : ''}>{dueCount}</b></div>
        <div className="kpi"><span className="kpi-icon"><Clock size={18} /></span><small>Devis en attente</small><b>{euros(quoted)}</b></div>
        <div className="kpi"><span className="kpi-icon"><Wallet size={18} /></span><small>Gagné</small><b>{euros(won)}</b></div>
      </div>

      <div className={'ws-grid' + (current ? ' has-selection' : '')}>
        <section className="panel ws-list" aria-label="Demandes">
          <div className="segmented four" role="group" aria-label="Filtrer par état">
            {VIEWS.map((v) => (
              <button key={v.key} type="button" aria-pressed={view === v.key} onClick={() => setView(v.key)}>
                {v.label} <span className="count">{counts[v.key]}</span>
              </button>
            ))}
          </div>
          <div className="ws-filters">
            <label className="search">
              <Search size={16} />
              <input type="search" placeholder="Entreprise, contact, message…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher une demande" />
            </label>
            <select className="status" value={pole} onChange={(e) => setPole(e.target.value)} aria-label="Filtrer par pôle">
              {POLES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          {shown.length === 0 ? (
            <div className="empty note">
              {rows.length === 0
                ? "Aucune demande pour le moment. Gardez cette page ouverte : elles s'afficheront ici dès qu'un client remplit un formulaire."
                : 'Aucune demande dans ce filtre.'}
            </div>
          ) : (
            <ul className="req-list">
              {shown.map((r) => {
                const t = tracking[r.id];
                return (
                  <li key={r.id}>
                    <button type="button" className={'req' + (selected === r.id ? ' active' : '') + (fresh.has(r.id) ? ' fresh' : '')} onClick={() => open(r.id)}>
                      <span className="req-top">
                        <b>{r.company}</b>
                        <small>{ago(r.created_at)}</small>
                      </span>
                      <span className="req-meta">
                        <span className={'pole-tag p-' + poleOf(r.offer).toLowerCase()}>{poleOf(r.offer)}</span>
                        {r.offer !== poleOf(r.offer) && <span>{r.offer} ·</span>}
                        <span>{r.contact_name}</span>
                      </span>
                      <span className="req-bottom">
                        <span className={'pill ' + (r.status === 'Nouvelle' ? 'warn' : r.status === 'Gagnée' ? 'ok' : r.status === 'Perdue' ? 'bad' : '')}>{r.status}</span>
                        {due(r) && <span className="pill bad">Relance due</span>}
                        {t?.amount ? <span className="note">{euros(t.amount)}</span> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panel ws-detail" aria-label="Fiche de la demande">
          {current ? (
            <RequestCard
              key={current.id}
              r={current}
              t={tracking[current.id]}
              supabase={supabase}
              setupMissing={setupMissing}
              onBack={() => setSelected(null)}
              onStatus={(s) => setStatus(current.id, s)}
              onTracking={(t) => setTracking((m) => ({ ...m, [current.id]: t }))}
            />
          ) : (
            <div className="ws-placeholder">
              <span className="done-icon"><Mail size={24} /></span>
              <h2>Choisissez une demande</h2>
              <p className="note">
                Sa fiche s'ouvre ici : répondre en un clic, changer le statut, noter le montant du devis et la prochaine
                relance, garder vos notes.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2 className="row" style={{ gap: 10 }}><Bot size={20} /> Mes agents</h2>
          <span className="note">Ils préparent, vous validez : aucun n'envoie de mail ni ne paie.</span>
        </div>
        <ul className="agents">
          {AGENTS.map((a) => (
            <li key={a.name} className="agent">
              <span className="agent-top"><b>{a.name}</b><span className="pill ok">Planifié</span></span>
              <span className="meta"><Clock size={14} />{a.when}</span>
              <span className="note">{a.does}</span>
              {a.link && (
                <a href={a.link.href} target="_blank" rel="noopener noreferrer" className="domain-link">
                  {a.link.label} <External size={14} />
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function RequestCard({ r, t, supabase, setupMissing, onBack, onStatus, onTracking }) {
  const [amount, setAmount] = useState(t?.amount ?? '');
  const [nextAction, setNextAction] = useState(t?.next_action ?? '');
  const [nextAt, setNextAt] = useState(t?.next_action_at ?? '');
  const [saveState, setSaveState] = useState('');
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState('');
  const topRef = useRef(null);
  const pole = poleOf(r.offer);

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'nearest' });
    if (setupMissing) return;
    supabase
      .from('request_notes')
      .select('*')
      .eq('request_id', r.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data || []));
  }, [r.id, supabase, setupMissing]);

  async function saveTracking(e) {
    e.preventDefault();
    const value = amount === '' ? null : Number(String(amount).replace(/\s/g, '').replace(',', '.'));
    if (value !== null && (!Number.isFinite(value) || value < 0)) return setErr('Montant invalide.');
    setSaveState('busy');
    const row = { request_id: r.id, amount: value, next_action: nextAction.trim() || null, next_action_at: nextAt || null, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('request_tracking').upsert(row);
    if (error) { setSaveState(''); return setErr('Suivi non enregistré : ' + error.message); }
    setErr('');
    onTracking(row);
    setSaveState('ok');
    setTimeout(() => setSaveState(''), 2000);
  }

  async function addNote(e) {
    e.preventDefault();
    const body = note.trim();
    if (!body) return;
    const { data, error } = await supabase.from('request_notes').insert({ request_id: r.id, body }).select().single();
    if (error) return setErr('Note non enregistrée : ' + error.message);
    setErr('');
    setNotes((n) => [data, ...n]);
    setNote('');
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(briefForClaude(r, t, notes));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErr('Copie impossible dans ce navigateur.');
    }
  }

  const topicNames = r.topics || [];
  const known = pole === 'Automatisation' ? AUTOMATION : pole === 'Conformité' ? COMPLIANCE : [];

  return (
    <div className="stack" ref={topRef} style={{ gap: 18 }}>
      <button type="button" className="link-btn back" onClick={onBack}><ArrowLeft size={16} /> Toutes les demandes</button>
      <div>
        <span className={'pole-tag p-' + pole.toLowerCase()}>{pole}</span>
        <h2 className="card-title">{r.company}</h2>
        <p className="note" style={{ margin: 0 }}>
          {r.offer !== pole ? `${r.offer} · ` : ''}Reçue le {new Date(r.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })} ({ago(r.created_at)})
        </p>
      </div>

      <div className="row">
        <a className="btn sm" href={replyMailto(r)} onClick={() => r.status === 'Nouvelle' && onStatus('Contactée')}>
          <Mail size={16} /> Répondre
        </a>
        {r.phone && <a className="btn ghost sm" href={`tel:${r.phone.replace(/\s/g, '')}`}><Phone size={16} /> Appeler</a>}
        <button type="button" className="btn ghost sm" onClick={copyBrief}>
          {copied ? <><Check size={16} /> Copié</> : <><Copy size={16} /> Copier pour Claude</>}
        </button>
        <select className="status" aria-label="Statut" value={r.status} onChange={(e) => onStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <p className="note" style={{ margin: '-8px 0 0' }}>
        « Répondre » ouvre votre messagerie avec un premier message prêt, et passe la demande en « Contactée ».
      </p>

      {err && <p className="err" role="alert">{err}</p>}

      <dl className="facts">
        <div><dt>Contact</dt><dd>{r.contact_name}</dd></div>
        <div><dt>E-mail</dt><dd><a href={`mailto:${r.email}`}>{r.email}</a></dd></div>
        <div><dt>Téléphone</dt><dd>{r.phone || '—'}</dd></div>
        <div><dt>Disponibilités</dt><dd>{r.availability || '—'}</dd></div>
        <div><dt>SIREN</dt><dd>{r.siren ? <a href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${r.siren}`} target="_blank" rel="noopener noreferrer">{r.siren} <External size={12} /></a> : '—'}</dd></div>
        <div><dt>Secteur</dt><dd>{r.sector || '—'}</dd></div>
        <div><dt>Chiffre d'affaires</dt><dd>{r.revenue_band || '—'}</dd></div>
        <div><dt>Compte client</dt><dd>{r.user_id ? 'Oui' : 'Non'}</dd></div>
      </dl>

      {topicNames.length > 0 && (
        <div>
          <h3 className="mini">{pole === 'Automatisation' ? 'Tâches à automatiser' : 'Domaines'}</h3>
          <div className="row" style={{ gap: 8 }}>
            {topicNames.map((name) => {
              const k = known.find((d) => d.id === name);
              return <span key={name} className="chip">{k?.floor ? `${k.floor} · ` : ''}{name}</span>;
            })}
          </div>
        </div>
      )}

      {r.message && (
        <div>
          <h3 className="mini">Message du client</h3>
          <blockquote className="quote">{r.message}</blockquote>
        </div>
      )}

      {!setupMissing && (
        <>
          <form className="tracking" onSubmit={saveTracking}>
            <h3 className="mini">Suivi</h3>
            <div className="grid3">
              <div className="field"><label htmlFor="amount">Montant du devis (€ HT)</label><input id="amount" inputMode="decimal" placeholder="ex. 1 200" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
              <div className="field"><label htmlFor="next">Prochaine action</label><input id="next" maxLength={300} placeholder="ex. Relancer pour le devis" value={nextAction} onChange={(e) => setNextAction(e.target.value)} /></div>
              <div className="field"><label htmlFor="nextAt">Pour le</label><input id="nextAt" type="date" value={nextAt} onChange={(e) => setNextAt(e.target.value)} /></div>
            </div>
            <div className="row">
              <button type="submit" className="btn ghost sm" disabled={saveState === 'busy'}>Enregistrer le suivi</button>
              {saveState === 'ok' && <span className="save">Enregistré</span>}
              {OPEN(r) && nextAt && nextAt <= today() && <span className="pill bad"><Alert size={12} /> Relance due</span>}
            </div>
          </form>

          <div>
            <h3 className="mini">Notes</h3>
            <form className="note-form" onSubmit={addNote}>
              <textarea rows={2} maxLength={4000} placeholder="Ce que vous avez appris au téléphone, ce qui a été promis…" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Nouvelle note" />
              <button type="submit" className="btn sm" disabled={!note.trim()}>Ajouter</button>
            </form>
            {notes.length > 0 && (
              <ul className="notes">
                {notes.map((n) => (
                  <li key={n.id}>
                    <small>{new Date(n.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</small>
                    <p>{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
