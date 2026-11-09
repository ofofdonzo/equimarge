'use client';
import { Fragment } from 'react';
import { Alert, ArrowRight, Calendar, Mail, Shield } from '@/components/icons';
import { actionStats, domainLabel, globalScore, isLate, riskLevel, scoreLevel } from '@/lib/conformite.mjs';

const pct = (v) => (v === null || v === undefined ? '–' : `${Math.round(v * 100)} %`);
const frDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR');

// Couleur de chaque statut d'action : toujours accompagnée de son libellé dans la légende.
const STATUS_CLASS = { 'À faire': 's-todo', 'En cours': 's-doing', 'Terminé': 's-done' };
const LEVELS = [
  { state: 'ok', label: 'Faible (1 à 6)' },
  { state: 'warn', label: 'Moyen (8 à 12)' },
  { state: 'bad', label: 'Élevé (15 à 25)' },
];

// Tableau de bord du dossier : seuls les éléments qui ont du contenu s'affichent, en commençant par ce que
// le client doit fournir. Un dossier qui démarre reste donc court et lisible.
export default function Overview({ role, scores, domain, actions, risks, infos = [], deliverables = 0, today, onPickDomain, onOpen }) {
  const admin = role === 'admin';
  const shown = domain ? scores.filter((s) => s.key === domain) : scores;
  const evaluated = shown.filter((s) => s.score !== null);
  const score = domain ? shown[0]?.score ?? null : globalScore(scores);
  const level = scoreLevel(score);
  const st = actionStats(actions, today);
  const openRisks = risks.filter((r) => r.status !== 'Maîtrisé');
  const highRisks = openRisks.filter((r) => riskLevel(r.probability, r.impact).state === 'bad').length;
  const pending = infos.filter((i) => i.status === 'À fournir');
  const toRead = infos.filter((i) => i.status === 'Fourni').length;
  const upcoming = actions
    .filter((a) => a.status !== 'Terminé')
    .sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'))
    .slice(0, 5);
  const counts = {};
  for (const r of openRisks) counts[`${r.probability}-${r.impact}`] = (counts[`${r.probability}-${r.impact}`] || 0) + 1;

  const kpis = [
    evaluated.length > 0 && (
      <div key="score" className="kpi">
        <span className="kpi-icon"><Shield size={18} /></span>
        <small>{domain ? `Score ${domainLabel(domain)}` : 'Score de conformité'}</small>
        <b>{pct(score)}</b>
        <span className={'pill ' + level.state}>{level.label}</span>
      </div>
    ),
    // Côté client, les demandes en attente sont déjà listées juste au-dessus
    (admin || pending.length === 0) && (
    <div key="infos" className="kpi">
      <span className="kpi-icon"><Mail size={18} /></span>
      <small>{admin ? 'Informations attendues' : 'Informations à fournir'}</small>
      <b className={pending.length && !admin ? 'neg' : undefined}>{pending.length}</b>
      {admin && toRead > 0 ? (
        <span className="pill warn">{toRead} réponse{toRead > 1 ? 's' : ''} à lire</span>
      ) : (
        <span className="note">{deliverables ? `${deliverables} livrable${deliverables > 1 ? 's' : ''} déposé${deliverables > 1 ? 's' : ''}` : 'Aucun livrable pour l’instant'}</span>
      )}
    </div>
    ),
    st.total > 0 && (
      <div key="actions" className="kpi">
        <span className="kpi-icon"><Calendar size={18} /></span>
        <small>Actions ouvertes</small>
        <b>{st.open}</b>
        <span className={st.late ? 'pill bad' : 'note'}>{st.late ? `${st.late} en retard` : 'Aucune en retard'}</span>
      </div>
    ),
    openRisks.length > 0 && (
      <div key="risks" className="kpi">
        <span className="kpi-icon"><Alert size={18} /></span>
        <small>Risques élevés ouverts</small>
        <b className={highRisks ? 'neg' : undefined}>{highRisks}</b>
        <span className="note">sur {openRisks.length} risque{openRisks.length > 1 ? 's' : ''} ouvert{openRisks.length > 1 ? 's' : ''}</span>
      </div>
    ),
  ].filter(Boolean);

  const scorePanel = evaluated.length > 0 && (
    <section className="panel">
      <div className="panel-head">
        <h2>Score par domaine</h2>
        <span className="note">Cliquez pour filtrer</span>
      </div>
      <div className="bars">
        {evaluated.map((s) => {
          const l = scoreLevel(s.score);
          return (
            <button
              key={s.key}
              type="button"
              className="bar score-row"
              aria-pressed={domain === s.key}
              title={`${s.label} : ${pct(s.score)}, ${s.answered} réponse(s) sur ${s.total}`}
              onClick={() => onPickDomain(domain === s.key ? '' : s.key)}
            >
              <span>{s.label}</span>
              <span className="track"><span className="fill" style={{ width: `${s.score * 100}%` }} /></span>
              <span className="v">{pct(s.score)}</span>
              <span className={'pill ' + l.state}>{l.label}</span>
            </button>
          );
        })}
      </div>
      {!domain && evaluated.length < scores.length && (
        <p className="note" style={{ marginBottom: 0 }}>
          {scores.length - evaluated.length} domaine{scores.length - evaluated.length > 1 ? 's' : ''} pas encore évalué
          {scores.length - evaluated.length > 1 ? 's' : ''}.{' '}
          <button type="button" className="link-btn" onClick={() => onOpen('diagnostic')}>Compléter l’auto-diagnostic</button>
        </p>
      )}
    </section>
  );

  const planPanel = st.total > 0 && (
    <section className="panel">
      <h2>Avancement du plan d’action</h2>
      <div className="stackbar" role="img" aria-label={Object.entries(st.byStatus).map(([k, n]) => `${k} : ${n}`).join(', ')}>
        {Object.entries(st.byStatus).map(([k, n]) =>
          n ? <span key={k} className={STATUS_CLASS[k]} style={{ flexGrow: n }} title={`${k} : ${n} action(s)`} /> : null
        )}
      </div>
      <ul className="legend">
        {Object.entries(st.byStatus).map(([k, n]) => (
          <li key={k}><i className={STATUS_CLASS[k]} />{k} <b>{n}</b></li>
        ))}
      </ul>
      <p className="note" style={{ marginBottom: 0 }}>
        {Math.round((st.byStatus['Terminé'] / st.total) * 100)}&nbsp;% des actions terminées{st.late ? `, ${st.late} en retard.` : '.'}
      </p>
    </section>
  );

  const riskPanel = openRisks.length > 0 && (
    <section className="panel">
      <div className="panel-head">
        <h2>Cartographie des risques ouverts</h2>
        <button type="button" className="link-btn" onClick={() => onOpen('risques')}>Voir les risques</button>
      </div>
      <div className="heat-wrap">
        <span className="heat-y">Probabilité</span>
        <div className="heat" role="img" aria-label={`${openRisks.length} risques ouverts, dont ${highRisks} de niveau élevé`}>
          {[5, 4, 3, 2, 1].map((p) => (
            <Fragment key={p}>
              <span className="ax">{p}</span>
              {[1, 2, 3, 4, 5].map((i) => {
                const n = counts[`${p}-${i}`] || 0;
                const l = riskLevel(p, i);
                return (
                  <span key={i} className={`cell z-${l.state}${n ? ' has' : ''}`} title={`Probabilité ${p} × impact ${i} = ${l.score} (${l.label}) : ${n} risque(s)`}>
                    {n || ''}
                  </span>
                );
              })}
            </Fragment>
          ))}
          <span />
          {[1, 2, 3, 4, 5].map((i) => <span key={i} className="ax">{i}</span>)}
        </div>
        <span className="heat-x">Impact</span>
      </div>
      <ul className="legend">
        {LEVELS.map((l) => <li key={l.state}><i className={'z-' + l.state} />{l.label}</li>)}
      </ul>
    </section>
  );

  const duePanel = upcoming.length > 0 && (
    <section className="panel">
      <div className="panel-head">
        <h2>Prochaines échéances</h2>
        <button type="button" className="link-btn" onClick={() => onOpen('actions')}>Voir le plan d’action</button>
      </div>
      <ul className="due-list">
        {upcoming.map((a) => (
          <li key={a.id}>
            <span className="due-date">{a.due_date ? frDate(a.due_date) : 'Sans date'}</span>
            <span className="due-title">
              <b>{a.title || 'Action sans titre'}</b>
              <span className="note">{domainLabel(a.domain)}, {a.status}</span>
            </span>
            {isLate(a, today) && <span className="pill bad">En retard</span>}
          </li>
        ))}
      </ul>
    </section>
  );

  // Ce que le client doit fournir passe en premier ; un dossier qui démarre l'explique simplement.
  const nextPanel = !admin && pending.length > 0 && (
    <section className="panel callout">
      <div className="panel-head">
        <h2>À fournir de votre côté</h2>
        <button type="button" className="btn sm" onClick={() => onOpen('infos')}>Répondre <ArrowRight size={16} /></button>
      </div>
      <ul className="due-list">
        {pending.slice(0, 5).map((i) => (
          <li key={i.id}>
            <span className="due-date">{i.due_date ? frDate(i.due_date) : ''}</span>
            <span className="due-title"><b>{i.title || 'Demande d’information'}</b></span>
            {i.due_date && i.due_date < today && <span className="pill bad">En retard</span>}
          </li>
        ))}
      </ul>
    </section>
  );
  const startPanel = !scorePanel && !planPanel && !riskPanel && !duePanel && (
    <div className="empty">
      <p className="note">
        {admin
          ? 'Le tableau de bord se remplit avec l’auto-diagnostic, le plan d’action et les risques du dossier.'
          : 'Equimarge prépare votre plan d’action. Il apparaîtra ici, avec vos échéances et l’avancement de la mission.'}
      </p>
    </div>
  );
  const pair = (a, b) => (a && b ? <div className="grid2">{a}{b}</div> : a || b || null);

  return (
    <div className="stack">
      {nextPanel}
      {kpis.length > 0 && <div className="kpis">{kpis}</div>}
      {pair(scorePanel, planPanel)}
      {pair(riskPanel, duePanel)}
      {startPanel}
    </div>
  );
}
