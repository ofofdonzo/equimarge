'use client';
import { useState } from 'react';
import { Plus } from '@/components/icons';
import { FILE_ACCEPT, INFO_STATUSES } from '@/lib/conformite.mjs';

const STATE = { 'À fournir': 'warn', Fourni: 'none', Validé: 'ok' };
const frDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR');

// Demandes d'informations : Equimarge (admin) les rédige, le client y répond et joint ses documents.
export default function InfoRequests({ items, documents, role, today, onAdd, onUpdate, onRemove, onAnswer, onUpload, onOpenDoc }) {
  const admin = role === 'admin';
  const pending = items.filter((i) => i.status === 'À fournir').length;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Demandes d’informations</h2>
        <span className="row" style={{ gap: 8 }}>
          {pending > 0 && <span className="pill warn">{pending} à fournir</span>}
          {admin && (
            <button className="btn ghost sm" type="button" onClick={() => onAdd({ title: '', details: '', due_date: null, status: 'À fournir', response: '' })}>
              <Plus size={16} />Nouvelle demande
            </button>
          )}
        </span>
      </div>
      <p className="note" style={{ marginTop: 0 }}>
        {admin
          ? 'Ce dont vous avez besoin pour avancer : le client répond ici et joint ses documents.'
          : 'Ce dont Equimarge a besoin pour avancer sur votre dossier. Répondez directement et joignez vos documents.'}
      </p>
      {items.length === 0 ? (
        <div className="empty">
          <p className="note">{admin ? 'Aucune demande envoyée à ce client.' : 'Aucune demande en attente pour le moment.'}</p>
        </div>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {items.map((i) => (
            <InfoCard
              key={i.id}
              item={i}
              admin={admin}
              late={i.status === 'À fournir' && i.due_date && i.due_date < today}
              docs={documents.filter((d) => d.info_request_id === i.id)}
              onUpdate={(patch) => onUpdate(i.id, patch)}
              onRemove={() => onRemove(i.id)}
              onAnswer={(text) => onAnswer(i.id, text)}
              onUpload={(file) => onUpload(file, { requestId: i.id })}
              onOpenDoc={onOpenDoc}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function InfoCard({ item: i, admin, late, docs, onUpdate, onRemove, onAnswer, onUpload, onOpenDoc }) {
  const [reply, setReply] = useState(i.response || '');
  const locked = i.status === 'Validé';

  return (
    <article className="info-card">
      {admin ? (
        <div className="grid2">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor={`t-${i.id}`}>Information ou document demandé</label>
            <input id={`t-${i.id}`} maxLength={300} placeholder="ex. Liste de vos prestataires informatiques" value={i.title} onChange={(e) => onUpdate({ title: e.target.value })} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor={`d-${i.id}`}>Précisions pour le client</label>
            <textarea id={`d-${i.id}`} rows={2} maxLength={2000} value={i.details} onChange={(e) => onUpdate({ details: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor={`due-${i.id}`}>À fournir avant le</label>
            <input id={`due-${i.id}`} type="date" value={i.due_date || ''} onChange={(e) => onUpdate({ due_date: e.target.value || null })} />
          </div>
          <div className="field">
            <label htmlFor={`s-${i.id}`}>Statut</label>
            <select id={`s-${i.id}`} value={i.status} onChange={(e) => onUpdate({ status: e.target.value })}>
              {INFO_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <div className="info-head">
          <div style={{ minWidth: 0 }}>
            <h3>{i.title || 'Demande sans titre'}</h3>
            {i.details && <p className="note">{i.details}</p>}
          </div>
          <span className="row" style={{ gap: 6 }}>
            {i.due_date && <span className="note">Avant le {frDate(i.due_date)}</span>}
            {late && <span className="pill bad">En retard</span>}
            <span className={'pill ' + STATE[i.status]}>{i.status}</span>
          </span>
        </div>
      )}

      <div className="info-answer">
        {admin ? (
          <>
            <span className="mini">Réponse du client</span>
            <p className={i.response ? '' : 'note'}>{i.response || 'Pas encore de réponse.'}</p>
          </>
        ) : (
          <form
            className="stack"
            style={{ gap: 8 }}
            onSubmit={(e) => {
              e.preventDefault();
              onAnswer(reply.trim());
            }}
          >
            <label className="mini" htmlFor={`r-${i.id}`}>Votre réponse</label>
            <textarea id={`r-${i.id}`} rows={3} maxLength={4000} disabled={locked} value={reply} onChange={(e) => setReply(e.target.value)} />
            {!locked && (
              <div className="row">
                <button type="submit" className="btn sm" disabled={!reply.trim() || reply.trim() === i.response}>
                  {i.status === 'Fourni' ? 'Mettre à jour ma réponse' : 'Envoyer ma réponse'}
                </button>
                <label className="btn ghost sm file-btn">
                  Joindre un document
                  <input type="file" accept={FILE_ACCEPT} onChange={(e) => { if (e.target.files[0]) onUpload(e.target.files[0]); e.target.value = ''; }} />
                </label>
              </div>
            )}
          </form>
        )}
        {docs.length > 0 && (
          <ul className="doc-mini">
            {docs.map((d) => (
              <li key={d.id}><button type="button" className="link-btn" onClick={() => onOpenDoc(d)}>{d.name}</button></li>
            ))}
          </ul>
        )}
      </div>

      {admin && (
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="row" style={{ gap: 6 }}>
            <span className={'pill ' + STATE[i.status]}>{i.status}</span>
            {late && <span className="pill bad">En retard</span>}
          </span>
          <button type="button" className="link-btn" onClick={onRemove}>Supprimer la demande</button>
        </div>
      )}
    </article>
  );
}
