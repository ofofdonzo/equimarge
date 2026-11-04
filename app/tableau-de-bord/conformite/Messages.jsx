'use client';
import { useEffect, useRef, useState } from 'react';

const when = (iso) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

// Messagerie du dossier : le client écrit à son consultant, Equimarge répond. Le texte est affiché tel quel
// (aucun lien ni balise interprétés).
export default function Messages({ role, messages, canWrite, onSend }) {
  const admin = role === 'admin';
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  async function submit(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setError('');
    const failure = await onSend(body);
    setBusy(false);
    if (failure) setError(failure);
    else setText('');
  }

  return (
    <section className="panel messages">
      <div className="panel-head">
        <h2>Messages</h2>
      </div>
      <p className="note" style={{ marginTop: 0 }}>
        {admin
          ? 'Échanges avec le client, dans son dossier. Il est prévenu sur son téléphone s’il utilise l’application.'
          : 'Écrivez à votre consultant Equimarge. Réponse en général sous 24 heures ouvrées.'}
      </p>
      <ol className="thread" aria-label="Fil des messages">
        {messages.length === 0 && <li className="note thread-empty">Aucun message pour le moment.</li>}
        {messages.map((m) => {
          const mine = m.from_admin === admin;
          return (
            <li key={m.id} className={'msg ' + (mine ? 'mine' : 'theirs')}>
              <span className="msg-who">{m.from_admin ? 'Equimarge' : admin ? 'Client' : 'Vous'}</span>
              <p className="msg-body">{m.body}</p>
              <span className="msg-time">
                {when(m.created_at)}
                {mine && m.read_at ? ' · Lu' : ''}
              </span>
            </li>
          );
        })}
        <li ref={end} aria-hidden="true" className="thread-end" />
      </ol>
      {canWrite ? (
        <form className="msg-form" onSubmit={submit}>
          <div className="field msg-field">
            <label htmlFor="msg-text" className="sr-only">Votre message</label>
            <textarea
              id="msg-text"
              rows={2}
              maxLength={4000}
              placeholder={admin ? 'Écrire au client…' : 'Écrire à Equimarge…'}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <button type="submit" className="btn" disabled={busy || !text.trim()}>
            {busy ? 'Envoi…' : 'Envoyer'}
          </button>
          {error && <p className="err" role="alert" style={{ flexBasis: '100%', margin: 0 }}>{error}</p>}
        </form>
      ) : (
        <p className="note" style={{ marginBottom: 0 }}>La messagerie s’ouvre dès le début de votre mission avec Equimarge.</p>
      )}
    </section>
  );
}
