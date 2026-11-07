'use client';
import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Alert, Percent, Receipt, TrendUp } from '@/components/icons';
import { priceIncreases, recipeCost } from '@/lib/recettes.mjs';
import useAutosave, { SAVED, SAVING } from './useAutosave';
import { loadHistory, loadIngredients } from './data';
import { eur, perUnit, pct } from './format';
import InvoiceReader from './InvoiceReader';
import RecipeList from './RecipeList';
import Ingredients from './Ingredients';

const MAX_ALERTS = 6;

export default function Recettes({ initial, quota }) {
  const supabase = useMemo(() => createClient(), []);
  const save = useAutosave();
  const [ingredients, setIngredients] = useState(initial.ingredients);
  const [recipes, setRecipes] = useState(initial.recipes);
  const [items, setItems] = useState(initial.items);
  const [history, setHistory] = useState(initial.history);

  const byId = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);
  const calcs = useMemo(
    () => new Map(recipes.map((r) => [r.id, recipeCost(r, items.filter((it) => it.recipe_id === r.id), byId)])),
    [recipes, items, byId]
  );
  const usage = useMemo(() => {
    const m = new Map();
    for (const it of items) m.set(it.ingredient_id, (m.get(it.ingredient_id) || 0) + 1);
    return m;
  }, [items]);
  const increases = useMemo(() => priceIncreases(history).filter((x) => byId.has(x.ingredient_id)), [history, byId]);

  // L'historique des prix est tenu par la base : on le relit après chaque changement de coût
  const refreshHistory = useCallback(async () => {
    const { error, history: h } = await loadHistory(supabase);
    if (!error) setHistory(h);
  }, [supabase]);

  async function afterInvoice() {
    const [{ error, ingredients: list }] = await Promise.all([loadIngredients(supabase), refreshHistory()]);
    if (!error) setIngredients(list);
  }

  const under = recipes.filter((r) => ['bad', 'warn'].includes(calcs.get(r.id).status));
  const rates = [...calcs.values()].map((c) => c.rate).filter(Number.isFinite);
  const avgRate = rates.length ? rates.reduce((s, r) => s + r, 0) / rates.length : NaN;
  const saveClass = save.state === SAVED ? 'save' : save.state === SAVING ? 'save busy' : 'save bad';
  const empty = ingredients.length === 0 && recipes.length === 0;

  return (
    <div className="stack">
      <div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="eyebrow">Recettes et coût matière</span>
          {!empty && <span className={saveClass} aria-live="polite">{save.state}</span>}
        </div>
        <h1>Ce que vous rapporte chaque produit</h1>
        <p className="lead" style={{ margin: 0 }}>
          Vos factures fournisseurs mettent à jour le coût de vos matières ; chaque recette vous dit si son prix suit.
        </p>
      </div>

      {empty ? (
        <div className="panel">
          <h2>Pour commencer</h2>
          <ol className="steps-list">
            <li><b>Lisez une facture fournisseur</b> ci-dessous (photo ou PDF) : vos matières premières et leurs prix sont créés en un clic.</li>
            <li><b>Composez vos recettes</b> : quantités pour une fournée, nombre de pièces et prix affiché.</li>
            <li><b>Suivez vos marges</b> : à chaque nouvelle facture, les produits qui ne rapportent plus assez sont signalés, avec un prix conseillé.</li>
          </ol>
        </div>
      ) : (
        <div className="kpis kpis3">
          <div className="kpi"><span className="kpi-icon"><Receipt size={18} /></span><small>Recettes suivies</small><b>{recipes.length}</b></div>
          <div className="kpi"><span className="kpi-icon"><Percent size={18} /></span><small>Taux de marque matière moyen</small><b>{pct(avgRate)}</b></div>
          <div className="kpi">
            <span className="kpi-icon"><TrendUp size={18} /></span>
            <small>Recettes sous l'objectif</small>
            <b className={under.length ? 'neg' : undefined}>{under.length}</b>
          </div>
        </div>
      )}

      {(under.length > 0 || increases.length > 0) && (
        <div className="panel">
          <h2>À regarder</h2>
          <ul className="alert-list">
            {under.slice(0, MAX_ALERTS).map((r) => {
              const c = calcs.get(r.id);
              return (
                <li key={r.id} className={c.status}>
                  <Alert size={18} />
                  <span>
                    <b>{r.name || 'Recette sans nom'}</b> : taux de marque matière de {pct(c.rate)} pour un objectif de {pct(r.target)}.
                    {Number.isFinite(c.suggested) && ` Prix conseillé : ${eur(c.suggested)} au lieu de ${eur(r.price)}.`}
                  </span>
                </li>
              );
            })}
            {increases.slice(0, MAX_ALERTS).map((x) => {
              const ing = byId.get(x.ingredient_id);
              const n = usage.get(x.ingredient_id) || 0;
              return (
                <li key={x.ingredient_id}>
                  <TrendUp size={18} />
                  <span>
                    <b>{ing.name || 'Matière sans nom'}</b> : +{pct(x.change, 1)} ({eur(x.previous)} → {eur(x.current)} {perUnit(ing.unit)})
                    {n > 0 ? `, utilisée dans ${n} recette${n > 1 ? 's' : ''}.` : '.'}
                  </span>
                </li>
              );
            })}
          </ul>
          {(under.length > MAX_ALERTS || increases.length > MAX_ALERTS) && (
            <p className="note" style={{ marginBottom: 0 }}>Les autres apparaissent dans les tableaux ci-dessous.</p>
          )}
        </div>
      )}

      <InvoiceReader ingredients={ingredients} supabase={supabase} save={save} onApplied={afterInvoice} quota={quota} />

      <RecipeList
        recipes={recipes}
        setRecipes={setRecipes}
        items={items}
        setItems={setItems}
        ingredients={ingredients}
        calcs={calcs}
        supabase={supabase}
        save={save}
      />

      <Ingredients
        ingredients={ingredients}
        setIngredients={setIngredients}
        setItems={setItems}
        usage={usage}
        increases={increases}
        supabase={supabase}
        save={save}
        onCostSaved={refreshHistory}
      />

      <p className="note">
        Le taux de marque matière compare le prix de vente hors taxes au seul coût des matières premières : main-d'œuvre,
        énergie et loyer viennent en plus. Le{' '}
        <Link href="/tableau-de-bord">suivi de marge</Link> les prend en compte avec vos charges fixes.
      </p>
    </div>
  );
}
