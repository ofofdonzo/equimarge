'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Download } from '@/components/icons';
import { DOMAINS, domainScores, globalScore, isMission, MAX_FILE_SIZE, scoreLevel, storageName, todayISO } from '@/lib/conformite.mjs';
import Overview from './Overview';
import Questionnaire from './Questionnaire';
import Actions from './Actions';
import Register from './Register';
import Risks from './Risks';
import InfoRequests from './InfoRequests';
import Documents from './Documents';
import Messages from './Messages';
import { downloadWorkbook } from './excel';
import { openUrl } from '@/lib/platform';

const TAB_LABELS = {
  bord: 'Tableau de bord',
  infos: 'Demandes d’informations',
  documents: 'Documents',
  messages: 'Messages',
  diagnostic: 'Auto-diagnostic',
  actions: 'Plan d’action',
  registre: 'Registre RGPD',
  risques: 'Risques',
};
// Onglets selon le rôle : Equimarge (admin) réalise la mission et voit tout ; le client ne voit que
// ce qui a déjà du contenu (le plan, le registre et les risques apparaissent quand Equimarge les a établis).
function tabsFor(role, lists) {
  if (role === 'admin') return ['bord', 'infos', 'documents', 'messages', 'diagnostic', 'actions', 'registre', 'risques'];
  const filled = { actions: lists.actions.length, registre: lists.records.length, risques: lists.risks.length };
  return ['bord', 'infos', 'documents', 'messages', 'actions', 'registre', 'risques', 'diagnostic'].filter((t) => !(t in filled) || filled[t] > 0);
}
// Application mobile : quatre onglets en bas de l'écran, les autres dans « Plus »
const APP_TABS = [
  { key: 'bord', label: 'Accueil' },
  { key: 'infos', label: 'Demandes' },
  { key: 'documents', label: 'Documents' },
  { key: 'messages', label: 'Messages' },
];
const MESSAGE_ERRORS = {
  trop_de_messages: 'Trop de messages en peu de temps : réessayez dans une heure.',
  acces_refuse: 'La messagerie n’est pas encore ouverte pour ce dossier.',
  limite_de_lignes: 'Ce dossier a atteint le nombre maximal de messages.',
};
function messageError(error) {
  const key = Object.keys(MESSAGE_ERRORS).find((k) => error?.message?.includes(k));
  return key ? MESSAGE_ERRORS[key] : 'Message non envoyé. Vérifiez votre connexion et réessayez.';
}
// Filtre par domaine : seulement sur les listes longues (plan d'action, risques)
const FILTERED_TABS = new Set(['actions', 'risques']);

// Table de la base et nombre maximal de lignes par dossier (mêmes limites que supabase/schema.sql)
const TABLES = {
  actions: { table: 'dossier_actions', max: 500 },
  records: { table: 'dossier_records', max: 300 },
  risks: { table: 'dossier_risks', max: 300 },
  infos: { table: 'dossier_info_requests', max: 300 },
};

function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// offline : aperçu sans base (rien n'est enregistré).
// app : présent dans l'application mobile ({ onAccount, requestedTab, demo }) : onglets en bas de l'écran.
export default function Workspace({ role = 'client', dossier, initial, setupMissing = false, offline = false, app = null }) {
  const supabase = useMemo(() => (offline ? null : createClient()), [offline]);
  const admin = role === 'admin';
  const mission = isMission(dossier);
  const [tab, setTab] = useState('bord');
  const [domain, setDomain] = useState('');
  const [answers, setAnswers] = useState(initial.answers);
  const [lists, setLists] = useState({
    actions: initial.actions,
    records: initial.records,
    risks: initial.risks,
    infos: initial.infos,
    documents: initial.documents,
  });
  const [messages, setMessages] = useState(initial.messages || []);
  const [moreOpen, setMoreOpen] = useState(false);
  const [saveState, setSaveState] = useState('Enregistré');
  // L'état d'enregistrement ne s'affiche qu'après la première modification
  const [touched, setTouched] = useState(false);
  const today = useMemo(() => todayISO(), []);
  const scores = useMemo(() => domainScores(answers), [answers]);

  // Enregistrement : les saisies sont regroupées 600 ms après la dernière frappe, et « Enregistré »
  // ne s'affiche qu'une fois toutes les écritures en cours terminées.
  const timers = useRef({});
  const pending = useRef(0);
  const failure = useRef(null);
  const inserting = useRef({});

  function begin() {
    pending.current += 1;
    setTouched(true);
    setSaveState('Enregistrement…');
  }
  function end(error, message) {
    if (error) {
      failure.current =
        message ||
        (error.message?.includes('limite_de_lignes')
          ? 'Limite de lignes atteinte pour ce dossier.'
          : "Échec de l'enregistrement. Vérifiez votre connexion.");
    }
    pending.current -= 1;
    if (pending.current === 0) {
      setSaveState(failure.current || 'Enregistré');
      failure.current = null;
    }
  }
  function schedule(key, write) {
    if (!supabase) return;
    if (timers.current[key]) clearTimeout(timers.current[key]);
    else begin();
    timers.current[key] = setTimeout(async () => {
      delete timers.current[key];
      const { error } = await write();
      end(error);
    }, 600);
  }
  function cancel(key) {
    if (!timers.current[key]) return;
    clearTimeout(timers.current[key]);
    delete timers.current[key];
    end(null);
  }
  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);
  useEffect(() => {
    const warn = (e) => {
      if (pending.current > 0) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  // ---------- Messagerie : nouveaux messages en temps réel ----------
  useEffect(() => {
    if (!supabase || !dossier?.id) return undefined;
    const channel = supabase
      .channel(`messages:${dossier.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dossier_messages', filter: `dossier_id=eq.${dossier.id}` }, (p) =>
        setMessages((l) => (l.some((m) => m.id === p.new.id) ? l : [...l, p.new]))
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, dossier?.id]);

  // Onglet demandé par l'application (notification touchée)
  const requested = app?.requestedTab || null;
  const [seenRequest, setSeenRequest] = useState(null);
  if (requested !== seenRequest) {
    setSeenRequest(requested);
    if (requested?.tab) setTab(requested.tab);
  }

  async function sendMessage(body) {
    if (!supabase) {
      setMessages((l) => [...l, { id: newId(), from_admin: admin, body, read_at: null, created_at: new Date().toISOString() }]);
      return null;
    }
    const { data, error } = await supabase
      .from('dossier_messages')
      .insert({ dossier_id: dossier.id, body })
      .select('id,from_admin,body,read_at,created_at')
      .single();
    if (error) return messageError(error);
    setMessages((l) => (l.some((m) => m.id === data.id) ? l : [...l, data]));
    return null;
  }

  // ---------- Auto-diagnostic : cliquer à nouveau sur la réponse choisie l'efface ----------
  function answer(question, value) {
    const next = answers[question] === value ? null : value;
    setAnswers((a) => {
      const n = { ...a };
      if (next) n[question] = next;
      else delete n[question];
      return n;
    });
    schedule('q:' + question, () =>
      next
        ? supabase.from('dossier_answers').upsert({ dossier_id: dossier.id, question, answer: next, updated_at: new Date().toISOString() })
        : supabase.from('dossier_answers').delete().eq('dossier_id', dossier.id).eq('question', question)
    );
  }

  // ---------- Lignes des tableaux (réservé à Equimarge) ----------
  async function add(kind, rows) {
    const { table, max } = TABLES[kind];
    if (lists[kind].length + rows.length > max) {
      setSaveState(`Limite de ${max} lignes atteinte.`);
      return null;
    }
    const full = rows.map((r) => ({ id: newId(), dossier_id: dossier.id, ...r }));
    setLists((l) => ({ ...l, [kind]: [...l[kind], ...full] }));
    if (!supabase) return full[0];
    begin();
    // Vraie promesse : une requête Supabase attendue deux fois serait envoyée deux fois.
    const insert = Promise.resolve(supabase.from(table).insert(full));
    full.forEach((r) => (inserting.current[r.id] = insert));
    const { error } = await insert;
    full.forEach((r) => delete inserting.current[r.id]);
    if (error) {
      const ids = new Set(full.map((r) => r.id));
      setLists((l) => ({ ...l, [kind]: l[kind].filter((r) => !ids.has(r.id)) }));
    }
    end(error);
    return error ? null : full[0];
  }

  function update(kind, id, patch) {
    const row = { ...lists[kind].find((r) => r.id === id), ...patch };
    setLists((l) => ({ ...l, [kind]: l[kind].map((r) => (r.id === id ? row : r)) }));
    const values = { ...row };
    delete values.id;
    schedule(kind + id, async () => {
      await inserting.current[id];
      return supabase.from(TABLES[kind].table).update(values).eq('id', id);
    });
  }

  async function remove(kind, id) {
    const prev = lists[kind];
    cancel(kind + id);
    setLists((l) => ({ ...l, [kind]: l[kind].filter((r) => r.id !== id) }));
    if (!supabase) return;
    await inserting.current[id];
    begin();
    const { error } = await supabase.from(TABLES[kind].table).delete().eq('id', id);
    if (error) setLists((l) => ({ ...l, [kind]: prev }));
    end(error);
  }

  // Actions recommandées par l'auto-diagnostic : priorité haute pour « Non », moyenne pour « En partie ».
  function addRecommended(questions) {
    return add(
      'actions',
      questions.map((q) => ({
        domain: q.domain,
        title: q.action,
        owner: '',
        due_date: null,
        priority: answers[q.key] === 'non' ? 'Haute' : 'Moyenne',
        status: 'À faire',
        source: q.key,
      }))
    );
  }

  // ---------- Réponse du client à une demande d'informations ----------
  async function answerInfo(id, text) {
    const patch = { response: text, status: 'Fourni', answered_at: new Date().toISOString() };
    if (supabase) {
      begin();
      const { error } = await supabase.rpc('answer_info_request', { i: id, reply: text });
      end(error, error && 'Réponse non envoyée. Réessayez.');
      if (error) return;
    }
    setLists((l) => ({ ...l, infos: l.infos.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  }

  // ---------- Documents (espace de stockage privé « dossiers ») ----------
  async function upload(file, { kind = admin ? 'Livrable' : 'Client', requestId = null } = {}) {
    if (file.size > MAX_FILE_SIZE) return setSaveState('Fichier trop lourd : 10 Mo au plus.');
    const id = newId();
    const row = {
      id,
      dossier_id: dossier.id,
      info_request_id: requestId,
      kind,
      name: file.name.slice(0, 200) || 'document',
      path: `${dossier.id}/${id}-${storageName(file.name)}`,
      size: file.size,
    };
    if (supabase) {
      begin();
      const { error: sent } = await supabase.storage.from('dossiers').upload(row.path, file, { contentType: file.type || undefined });
      if (sent) return end(sent, 'Document non envoyé : vérifiez son format (PDF, Word, Excel, image, texte).');
      const { error } = await supabase.from('dossier_documents').insert(row);
      if (error) {
        if (admin) await supabase.storage.from('dossiers').remove([row.path]);
        return end(error, 'Document non enregistré. Réessayez.');
      }
      end(null);
    }
    setLists((l) => ({ ...l, documents: [...l.documents, { ...row, created_at: new Date().toISOString() }] }));
  }

  async function openDoc(doc) {
    if (!supabase) return setSaveState('Aperçu : les documents ne sont pas téléchargeables.');
    const { data, error } = await supabase.storage.from('dossiers').createSignedUrl(doc.path, 60, { download: doc.name });
    if (error) return setSaveState('Téléchargement impossible : ' + error.message);
    openUrl(data.signedUrl);
  }

  async function removeDoc(doc) {
    if (!window.confirm(`Supprimer définitivement « ${doc.name} » ?`)) return;
    if (supabase) {
      begin();
      const { error: e1 } = await supabase.storage.from('dossiers').remove([doc.path]);
      const { error: e2 } = e1 ? { error: e1 } : await supabase.from('dossier_documents').delete().eq('id', doc.id);
      end(e2, e2 && 'Suppression impossible : ' + e2.message);
      if (e2) return;
    }
    setLists((l) => ({ ...l, documents: l.documents.filter((d) => d.id !== doc.id) }));
  }

  const saveClass = saveState === 'Enregistré' ? 'save' : saveState === 'Enregistrement…' ? 'save busy' : 'save bad';
  const status = app?.demo ? null : !supabase ? (
    <span className="save">Aperçu : rien n’est enregistré</span>
  ) : touched || saveState !== 'Enregistré' ? (
    <span className={saveClass} aria-live="polite">{saveState}</span>
  ) : null;
  const filtered = (list) => list.filter((x) => !domain || x.domain === domain);
  const pendingInfos = lists.infos.filter((i) => i.status === 'À fournir').length;
  const unread = messages.filter((m) => m.from_admin !== admin && !m.read_at).length;
  const tabs = tabsFor(role, lists);
  const current = tabs.includes(tab) ? tab : 'bord';

  // Messages reçus marqués comme lus dès que l'onglet Messages est ouvert
  useEffect(() => {
    if (!supabase || !mission || current !== 'messages' || unread === 0) return undefined;
    let cancelled = false;
    supabase.rpc('mark_messages_read', { d: dossier.id }).then(({ error }) => {
      if (cancelled || error) return;
      const now = new Date().toISOString();
      setMessages((l) => l.map((m) => (m.from_admin !== admin && !m.read_at ? { ...m, read_at: now } : m)));
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, mission, current, unread, admin, dossier?.id]);

  const setupError = setupMissing && (
    <p className="err" role="alert">
      Les tables des dossiers n’existent pas encore dans la base : relancez le fichier supabase/schema.sql dans Supabase
      (SQL Editor), puis rechargez la page.
    </p>
  );

  // ---------- Client sans mission : un seul écran, le questionnaire guidé ----------
  if (!admin && !mission) {
    return (
      <div className="stack">
        {setupError}
        <DiagnosticSummary scores={scores} status={status} />
        <Questionnaire answers={answers} scores={scores} domain="" actions={[]} canPlan={false} onAnswer={answer} onAddActions={addRecommended} />
        <div className="panel callout row" style={{ justifyContent: 'space-between' }}>
          <div style={{ minWidth: 0, flex: '1 1 300px' }}>
            <h2 style={{ marginBottom: 4 }}>Confiez votre mise en conformité à Equimarge</h2>
            <p className="note" style={{ margin: 0 }}>
              Vous nous transmettez les informations, nous réalisons registre, procédures et plan d’action, et vous suivez
              l’avancement ici.
            </p>
          </div>
          <Link className="btn" href="/conformite#devis">Demander un devis <ArrowRight size={18} /></Link>
        </div>
        <p className="note" style={{ margin: 0 }}>
          Cet auto-diagnostic donne des repères d’organisation ; il ne constitue pas une consultation juridique.
        </p>
      </div>
    );
  }

  const showFilter = FILTERED_TABS.has(current) && (current === 'actions' ? lists.actions : lists.risks).length > 0;

  return (
    <div className="stack">
      {setupError}

      {app ? (
        status && <div className="row ws-tools">{status}</div>
      ) : (
        <div className="ws-bar">
          <div className="tabs" role="tablist" aria-label="Outils du dossier">
            {tabs.map((t) => (
              <button key={t} type="button" role="tab" id={`tab-${t}`} aria-selected={current === t} aria-controls="ws-panel" onClick={() => setTab(t)}>
                {TAB_LABELS[t]}
                {t === 'infos' && pendingInfos > 0 && <span className="tab-count">{pendingInfos}</span>}
                {t === 'messages' && unread > 0 && <span className="tab-count">{unread}</span>}
              </button>
            ))}
          </div>
          <span className="row ws-tools">
            {status}
            <button type="button" className="btn ghost sm" onClick={() => downloadWorkbook({ answers, ...lists }, dossier.company)}>
              <Download size={16} />Excel
            </button>
          </span>
        </div>
      )}

      {showFilter && (
        <div className="chips" role="group" aria-label="Filtrer par domaine">
          <button type="button" aria-pressed={domain === ''} onClick={() => setDomain('')}>Tous les domaines</button>
          {DOMAINS.map((d) => (
            <button key={d.key} type="button" aria-pressed={domain === d.key} onClick={() => setDomain(d.key)}>{d.label}</button>
          ))}
        </div>
      )}
      {current === 'bord' && domain && (
        <div className="chips">
          <button type="button" aria-pressed="true" onClick={() => setDomain('')}>
            {DOMAINS.find((d) => d.key === domain)?.label} <span aria-hidden="true">×</span>
            <span className="sr-only"> : retirer le filtre</span>
          </button>
        </div>
      )}

      <div id="ws-panel" role="tabpanel" aria-labelledby={`tab-${current}`}>
        {current === 'bord' && (
          <Overview
            role={role}
            scores={scores}
            domain={domain}
            actions={filtered(lists.actions)}
            risks={filtered(lists.risks)}
            infos={lists.infos}
            deliverables={lists.documents.filter((d) => d.kind === 'Livrable').length}
            today={today}
            onPickDomain={setDomain}
            onOpen={setTab}
          />
        )}
        {current === 'diagnostic' && (
          <Questionnaire
            answers={answers}
            scores={scores}
            domain=""
            actions={lists.actions}
            canPlan={admin}
            onAnswer={answer}
            onAddActions={addRecommended}
          />
        )}
        {current === 'infos' && (
          <InfoRequests
            items={lists.infos}
            documents={lists.documents}
            role={role}
            today={today}
            onAdd={(row) => add('infos', [row])}
            onUpdate={(id, patch) => update('infos', id, patch)}
            onRemove={(id) => remove('infos', id)}
            onAnswer={answerInfo}
            onUpload={upload}
            onOpenDoc={openDoc}
          />
        )}
        {current === 'documents' && (
          <Documents documents={lists.documents} infos={lists.infos} role={role} offline={!supabase} onUpload={upload} onOpen={openDoc} onRemove={removeDoc} />
        )}
        {current === 'messages' && <Messages role={role} messages={messages} canWrite={admin || mission} onSend={sendMessage} />}
        {current === 'actions' && (
          <Actions
            actions={lists.actions}
            domain={domain}
            today={today}
            readOnly={!admin}
            onAdd={(row) => add('actions', [row])}
            onUpdate={(id, patch) => update('actions', id, patch)}
            onRemove={(id) => remove('actions', id)}
          />
        )}
        {current === 'registre' && (
          <Register
            records={lists.records}
            readOnly={!admin}
            onAdd={(row) => add('records', [row])}
            onUpdate={(id, patch) => update('records', id, patch)}
            onRemove={(id) => remove('records', id)}
          />
        )}
        {current === 'risques' && (
          <Risks
            risks={lists.risks}
            domain={domain}
            readOnly={!admin}
            onAdd={(row) => add('risks', [row])}
            onUpdate={(id, patch) => update('risks', id, patch)}
            onRemove={(id) => remove('risks', id)}
          />
        )}
      </div>

      {admin && (
        <p className="note" style={{ margin: 0 }}>
          Le client voit ce dossier dans son espace : tableau de bord, demandes, documents, messages, puis plan, registre et
          risques (en lecture seule) dès qu’ils contiennent quelque chose.
        </p>
      )}

      {app && (
        <AppTabBar
          tabs={tabs}
          current={current}
          counts={{ infos: pendingInfos, messages: unread }}
          moreOpen={moreOpen}
          onMore={setMoreOpen}
          onTab={(t) => {
            setMoreOpen(false);
            setTab(t);
            window.scrollTo(0, 0);
          }}
          onAccount={() => {
            setMoreOpen(false);
            app.onAccount?.();
          }}
        />
      )}
    </div>
  );
}

// Barre d'onglets de l'application : Accueil, Demandes, Documents, Messages, et « Plus » pour le reste.
function AppTabBar({ tabs, current, counts, moreOpen, onMore, onTab, onAccount }) {
  const main = APP_TABS.filter((t) => tabs.includes(t.key));
  const others = tabs.filter((t) => !APP_TABS.some((m) => m.key === t));
  const inOthers = others.includes(current);
  return (
    <>
      {moreOpen && (
        <div className="app-sheet" role="dialog" aria-modal="true" aria-label="Plus d’onglets">
          <button type="button" className="app-sheet-backdrop" aria-label="Fermer" onClick={() => onMore(false)} />
          <div className="app-sheet-panel">
            {others.map((t) => (
              <button key={t} type="button" aria-current={current === t ? 'page' : undefined} onClick={() => onTab(t)}>
                {TAB_LABELS[t]}
              </button>
            ))}
            <button type="button" onClick={onAccount}>Mon compte</button>
          </div>
        </div>
      )}
      <nav className="app-tabbar" aria-label="Onglets du dossier">
        {main.map((t) => (
          <button key={t.key} type="button" aria-current={current === t.key ? 'page' : undefined} onClick={() => onTab(t.key)}>
            <TabIcon name={t.key} />
            <span>{t.label}</span>
            {counts[t.key] > 0 && <span className="app-badge" aria-label={`${counts[t.key]} en attente`}>{counts[t.key]}</span>}
          </button>
        ))}
        <button type="button" aria-current={inOthers ? 'page' : undefined} aria-expanded={moreOpen} onClick={() => onMore(!moreOpen)}>
          <TabIcon name="plus" />
          <span>Plus</span>
        </button>
      </nav>
    </>
  );
}

const TAB_PATHS = {
  bord: ['M4 11.5 12 5l8 6.5', 'M6 10v9h12v-9'],
  infos: ['M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'm4 7 8 6 8-6'],
  documents: ['M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z'],
  messages: ['M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z'],
  plus: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
};
function TabIcon({ name }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === 'plus' ? 3 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {TAB_PATHS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

// En-tête de l'auto-diagnostic : progression et score, avec le détail par domaine dès la première réponse.
function DiagnosticSummary({ scores, status }) {
  const answered = scores.reduce((t, s) => t + s.answered, 0);
  const total = scores.reduce((t, s) => t + s.total, 0);
  const score = globalScore(scores);
  const level = scoreLevel(score);
  const evaluated = scores.filter((s) => s.score !== null);

  return (
    <section className="panel diag-summary">
      <div className="diag-head">
        <div>
          <span className="mini">Votre score</span>
          <div className="diag-score">
            <b>{score === null ? '–' : `${Math.round(score * 100)} %`}</b>
            {score !== null && <span className={'pill ' + level.state}>{level.label}</span>}
          </div>
        </div>
        <div className="diag-progress">
          <span className="row" style={{ justifyContent: 'space-between' }}>
            <span className="note">{answered === 0 ? 'Environ 10 minutes, 6 domaines' : `${answered} réponse${answered > 1 ? 's' : ''} sur ${total}`}</span>
            {status}
          </span>
          <span className="track" aria-hidden="true"><span className="fill" style={{ width: `${(answered / total) * 100}%` }} /></span>
        </div>
      </div>
      {evaluated.length > 0 && (
        <div className="bars diag-bars">
          {evaluated.map((s) => {
            const l = scoreLevel(s.score);
            return (
              <div key={s.key} className="bar">
                <span>{s.label}</span>
                <span className="track"><span className="fill" style={{ width: `${s.score * 100}%` }} /></span>
                <span className={'pill ' + l.state}>{Math.round(s.score * 100)}&nbsp;%</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
