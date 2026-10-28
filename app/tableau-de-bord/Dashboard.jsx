'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Percent, Plus, Receipt, TrendUp, Wallet } from '@/components/icons';

const eur = (n) =>
  Number.isFinite(n) ? n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : '–';
const pct = (n) => (Number.isFinite(n) ? (n * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %' : '–');
const num = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

function Status({ tm }) {
  if (!Number.isFinite(tm)) return null;
  if (tm < 0.2) return <span className="pill bad">Critique</span>;
  if (tm < 0.35) return <span className="pill warn">À surveiller</span>;
  return <span className="pill ok">Saine</span>;
}

export default function Dashboard({ initialProducts, initialSettings, email, userId }) {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState(initialProducts);
  const [settings, setSettings] = useState(initialSettings);
  const [saveState, setSaveState] = useState('Enregistré');
  const timers = useRef({});

  const pending = useRef(0);
  const failed = useRef(false);

  // Enregistrement différé : on attend 600 ms après la dernière frappe.
  // « Enregistré » ne s'affiche qu'une fois toutes les sauvegardes en cours terminées.
  function schedule(key, fn) {
    if (timers.current[key]) clearTimeout(timers.current[key]);
    else pending.current += 1;
    setSaveState('Enregistrement…');
    timers.current[key] = setTimeout(async () => {
      delete timers.current[key];
      const { error } = await fn();
      if (error) failed.current = true;
      pending.current -= 1;
      if (pending.current === 0) {
        setSaveState(failed.current ? "Échec de l'enregistrement, vérifiez votre connexion" : 'Enregistré');
        failed.current = false;
      }
    }, 600);
  }
  function cancel(key) {
    if (!timers.current[key]) return;
    clearTimeout(timers.current[key]);
    delete timers.current[key];
    pending.current -= 1;
    if (pending.current === 0) setSaveState('Enregistré');
  }
  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  // Prévient avant de quitter la page si une saisie n'est pas encore enregistrée
  useEffect(() => {
    const warn = (e) => {
      if (pending.current > 0) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  function updateProduct(id, field, value) {
    const next = products.map((p) => (p.id === id ? { ...p, [field]: field === 'name' ? value : num(value), ['_' + field]: value } : p));
    const row = next.find((p) => p.id === id);
    setProducts(next);
    schedule('p' + id, () =>
      supabase.from('products').update({ name: row.name, price: row.price, cost: row.cost, quantity: row.quantity }).eq('id', id)
    );
  }

  async function addProduct() {
    setSaveState('Enregistrement…');
    const { data, error } = await supabase
      .from('products')
      .insert({ name: '', price: 0, cost: 0, quantity: 0 })
      .select('id,name,price,cost,quantity')
      .single();
    if (error) return setSaveState("Impossible d'ajouter la ligne : " + error.message);
    setProducts((l) => [...l, { ...data, price: 0, cost: 0, quantity: 0 }]);
    setSaveState('Enregistré');
  }

  async function removeProduct(id) {
    const prev = products;
    cancel('p' + id);
    setProducts((l) => l.filter((p) => p.id !== id));
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setProducts(prev);
      setSaveState('Suppression impossible : ' + error.message);
    } else if (pending.current === 0) setSaveState('Enregistré');
  }

  function updateSettings(field, value) {
    const next = { ...settings, [field]: field === 'company' ? value : num(value), ['_' + field]: value };
    setSettings(next);
    schedule('settings', () =>
      supabase.from('settings').upsert({ user_id: userId, company: next.company, fixed_costs: next.fixed_costs, updated_at: new Date().toISOString() })
    );
  }

  const calc = useMemo(() => {
    let CA = 0, CV = 0;
    const lines = products.map((p) => {
      const ca = p.price * p.quantity;
      const cv = p.cost * p.quantity;
      CA += ca;
      CV += cv;
      return { ...p, m: ca - cv, tm: p.price ? (p.price - p.cost) / p.price : NaN };
    });
    const MB = CA - CV;
    const TM = CA ? MB / CA : NaN;
    const F = settings.fixed_costs;
    const SR = TM > 0 ? F / TM : NaN;
    return { lines, CA, MB, TM, F, SR, res: MB - F };
  }, [products, settings]);

  const max = Math.max(1, ...calc.lines.map((l) => Math.abs(l.m)));
  const saveClass = saveState === 'Enregistré' ? 'save' : saveState === 'Enregistrement…' ? 'save busy' : 'save bad';

  return (
    <div className="stack">
      <div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="row" style={{ gap: 8, minWidth: 0 }}>
            <span className="eyebrow">Tableau de bord mensuel</span>
            <span className="note">{email}</span>
            <form action="/auth/deconnexion" method="post">
              <button className="link-btn" type="submit">Se déconnecter</button>
            </form>
          </span>
          <span className={saveClass} aria-live="polite">{saveState}</span>
        </div>
        <h1>{settings.company ? `Les marges de ${settings.company}` : 'Où se fait votre marge'}</h1>
      </div>

      <div className="kpis">
        <div className="kpi"><span className="kpi-icon"><Receipt size={18} /></span><small>Chiffre d'affaires HT</small><b>{eur(calc.CA)}</b></div>
        <div className="kpi"><span className="kpi-icon"><TrendUp size={18} /></span><small>Marge brute</small><b>{eur(calc.MB)}</b></div>
        <div className="kpi"><span className="kpi-icon"><Percent size={18} /></span><small>Taux de marque</small><b>{pct(calc.TM)}</b></div>
        <div className="kpi">
          <span className="kpi-icon"><Wallet size={18} /></span>
          <small>Résultat après charges fixes</small>
          <b className={calc.res < 0 ? 'neg' : undefined}>{eur(calc.res)}</b>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Produits et prestations</h2>
          <button className="btn ghost sm" type="button" onClick={addProduct}><Plus size={16} />Ajouter une ligne</button>
        </div>
        {products.length === 0 ? (
          <div className="empty"><p className="note">Ajoutez votre premier produit ou prestation pour voir sa marge.</p></div>
        ) : (
          <div className="scroll">
            <table className="tbl-wide">
              <thead>
                <tr>
                  <th>Désignation</th><th>Prix de vente HT</th><th>Coût unitaire HT</th><th>Quantité / mois</th>
                  <th>Marge</th><th>Taux de marque</th><th>État</th><th></th>
                </tr>
              </thead>
              <tbody>
                {calc.lines.map((p) => (
                  <tr key={p.id}>
                    <td><input id={`n-${p.id}`} aria-label="Désignation" value={p.name} onChange={(e) => updateProduct(p.id, 'name', e.target.value)} /></td>
                    <td><input id={`p-${p.id}`} aria-label="Prix de vente HT" inputMode="decimal" value={p._price ?? p.price} onChange={(e) => updateProduct(p.id, 'price', e.target.value)} /></td>
                    <td><input id={`c-${p.id}`} aria-label="Coût unitaire HT" inputMode="decimal" value={p._cost ?? p.cost} onChange={(e) => updateProduct(p.id, 'cost', e.target.value)} /></td>
                    <td><input id={`q-${p.id}`} aria-label="Quantité par mois" inputMode="decimal" value={p._quantity ?? p.quantity} onChange={(e) => updateProduct(p.id, 'quantity', e.target.value)} /></td>
                    <td className="num">{eur(p.m)}</td>
                    <td className="num">{pct(p.tm)}</td>
                    <td><Status tm={p.tm} /></td>
                    <td><button className="del" type="button" aria-label={`Supprimer ${p.name || 'la ligne'}`} onClick={() => removeProduct(p.id)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="note" style={{ marginBottom: 0 }}>Repères : taux de marque sous 20 % = critique, entre 20 et 35 % = à surveiller. Ces seuils varient selon le secteur.</p>
      </div>

      <div className="grid2">
        <div className="panel stack">
          <h2>Votre entreprise</h2>
          <div className="field">
            <label htmlFor="company">Raison sociale</label>
            <input id="company" value={settings.company} onChange={(e) => updateSettings('company', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="fixed">Charges fixes mensuelles (€ HT) : loyer, salaires, abonnements</label>
            <input id="fixed" inputMode="decimal" value={settings._fixed_costs ?? settings.fixed_costs} onChange={(e) => updateSettings('fixed_costs', e.target.value)} />
          </div>
          <div className="threshold">
            <span className="eyebrow">Seuil de rentabilité</span>
            <div className="big">
              {Number.isFinite(calc.SR) ? eur(calc.SR) + ' de CA / mois' : '–'}
            </div>
            {Number.isFinite(calc.SR) && calc.CA > 0 && (
              <>
                <div className={'meter' + (calc.CA < calc.SR ? ' short' : '')} aria-hidden="true">
                  <span style={{ width: `${Math.min(1, calc.CA / calc.SR) * 100}%` }} />
                </div>
                <p className="note">
                  {calc.CA >= calc.SR
                    ? `Vous dépassez le seuil de ${eur(calc.CA - calc.SR)} ce mois-ci.`
                    : `Il manque ${eur(calc.SR - calc.CA)} de chiffre d'affaires pour couvrir vos charges.`}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="panel">
          <h2>Marge par ligne</h2>
          <div className="bars">
            {calc.lines.length === 0 && <div className="empty"><p className="note">La répartition apparaîtra ici.</p></div>}
            {calc.lines.map((l) => (
              <div className="bar" key={l.id}>
                <span title={l.name}>{l.name || 'Sans nom'}</span>
                <div className="track"><div className={'fill' + (l.m < 0 ? ' neg' : '')} style={{ width: `${(Math.abs(l.m) / max) * 100}%` }} /></div>
                <span className="v">{eur(l.m)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel callout row" style={{ justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0, flex: '1 1 260px' }}>
          <h2 style={{ marginBottom: 4 }}>Besoin d'un regard extérieur ?</h2>
          <p className="note" style={{ margin: 0 }}>Un diagnostic identifie les postes qui grèvent votre marge et propose un plan d'action.</p>
        </div>
        <Link className="btn" href="/diagnostic">Commander un diagnostic <ArrowRight size={18} /></Link>
      </div>
    </div>
  );
}
