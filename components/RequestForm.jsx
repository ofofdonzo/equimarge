'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { OFFERS, COMPLIANCE, COMPLIANCE_OFFER, SECTORS, REVENUE_BANDS } from '@/components/offers';
import { ArrowRight, Check, Clock, DOMAIN_ICONS } from '@/components/icons';

// Formulaire de demande, commun aux deux pôles :
// kind="diagnostic" : choix d'une formule de diagnostic de marge ;
// kind="conformite" : choix d'un ou plusieurs domaines, devis sur mesure.
export default function RequestForm({ kind, userId, defaultEmail, defaultOffer, defaultTopics = [] }) {
  const compliance = kind === 'conformite';
  const [f, setF] = useState({
    offer: compliance ? COMPLIANCE_OFFER : defaultOffer, topics: defaultTopics,
    company: '', siren: '', sector: SECTORS[0], revenue_band: REVENUE_BANDS[0],
    contact_name: '', email: defaultEmail, phone: '', availability: '', message: '', consent: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const doneRef = useRef(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const toggleTopic = (key) =>
    setF({ ...f, topics: f.topics.includes(key) ? f.topics.filter((t) => t !== key) : [...f.topics, key] });
  const topicNames = COMPLIANCE.filter((d) => f.topics.includes(d.key)).map((d) => d.id);

  // Amène la confirmation à l'écran, même quand le formulaire est en bas de page (/conformite)
  useEffect(() => {
    if (done) doneRef.current?.scrollIntoView({ block: 'center' });
  }, [done]);

  async function submit(e) {
    e.preventDefault();
    const siren = f.siren.replace(/\s/g, '');
    const miss = [];
    if (compliance && topicNames.length === 0) miss.push('au moins un domaine');
    if (!f.company.trim()) miss.push('la raison sociale');
    if (siren && !/^\d{9}$/.test(siren)) miss.push('un SIREN à 9 chiffres (ou laissez le champ vide)');
    if (!f.contact_name.trim()) miss.push('votre nom');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) miss.push('un e-mail valide');
    if (!f.consent) miss.push("votre accord sur l'utilisation des données");
    if (miss.length) return setError('Il manque ' + miss.join(', ') + '.');

    setError('');
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from('diagnostic_requests').insert({
      user_id: userId,
      offer: f.offer,
      // La colonne topics n'est envoyée que pour la conformité (voir supabase/schema.sql)
      ...(compliance && { topics: topicNames }),
      company: f.company.trim(),
      siren: siren || null,
      sector: f.sector,
      revenue_band: f.revenue_band,
      contact_name: f.contact_name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim() || null,
      availability: f.availability.trim() || null,
      message: f.message.trim() || null,
      consent: true,
    });
    setBusy(false);
    if (error) return setError("L'envoi a échoué. Réessayez, ou écrivez directement à contact@equimarge.fr.");
    setDone(true);
  }

  if (done) {
    return (
      <div ref={doneRef} className="panel success stack" style={{ padding: 28 }}>
        <span className="done-icon"><Check size={26} /></span>
        <h2 style={{ margin: 0 }}>Demande envoyée</h2>
        {compliance ? (
          <p style={{ margin: 0 }}>
            Merci. Votre demande de devis pour <b>{f.company}</b> ({topicNames.join(', ')}) est bien enregistrée. Nous vous
            écrivons à {f.email} sous 48&nbsp;h ouvrées.
          </p>
        ) : (
          <p style={{ margin: 0 }}>
            Merci. Votre demande de diagnostic <b>{f.offer}</b> pour <b>{f.company}</b> est bien enregistrée. Nous vous
            écrivons à {f.email} sous 48&nbsp;h ouvrées.
          </p>
        )}
        {!userId && !compliance && (
          <p className="note" style={{ margin: 0 }}>
            En attendant, créez votre espace gratuit pour saisir vos marges : nous gagnerons du temps lors du rendez-vous.{' '}
            <Link href="/connexion?mode=inscription">Créer mon espace</Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="stack" onSubmit={submit} noValidate>
      {compliance ? (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend><span className="step-label"><span className="n">1</span>Domaines concernés</span></legend>
          <div className="grid3 topics">
            {COMPLIANCE.map((d) => {
              const Icon = DOMAIN_ICONS[d.key];
              const on = f.topics.includes(d.key);
              return (
                <label key={d.key} className={'offer topic' + (on ? ' selected' : '')}>
                  <input type="checkbox" name="topics" value={d.key} checked={on} onChange={() => toggleTopic(d.key)} />
                  <span className="topic-icon"><Icon size={20} /></span>
                  <span className="topic-name">{d.id}</span>
                </label>
              );
            })}
          </div>
          <p className="note" style={{ marginBottom: 0 }}>Plusieurs choix possibles. Tarif sur devis, selon votre situation.</p>
        </fieldset>
      ) : (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend><span className="step-label"><span className="n">1</span>Formule</span></legend>
          <div className="grid3">
            {OFFERS.map((o) => (
              <label key={o.id} className={'offer' + (f.offer === o.id ? ' selected' : '')}>
                <input type="radio" name="offer" value={o.id} checked={f.offer === o.id} onChange={set('offer')} />
                <h3>{o.id}</h3>
                <span className="meta"><Clock size={16} />{o.delay}</span>
                <div className="price">{o.price}</div>
                <ul className="checks">{o.items.map((i) => <li key={i}><Check size={16} />{i}</li>)}</ul>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="panel stack">
        <span className="step-label"><span className="n">2</span>Votre entreprise</span>
        <div className="grid2">
          <div className="field"><label htmlFor="company">Raison sociale *</label><input id="company" autoComplete="organization" maxLength={200} value={f.company} onChange={set('company')} /></div>
          <div className="field"><label htmlFor="siren">SIREN</label><input id="siren" inputMode="numeric" placeholder="9 chiffres" value={f.siren} onChange={set('siren')} /></div>
          <div className="field"><label htmlFor="sector">Secteur</label>
            <select id="sector" value={f.sector} onChange={set('sector')}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="field"><label htmlFor="revenue">Chiffre d'affaires annuel</label>
            <select id="revenue" value={f.revenue_band} onChange={set('revenue_band')}>{REVENUE_BANDS.map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
      </div>

      <div className="panel stack">
        <span className="step-label"><span className="n">3</span>Contact</span>
        <div className="grid2">
          <div className="field"><label htmlFor="name">Nom et prénom *</label><input id="name" autoComplete="name" maxLength={200} value={f.contact_name} onChange={set('contact_name')} /></div>
          <div className="field"><label htmlFor="email">E-mail professionnel *</label><input id="email" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
          <div className="field"><label htmlFor="phone">Téléphone</label><input id="phone" type="tel" autoComplete="tel" maxLength={40} value={f.phone} onChange={set('phone')} /></div>
          <div className="field"><label htmlFor="dispo">Disponibilités</label><input id="dispo" placeholder="ex. mardi matin" maxLength={200} value={f.availability} onChange={set('availability')} /></div>
        </div>
        <div className="field">
          <label htmlFor="msg">{compliance ? 'Décrivez votre besoin' : "Qu'attendez-vous du diagnostic ?"}</label>
          <textarea
            id="msg"
            rows={3}
            maxLength={4000}
            placeholder={compliance ? 'ex. Un client grand compte nous demande notre dispositif anticorruption.' : 'ex. Notre marge baisse depuis 6 mois malgré un CA stable.'}
            value={f.message}
            onChange={set('message')}
          />
        </div>
        <label className="check">
          <input id="consent" type="checkbox" checked={f.consent} onChange={set('consent')} />
          <span>
            J'accepte que mes données soient utilisées par Equimarge pour traiter ma demande. Elles ne sont ni cédées ni
            utilisées à d'autres fins (voir la <Link href="/confidentialite">politique de confidentialité</Link>). *
          </span>
        </label>
        {error && <p className="err" role="alert">{error}</p>}
        <div className="row">
          <button className="btn lg" type="submit" disabled={busy}>
            {busy ? 'Envoi…' : <>{compliance ? 'Demander un devis' : 'Envoyer ma demande'} <ArrowRight size={18} /></>}
          </button>
          <span className="note">* champs obligatoires</span>
        </div>
      </div>
    </form>
  );
}
