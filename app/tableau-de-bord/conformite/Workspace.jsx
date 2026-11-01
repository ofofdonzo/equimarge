'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Download } from '@/components/icons';
import { DOMAINS, domainScores, isMission, MAX_FILE_SIZE, storageName, todayISO } from '@/lib/conformite.mjs';
import Overview from './Overview';
import Questionnaire from './Questionnaire';
import Actions from './Actions';
import Register from './Register';
import Risks from './Risks';
import InfoRequests from './InfoRequests';
import Documents from './Documents';
import { downloadWorkbook } from './excel';

const TAB_LABELS = {
  bord: 'Tableau de bord',
  infos: 'Demandes d’informations',
  documents: 'Documents',
  diagnostic: 'Auto-diagnostic',
  actions: 'Plan d’action',
  registre: 'Registre RGPD',
  risques: 'Risques',
};
// Onglets selon le rôle : Equimarge (admin) réalise la mission ; le client répond et suit l'avancement.
function tabsFor(role, mission) {
  if (role === 'admin') return ['bord', 'infos', 'documents', 'diagnostic', 'actions', 'registre', 'risques'];
  if (!mission) return ['bord', 'diagnostic'];
  return ['bord', 'infos', 'documents', 'actions', 'registre', 'risques', 'diagnostic'];
}
const FILTERED_TABS = new Set(['bord', 'diagnostic', 'actions', 'risques']);

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
export default function Workspace({ role = 'client', dossier, initial, setupMissing = false, offline = false }) {
  const supabase = useMemo(() => (offline ? null : createClient()), [offline]);
  const admin = role === 'admin';
  const mission = isMission(dossier);
  const tabs = tabsFor(role, mission);
  const [tab, setTab] = useState(tabs[0]);
  const [domain, setDomain] = useState('');
  const [answers, setAnswers] = useState(initial.answers);
  const [lists, setLists] = useState({
    actions: initial.actions,
    records: initial.records,
    risks: initial.risks,
    infos: initial.infos,
    documents: initial.documents,
  });
  const [saveState, setSaveState] = useState('Enregistré');
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
    window.location.assign(data.signedUrl);
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
  const filtered = (list) => list.filter((x) => !domain || x.domain === domain);
  const pendingInfos = lists.infos.filter((i) => i.status === 'À fournir').length;

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <span className={saveClass} aria-live="polite">{supabase ? saveState : 'Aperçu : rien n’est enregistré'}</span>
      </div>

      {setupMissing && (
        <p className="err" role="alert">
          Les tables des dossiers n’existent pas encore dans la base : relancez le fichier supabase/schema.sql dans
          Supabase (SQL Editor), puis rechargez la page.
        </p>
      )}

      <div className="ws-bar">
        <div className="tabs" role="tablist" aria-label="Outils du dossier">
          {tabs.map((t) => (
            <button key={t} type="button" role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls="ws-panel" onClick={() => setTab(t)}>
              {TAB_LABELS[t]}
              {t === 'infos' && pendingInfos > 0 && <span className="tab-count">{pendingInfos}</span>}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn ghost sm"
          onClick={() => downloadWorkbook({ answers, ...lists }, dossier.company)}
        >
          <Download size={16} />Exporter vers Excel
        </button>
      </div>

      {FILTERED_TABS.has(tab) && (
        <div className="chips" role="group" aria-label="Filtrer par domaine">
          <button type="button" aria-pressed={domain === ''} onClick={() => setDomain('')}>Tous les domaines</button>
          {DOMAINS.map((d) => (
            <button key={d.key} type="button" aria-pressed={domain === d.key} onClick={() => setDomain(d.key)}>{d.label}</button>
          ))}
        </div>
      )}

      <div id="ws-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 'bord' && (
          <Overview
            scores={scores}
            domain={domain}
            mission={mission || admin}
            actions={filtered(lists.actions)}
            risks={filtered(lists.risks)}
            pendingInfos={pendingInfos}
            deliverables={lists.documents.filter((d) => d.kind === 'Livrable').length}
            today={today}
            onPickDomain={setDomain}
            onOpen={setTab}
          />
        )}
        {tab === 'diagnostic' && (
          <Questionnaire
            answers={answers}
            scores={scores}
            domain={domain}
            actions={lists.actions}
            canPlan={admin}
            onAnswer={answer}
            onAddActions={addRecommended}
          />
        )}
        {tab === 'infos' && (
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
        {tab === 'documents' && (
          <Documents documents={lists.documents} infos={lists.infos} role={role} offline={!supabase} onUpload={upload} onOpen={openDoc} onRemove={removeDoc} />
        )}
        {tab === 'actions' && (
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
        {tab === 'registre' && (
          <Register
            records={lists.records}
            readOnly={!admin}
            onAdd={(row) => add('records', [row])}
            onUpdate={(id, patch) => update('records', id, patch)}
            onRemove={(id) => remove('records', id)}
          />
        )}
        {tab === 'risques' && (
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

      {!admin && !mission && (
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
      )}

      <p className="note" style={{ margin: 0 }}>
        {admin
          ? 'Le client voit ce dossier dans son espace : tableau de bord, demandes, documents, plan, registre et risques (en lecture seule).'
          : 'Ces outils accompagnent la mission d’Equimarge ; ils ne constituent pas une consultation juridique.'}
      </p>
    </div>
  );
}
