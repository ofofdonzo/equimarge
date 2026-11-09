'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Receipt } from '@/components/icons';
import { groupInvoiceLines, matchIngredient, MAX_INVOICE_BYTES } from '@/lib/recettes.mjs';
import { PLAN_NAME, quotaMessage, readsLeft } from '@/lib/abonnement.mjs';
import { dbMessage } from './data';
import { date, eur, num, perUnit } from './format';

const MAX_SIDE = 2000;

// Photo réduite à 2 000 px de côté et réencodée en JPEG : envoi plus rapide, lecture plus rapide,
// et les photos HEIC de l'iPhone deviennent lisibles. Un PDF part tel quel.
async function prepareFile(file) {
  if (!file.type.startsWith('image/')) return file;
  try {
    let source;
    try {
      source = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      source = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    }
    const w = source.width;
    const h = source.height;
    const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    if (source.src) URL.revokeObjectURL(source.src);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    return blob ? new File([blob], 'facture.jpg', { type: 'image/jpeg' }) : file;
  } catch {
    return file;
  }
}

// Lecture d'une facture : envoi, vérification des lignes par le client, puis mise à jour des prix
export default function InvoiceReader({ ingredients, supabase, save, onApplied, quota }) {
  const [phase, setPhase] = useState('idle'); // idle | reading | review | applying | done
  const [error, setError] = useState('');
  // Lectures gratuites du mois (sans abonnement, quand l'abonnement est ouvert)
  const [used, setUsed] = useState(quota?.used || 0);
  const left = quota ? readsLeft({ ...quota, used }) : Infinity;
  const [invoice, setInvoice] = useState(null);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState('');

  const sorted = useMemo(() => [...ingredients].sort((a, b) => a.name.localeCompare(b.name, 'fr')), [ingredients]);
  const kept = rows.filter((r) => r.choice !== 'skip');

  async function read(e) {
    const picked = e.target.files?.[0];
    e.target.value = '';
    if (!picked) return;
    setError('');
    setSummary('');
    setPhase('reading');
    const file = await prepareFile(picked);
    if (file.size > MAX_INVOICE_BYTES) {
      setPhase('idle');
      return setError('Fichier trop lourd : 4 Mo au maximum. Pour un PDF de plusieurs pages, envoyez-le page par page.');
    }
    const body = new FormData();
    body.append('file', file);
    let data;
    try {
      const res = await fetch('/api/factures/lire', { method: 'POST', body });
      data = await res.json().catch(() => ({ error: "La lecture n'a pas abouti. Réessayez." }));
      if (res.status === 402 && quota) setUsed(quota.free);
      if (!res.ok) throw new Error(data.error || "La lecture n'a pas abouti. Réessayez.");
    } catch (err) {
      setPhase('idle');
      return setError(err.message === 'Failed to fetch' ? 'Connexion impossible. Vérifiez votre réseau et réessayez.' : err.message);
    }
    if (!data.lines?.length) {
      setPhase('idle');
      return setError("Aucune ligne de produit n'a été trouvée sur ce document. Essayez une photo plus nette, bien à plat.");
    }
    setUsed((n) => n + 1);
    setInvoice(data);
    setRows(data.lines.map((l, i) => ({ ...l, key: i, choice: matchIngredient(l, ingredients) || 'new', name: l.designation })));
    setPhase('review');
  }

  const setRow = (key, patch) => setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  async function apply() {
    setPhase('applying');
    setError('');
    await save.flush();
    const { updates, creations } = groupInvoiceLines(rows);
    const supplier = invoice.supplier;
    const results = await Promise.all([
      ...updates.map((u) =>
        supabase.from('ingredients').update({ unit_cost: u.unit_cost, cost_source: 'Facture', ...(supplier && { supplier }) }).eq('id', u.id)
      ),
      creations.length
        ? supabase.from('ingredients').insert(creations.map((c) => ({ name: c.name, unit: c.unit, unit_cost: c.unit_cost, supplier, cost_source: 'Facture' })))
        : Promise.resolve({ error: null }),
    ]);
    const updated = results.slice(0, updates.length).filter((r) => !r.error).length;
    const createFailed = Boolean(results[updates.length].error);
    const firstError = results.find((r) => r.error)?.error;
    await supabase.from('invoices').update({ status: 'Appliquée' }).eq('id', invoice.invoice_id);
    await onApplied();
    if (firstError) setError(`Une partie des prix n'a pas été enregistrée : ${dbMessage(firstError)}`);
    const parts = [];
    if (updated > 0) parts.push(`${updated} prix mis à jour`);
    if (creations.length && !createFailed) parts.push(`${creations.length} matière${creations.length > 1 ? 's' : ''} ajoutée${creations.length > 1 ? 's' : ''}`);
    setSummary(parts.length ? parts.join(', ') + '.' : 'Aucun prix modifié.');
    setPhase('done');
  }

  function reset() {
    setPhase('idle');
    setInvoice(null);
    setRows([]);
    setError('');
  }

  const busy = phase === 'reading' || phase === 'applying';

  return (
    <div className={'panel' + (phase === 'done' ? ' success' : '')}>
      <div className="panel-head">
        <h2>Lire une facture fournisseur</h2>
        {(phase === 'idle' || phase === 'done') && left === 0 ? (
          <Link className="btn sm" href="/tableau-de-bord/compte#abonnement">S'abonner à {PLAN_NAME} <ArrowRight size={16} /></Link>
        ) : (phase === 'idle' || phase === 'reading' || phase === 'done') && (
          <label className={'btn sm file-btn' + (busy ? ' disabled' : '')}>
            <Receipt size={16} />
            {phase === 'reading' ? 'Lecture en cours…' : phase === 'done' ? 'Lire une autre facture' : 'Photographier ou choisir'}
            <input type="file" accept="image/*,application/pdf" disabled={busy} onChange={read} aria-label="Facture fournisseur : photo ou PDF" />
          </label>
        )}
      </div>

      <div aria-live="polite">
        {phase === 'idle' && (
          <p className="note" style={{ margin: 0 }}>
            Photo ou PDF d'une facture : Claude relève les produits, les quantités et les prix hors taxes. Vous vérifiez
            chaque ligne avant toute mise à jour. Le fichier n'est pas conservé.
          </p>
        )}
        {phase === 'reading' && <p className="note" style={{ margin: 0 }}>Lecture de la facture, comptez 10 à 40 secondes…</p>}
        {(phase === 'idle' || phase === 'done') && Number.isFinite(left) && (
          <p className="note" style={{ margin: '8px 0 0' }}>
            {left > 0
              ? `${left} lecture${left > 1 ? 's' : ''} gratuite${left > 1 ? 's' : ''} restante${left > 1 ? 's' : ''} ce mois-ci. ${PLAN_NAME} : jusqu'à 300 factures par mois.`
              : quotaMessage(quota.free)}
          </p>
        )}
        {phase === 'done' && (
          <p style={{ margin: 0 }}><Check size={18} style={{ verticalAlign: '-3px', color: 'var(--ok)' }} /> {summary}</p>
        )}
      </div>
      {error && <p className="err" role="alert" style={{ marginTop: 12 }}>{error}</p>}

      {(phase === 'review' || phase === 'applying') && invoice && (
        <div className="stack" style={{ gap: 14 }}>
          <p className="note" style={{ margin: 0 }}>
            {invoice.supplier || 'Fournisseur non lu'}
            {invoice.date && `, facture du ${date(invoice.date)}`}, {rows.length} ligne{rows.length > 1 ? 's' : ''}, {eur(invoice.total)} HT.
            Vérifiez les quantités : le coût par unité en dépend.
          </p>
          <div className="scroll">
            <table className="tbl-wide">
              <thead>
                <tr><th>Ligne de la facture</th><th>Quantité</th><th>Total HT</th><th>Coût HT par unité</th><th>Rattacher à</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const options = sorted.filter((i) => i.unit === r.unit);
                  return (
                    <tr key={r.key} className={r.choice === 'skip' ? 'muted' : undefined}>
                      <td className="cell-text">{r.designation}</td>
                      <td className="num nowrap">{num(r.quantity, 3)} {r.unit}</td>
                      <td className="num nowrap">{eur(r.total)}</td>
                      <td className="num nowrap">{eur(r.unitCost)} {perUnit(r.unit)}</td>
                      <td>
                        <select className="cell" aria-label={`Matière pour ${r.designation}`} value={r.choice} onChange={(e) => setRow(r.key, { choice: e.target.value })}>
                          {options.length > 0 && (
                            <optgroup label={`Mes matières (${r.unit})`}>
                              {options.map((i) => <option key={i.id} value={i.id}>{i.name || 'Sans nom'}</option>)}
                            </optgroup>
                          )}
                          <option value="new">Nouvelle matière</option>
                          <option value="skip">Ignorer cette ligne</option>
                        </select>
                        {r.choice === 'new' && (
                          <input className="left" aria-label="Nom de la nouvelle matière" maxLength={200} value={r.name} onChange={(e) => setRow(r.key, { name: e.target.value })} style={{ marginTop: 6 }} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="row">
            <button className="btn" type="button" disabled={phase === 'applying' || kept.length === 0} onClick={apply}>
              {phase === 'applying' ? 'Mise à jour…' : `Mettre à jour ${kept.length} prix`}
            </button>
            <button className="btn ghost" type="button" disabled={phase === 'applying'} onClick={reset}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
