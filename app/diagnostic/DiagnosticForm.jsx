'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { OFFERS, SECTORS, REVENUE_BANDS } from '@/components/offers';

export default function DiagnosticForm({ userId, defaultEmail }) {
  const [f, setF] = useState({
    offer: 'Essentiel', company: '', siren: '', sector: SECTORS[0], revenue_band: REVENUE_BANDS[0],
    contact_name: '', email: defaultEmail, phone: '', availability: '', message: '', consent: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    const siren = f.siren.replace(/\s/g, '');
    const miss = [];
    if (!f.company.trim()) miss.push('la raison sociale');
    if (siren && !/^\d{9}$/.test(siren)) miss.push('un SIREN à 9 chiffres (ou laissez le champ vide)');
    if (!f.contact_name.trim()) miss.push('votre nom');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) miss.push('un e-mail valide');
    if (!f.consent) miss.push("votre accord sur l'utilisation des données");
    if (miss.length) return setError('Il manque ' + miss.join(', ') + '.');

    setError('');
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from('diagnostic_requests').insert({
      user_id: userId,
      offer: f.offer,
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
    window.scrollTo(0, 0);
  }

  if (done) {
    return (
      <div className="panel success stack">
        <h2 style={{ margin: 0 }}>Demande envoyée</h2>
        <p style={{ margin: 0 }}>
          Merci. Votre demande de diagnostic <b>{f.offer}</b> pour <b>{f.company}</b> est bien enregistrée. Nous vous
          écrivons à {f.email} sous 48 h ouvrées.
        </p>
        {!userId && (
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
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="eyebrow" style={{ marginBottom: 10 }}>1. Formule</legend>
        <div className="grid3">
          {OFFERS.map((o) => (
            <label key={o.id} className={'offer' + (f.offer === o.id ? ' selected' : '')}>
              <input type="radio" name="offer" value={o.id} checked={f.offer === o.id} onChange={set('offer')} />
              <span className="eyebrow">{o.delay}</span>
              <h3>{o.id}</h3>
              <div className="price">{o.price}</div>
              <ul>{o.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="panel stack">
        <span className="eyebrow">2. Votre entreprise</span>
        <div className="grid2">
          <div className="field"><label htmlFor="company">Raison sociale *</label><input id="company" autoComplete="organization" value={f.company} onChange={set('company')} /></div>
          <div className="field"><label htmlFor="siren">SIREN</label><input id="siren" inputMode="numeric" placeholder="9 chiffres" value={f.siren} onChange={set('siren')} /></div>
          <div className="field"><label htmlFor="sector">Secteur</label>
            <select id="sector" value={f.sector} onChange={set('sector')}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="field"><label htmlFor="revenue">Chiffre d'affaires annuel</label>
            <select id="revenue" value={f.revenue_band} onChange={set('revenue_band')}>{REVENUE_BANDS.map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
      </div>

      <div className="panel stack">
        <span className="eyebrow">3. Contact</span>
        <div className="grid2">
          <div className="field"><label htmlFor="name">Nom et prénom *</label><input id="name" autoComplete="name" value={f.contact_name} onChange={set('contact_name')} /></div>
          <div className="field"><label htmlFor="email">E-mail professionnel *</label><input id="email" type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
          <div className="field"><label htmlFor="phone">Téléphone</label><input id="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} /></div>
          <div className="field"><label htmlFor="dispo">Disponibilités</label><input id="dispo" placeholder="ex. mardi matin" value={f.availability} onChange={set('availability')} /></div>
        </div>
        <div className="field">
          <label htmlFor="msg">Qu'attendez-vous du diagnostic ?</label>
          <textarea id="msg" rows={3} maxLength={4000} placeholder="ex. Notre marge baisse depuis 6 mois malgré un CA stable." value={f.message} onChange={set('message')} />
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
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer ma demande'}</button>
          <span className="note">* champs obligatoires</span>
        </div>
      </div>
    </form>
  );
}
