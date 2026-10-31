import { AGENTS } from '@/components/agents';
import { Bot, Clock, External } from '@/components/icons';

// Liste des agents IA, rendue sur le serveur et envoyée seulement à l'administrateur connecté :
// elle n'apparaît dans aucun fichier public du site.
export default function Agents() {
  return (
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
  );
}
