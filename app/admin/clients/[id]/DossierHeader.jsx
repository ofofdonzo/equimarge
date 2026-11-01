'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MISSIONS } from '@/components/offers';
import { ArrowLeft, Check, Copy, Mail } from '@/components/icons';
import { DOSSIER_STATUSES } from '@/lib/conformite.mjs';

const SPACE = '/connexion?mode=inscription&suite=/tableau-de-bord/conformite';

// Fiche du dossier : coordonnées, prestation, statut, demandes d'origine, accès du client, suppression.
export default function DossierHeader({ dossier, requests, documents }) {
  const router = useRouter();
  const [f, setF] = useState({ company: dossier.company, contact_name: dossier.contact_name, email: dossier.email, offer: dossier.offer, status: dossier.status });
  const [state, setState] = useState('');
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  const dirty = ['company', 'contact_name', 'email', 'offer', 'status'].some((k) => f[k] !== dossier[k]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    if (f.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) return setErr('E-mail invalide.');
    setState('busy');
    const { error } = await createClient()
      .from('dossiers')
      .update({ company: f.company.trim(), contact_name: f.contact_name.trim(), email: f.email.trim(), offer: f.offer.trim(), status: f.status })
      .eq('id', dossier.id);
    if (error) {
      setState('');
      return setErr('Modifications non enregistrées : ' + error.message);
    }
    setErr('');
    setState('ok');
    router.refresh();
  }

  // Droit à l'effacement : supprime les fichiers du stockage, puis le dossier et tout son contenu
  async function remove() {
    if (!window.confirm(`Supprimer définitivement le dossier de ${dossier.company || 'ce client'}, ses documents et tout son contenu ?`)) return;
    const supabase = createClient();
    if (documents.length) {
      const { error } = await supabase.storage.from('dossiers').remove(documents.map((d) => d.path));
      if (error) return setErr('Documents non supprimés : ' + error.message);
    }
    const { error } = await supabase.from('dossiers').delete().eq('id', dossier.id);
    if (error) return setErr('Dossier non supprimé : ' + error.message);
    router.push('/admin/clients');
    router.refresh();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin + SPACE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErr('Copie impossible dans ce navigateur.');
    }
  }

  const invite = () => {
    const subject = 'Votre dossier de conformité Equimarge';
    const body = [
      `Bonjour${dossier.contact_name ? ' ' + dossier.contact_name : ''},`,
      '',
      'Votre dossier est ouvert. Vous y trouverez les informations dont j’ai besoin pour avancer, vous pourrez y déposer vos documents et suivre l’avancement de la mission.',
      '',
      `Créez votre espace avec cette adresse e-mail (${dossier.email}) : ${window.location.origin}${SPACE}`,
      '',
      'Bien cordialement,',
      'Equimarge',
    ].join('\n');
    return `mailto:${dossier.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="panel stack" style={{ gap: 16 }}>
      <Link href="/admin/clients" className="link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <ArrowLeft size={16} /> Tous les dossiers
      </Link>
      <div>
        <span className="eyebrow">Dossier client</span>
        <h1 style={{ margin: '4px 0 0' }}>{dossier.company || 'Client sans nom'}</h1>
      </div>

      <form className="stack" style={{ gap: 12 }} onSubmit={save}>
        <div className="grid3">
          <div className="field"><label htmlFor="dh-company">Entreprise</label><input id="dh-company" maxLength={200} value={f.company} onChange={set('company')} /></div>
          <div className="field"><label htmlFor="dh-contact">Contact</label><input id="dh-contact" maxLength={200} value={f.contact_name} onChange={set('contact_name')} /></div>
          <div className="field"><label htmlFor="dh-email">E-mail du client</label><input id="dh-email" type="email" maxLength={320} value={f.email} onChange={set('email')} /></div>
          <div className="field">
            <label htmlFor="dh-offer">Prestation</label>
            <input id="dh-offer" list="dh-missions" maxLength={120} value={f.offer} onChange={set('offer')} />
            <datalist id="dh-missions">{MISSIONS.map((m) => <option key={m} value={m} />)}</datalist>
          </div>
          <div className="field">
            <label htmlFor="dh-status">Statut du dossier</label>
            <select id="dh-status" value={f.status} onChange={set('status')}>
              {DOSSIER_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="row">
          <button type="submit" className="btn sm" disabled={!dirty || state === 'busy'}>Enregistrer la fiche</button>
          {state === 'ok' && !dirty && <span className="save">Enregistré</span>}
          {err && <p className="err" role="alert">{err}</p>}
        </div>
      </form>

      <dl className="facts">
        <div>
          <dt>Accès du client</dt>
          <dd>
            {dossier.client_id
              ? 'Rattaché : le client voit ce dossier dans son espace.'
              : dossier.email
                ? `En attente : le client verra ce dossier en créant son espace avec ${dossier.email}.`
                : 'Ajoutez l’e-mail du client pour qu’il accède au dossier.'}
          </dd>
        </div>
        <div>
          <dt>Demandes d’origine</dt>
          <dd>
            {requests.length === 0
              ? 'Aucune'
              : requests.map((r) => (
                  <Link key={r.id} href={`/admin?demande=${r.id}`} style={{ display: 'block' }}>
                    {r.offer} · {new Date(r.created_at).toLocaleDateString('fr-FR')} · {r.status}
                  </Link>
                ))}
          </dd>
        </div>
      </dl>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="row" style={{ gap: 8 }}>
          {!dossier.client_id && dossier.email && (
            <button type="button" className="btn ghost sm" onClick={() => window.location.assign(invite())}>
              <Mail size={16} /> Inviter le client
            </button>
          )}
          <button type="button" className="btn ghost sm" onClick={copyLink}>
            {copied ? <><Check size={16} /> Lien copié</> : <><Copy size={16} /> Copier le lien de l’espace client</>}
          </button>
        </span>
        <button type="button" className="link-btn" onClick={remove}>Supprimer le dossier</button>
      </div>
    </section>
  );
}
