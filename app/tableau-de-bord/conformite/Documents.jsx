'use client';
import { useState } from 'react';
import { Download } from '@/components/icons';
import { FILE_ACCEPT, fileSize } from '@/lib/conformite.mjs';

const frDate = (iso) => new Date(iso).toLocaleDateString('fr-FR');

// Documents du dossier : livrables d'Equimarge et pièces transmises par le client.
// `only` : 'Client' ou 'Livrable' pour n'afficher qu'une des deux listes (espace client sur le site).
export default function Documents({ documents, infos, role, offline, only = null, onUpload, onOpen, onRemove }) {
  const admin = role === 'admin';
  const [kind, setKind] = useState('Livrable');
  const titleOf = (id) => infos.find((i) => i.id === id)?.title;
  const groups = [
    { kind: 'Livrable', title: 'Livrables d’Equimarge', empty: admin ? 'Aucun livrable déposé.' : 'Vos livrables apparaîtront ici dès qu’ils seront prêts.' },
    { kind: 'Client', title: admin ? 'Documents transmis par le client' : 'Vos documents transmis', empty: 'Aucun document transmis.' },
  ].filter((g) => !only || g.kind === only);
  const heading = only === 'Livrable' ? 'Livrables' : only === 'Client' ? 'Documents à déposer' : 'Documents';
  const canUpload = admin || only !== 'Livrable';

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{heading}</h2>
        <span className="row" style={{ gap: 8 }}>
          {admin && (
            <select className="status" aria-label="Type de document" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="Livrable">Livrable</option>
              <option value="Client">Document du client</option>
            </select>
          )}
          {canUpload && <label className={'btn ghost sm file-btn' + (offline ? ' disabled' : '')}>
            {admin ? 'Déposer un document' : 'Transmettre un document'}
            <input
              type="file"
              accept={FILE_ACCEPT}
              disabled={offline}
              onChange={(e) => { if (e.target.files[0]) onUpload(e.target.files[0], { kind: admin ? kind : 'Client' }); e.target.value = ''; }}
            />
          </label>}
        </span>
      </div>
      {only === 'Livrable' ? (
        <p className="note" style={{ marginTop: 0 }}>Les documents préparés par Equimarge pour votre entreprise. Cliquez pour les télécharger.</p>
      ) : (
      <p className="note" style={{ marginTop: 0 }}>
        {only === 'Client' && 'Déposez ici les pièces demandées par Equimarge. '}PDF, Word, Excel, images ou texte, 10 Mo au plus par fichier. Les documents sont conservés dans un espace privé :
        seuls vous et Equimarge y avez accès. Ne transmettez que ce qui est nécessaire à la mission.
      </p>
      )}
      <div className={groups.length > 1 ? 'grid2' : undefined}>
        {groups.map((g) => {
          const list = documents.filter((d) => d.kind === g.kind);
          return (
            <div key={g.kind}>
              <h3 className="mini">{g.title}</h3>
              {list.length === 0 ? (
                <div className="empty"><p className="note">{g.empty}</p></div>
              ) : (
                <ul className="doc-list">
                  {list.map((d) => (
                    <li key={d.id}>
                      <span className="doc-name">
                        <b>{d.name}</b>
                        <span className="note">
                          {frDate(d.created_at)}, {fileSize(d.size)}
                          {d.info_request_id && titleOf(d.info_request_id) ? `, ${titleOf(d.info_request_id)}` : ''}
                        </span>
                      </span>
                      <span className="row" style={{ gap: 4, flexWrap: 'nowrap' }}>
                        <button type="button" className="btn ghost sm" onClick={() => onOpen(d)} aria-label={`Télécharger ${d.name}`}>
                          <Download size={16} />
                        </button>
                        {admin && (
                          <button type="button" className="del" aria-label={`Supprimer ${d.name}`} onClick={() => onRemove(d)}>×</button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
