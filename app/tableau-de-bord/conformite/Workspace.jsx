'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Download } from '@/components/icons';
import { DOMAINS, domainScores, todayISO } from '@/lib/conformite.mjs';
import Overview from './Overview';
import Questionnaire from './Questionnaire';
import Actions from './Actions';
import Register from './Register';
import Risks from './Risks';
import { downloadWorkbook } from './excel';

const TABS = [
  { key: 'bord', label: 'Tableau de bord' },
  { key: 'diagnostic', label: 'Auto-diagnostic' },
  { key: 'actions', label: 'Plan d’action' },
  { key: 'registre', label: 'Registre RGPD' },
  { key: 'risques', label: 'Risques' },
];

// Table de la base et nombre maximal de lignes (mêmes limites que supabase/schema.sql)
const TABLES = {
  actions: { table: 'compliance_actions', max: 500 },
  records: { table: 'rgpd_records', max: 300 },
  risks: { table: 'compliance_risks', max: 300 },
};

function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export default function Workspace({ userId, email, initial, setupMissing = false }) {
  // Sans compte (aperçu), rien n'est enregistré.
  const supabase = useMemo(() => (userId ? createClient() : null), [userId]);
  const [tab, setTab] = useState('bord');
  const [domain, setDomain] = useState('');
  const [answers, setAnswers] = useState(initial.answers);
  const [lists, setLists] = useState({ actions: initial.actions, records: initial.records, risks: initial.risks });
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
  function end(error) {
    if (error) {
      failure.current = error.message?.includes('limite_de_lignes')
        ? 'Limite de lignes atteinte pour ce compte.'
        : "Échec de l'enregistrement. Vérifiez votre connexion.";
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

  // Cliquer à nouveau sur la réponse choisie l'efface.
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
        ? supabase.from('compliance_answers').upsert({ user_id: userId, question, answer: next, updated_at: new Date().toISOString() })
        : supabase.from('compliance_answers').delete().eq('question', question)
    );
  }

  async function add(kind, rows) {
    const { table, max } = TABLES[kind];
    if (lists[kind].length + rows.length > max) {
      setSaveState(`Limite de ${max} lignes atteinte.`);
      return null;
    }
    const full = rows.map((r) => ({ id: newId(), ...r }));
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

  const saveClass = saveState === 'Enregistré' ? 'save' : saveState === 'Enregistrement…' ? 'save busy' : 'save bad';
  const filtered = (list) => list.filter((x) => !domain || x.domain === domain);

  return (
    <div className="stack">
      <div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="row" style={{ gap: 8, minWidth: 0 }}>
            <span className="eyebrow">Espace conformité</span>
            {email && <span className="note">{email}</span>}
          </span>
          <span className={saveClass} aria-live="polite">{supabase ? saveState : 'Aperçu : rien n’est enregistré'}</span>
        </div>
        <h1>Pilotez votre conformité</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          Évaluez-vous domaine par domaine, suivez votre plan d’action, tenez votre registre RGPD et votre cartographie
          des risques. Tout s’enregistre au fil de la saisie et s’exporte vers Excel.
        </p>
      </div>

      {setupMissing && (
        <p className="err" role="alert">
          Les tables de l’espace conformité n’existent pas encore dans la base : relancez le fichier supabase/schema.sql
          dans Supabase (SQL Editor), puis rechargez la page.
        </p>
      )}

      <div className="ws-bar">
        <div className="tabs" role="tablist" aria-label="Outils de conformité">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" id={`tab-${t.key}`} aria-selected={tab === t.key} aria-controls="ws-panel" onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn ghost sm"
          onClick={() => downloadWorkbook({ answers, actions: lists.actions, records: lists.records, risks: lists.risks })}
        >
          <Download size={16} />Exporter vers Excel
        </button>
      </div>

      {tab !== 'registre' && (
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
            actions={filtered(lists.actions)}
            risks={filtered(lists.risks)}
            today={today}
            onPickDomain={setDomain}
            onOpen={setTab}
          />
        )}
        {tab === 'diagnostic' && (
          <Questionnaire answers={answers} scores={scores} domain={domain} actions={lists.actions} onAnswer={answer} onAddActions={addRecommended} />
        )}
        {tab === 'actions' && (
          <Actions
            actions={lists.actions}
            domain={domain}
            today={today}
            onAdd={(row) => add('actions', [row])}
            onUpdate={(id, patch) => update('actions', id, patch)}
            onRemove={(id) => remove('actions', id)}
          />
        )}
        {tab === 'registre' && (
          <Register
            records={lists.records}
            onAdd={(row) => add('records', [row])}
            onUpdate={(id, patch) => update('records', id, patch)}
            onRemove={(id) => remove('records', id)}
          />
        )}
        {tab === 'risques' && (
          <Risks
            risks={lists.risks}
            domain={domain}
            onAdd={(row) => add('risks', [row])}
            onUpdate={(id, patch) => update('risks', id, patch)}
            onRemove={(id) => remove('risks', id)}
          />
        )}
      </div>

      <p className="note" style={{ margin: 0 }}>
        Ces outils vous aident à organiser votre conformité ; ils ne constituent pas une consultation juridique et ne
        garantissent pas la conformité de votre entreprise.{' '}
        <Link href="/conformite#devis">Être accompagné par Equimarge</Link>
      </p>
    </div>
  );
}
