'use client';
import { Fragment, useMemo, useState } from 'react';
import { Plus } from '@/components/icons';
import { MAX_COST, parseNumber, VAT_RATES } from '@/lib/recettes.mjs';
import { INVALID } from './useAutosave';
import { ITEM_COLS, RECIPE_COLS, toItem, toRecipe } from './data';
import { eur, fr, num, pct, STATUS } from './format';

const MAX_RECIPES = 300;
const MAX_ITEMS = 3000;

// Règles de saisie des champs d'une recette (la base applique les mêmes limites)
const FIELDS = {
  price: (v) => parseNumber(v),
  portions: (v) => {
    const n = parseNumber(v, { max: 99999999.99 });
    return n > 0 ? n : null;
  },
  target: (v) => {
    const n = parseNumber(v, { decimals: 1, max: 99 });
    return n === null ? null : Math.round(n * 10) / 1000;
  },
};
const QTY = (v) => parseNumber(v, { decimals: 4, max: MAX_COST });

function Status({ status }) {
  const [cls, label] = STATUS[status];
  return <span className={`pill ${cls}`}>{label}</span>;
}

export default function RecipeList({ recipes, setRecipes, items, setItems, ingredients, calcs, supabase, save }) {
  const [open, setOpen] = useState(null);
  const sorted = useMemo(() => [...ingredients].sort((a, b) => a.name.localeCompare(b.name, 'fr')), [ingredients]);
  const byId = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);

  function update(id, field, value) {
    const parse = FIELDS[field];
    const parsed = parse ? parse(value) : value;
    const valid = parsed !== null;
    const next = recipes.map((r) => (r.id === id ? { ...r, ...(valid && { [field]: parsed }), ['_' + field]: value } : r));
    setRecipes(next);
    if (!valid) return save.setState(INVALID);
    const r = next.find((x) => x.id === id);
    save.schedule('r' + id, () =>
      supabase.from('recipes').update({ name: r.name, portions: r.portions, price: r.price, vat: r.vat, target: r.target }).eq('id', id)
    );
  }

  async function add() {
    if (recipes.length >= MAX_RECIPES) return save.setState(`Limite de ${MAX_RECIPES} recettes atteinte.`);
    const { data, error } = await save.run(
      () => supabase.from('recipes').insert({ name: '' }).select(RECIPE_COLS).single(),
      "Impossible d'ajouter la recette"
    );
    if (error) return;
    setRecipes((l) => [...l, toRecipe(data)]);
    setOpen(data.id);
  }

  async function remove(r) {
    if (!window.confirm(`Supprimer la recette ${r.name || 'sans nom'} et sa composition ?`)) return;
    save.cancel('r' + r.id);
    const { error } = await save.run(() => supabase.from('recipes').delete().eq('id', r.id), 'Suppression impossible');
    if (error) return;
    setRecipes((l) => l.filter((x) => x.id !== r.id));
    setItems((l) => l.filter((it) => it.recipe_id !== r.id));
  }

  async function addItem(recipe) {
    if (items.length >= MAX_ITEMS) return save.setState(`Limite de ${MAX_ITEMS} lignes de recette atteinte.`);
    const used = new Set(items.filter((it) => it.recipe_id === recipe.id).map((it) => it.ingredient_id));
    const first = sorted.find((i) => !used.has(i.id)) || sorted[0];
    const { data, error } = await save.run(
      () => supabase.from('recipe_items').insert({ recipe_id: recipe.id, ingredient_id: first.id, quantity: 0 }).select(ITEM_COLS).single(),
      "Impossible d'ajouter la matière"
    );
    if (!error) setItems((l) => [...l, toItem(data)]);
  }

  function updateItem(id, field, value) {
    const parsed = field === 'quantity' ? QTY(value) : value;
    const valid = parsed !== null;
    const next = items.map((it) => (it.id === id ? { ...it, ...(valid && { [field]: parsed }), ['_' + field]: value } : it));
    setItems(next);
    if (!valid) return save.setState(INVALID);
    const it = next.find((x) => x.id === id);
    save.schedule('it' + id, () => supabase.from('recipe_items').update({ ingredient_id: it.ingredient_id, quantity: it.quantity }).eq('id', id));
  }

  async function removeItem(id) {
    save.cancel('it' + id);
    const { error } = await save.run(() => supabase.from('recipe_items').delete().eq('id', id), 'Suppression impossible');
    if (!error) setItems((l) => l.filter((it) => it.id !== id));
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Recettes</h2>
        <button className="btn ghost sm" type="button" onClick={add}><Plus size={16} />Ajouter une recette</button>
      </div>
      {recipes.length === 0 ? (
        <div className="empty"><p className="note">Ajoutez votre premier produit : croissant, baguette, entremets, plat du jour…</p></div>
      ) : (
        <div className="scroll">
          <table className="tbl-wide">
            <thead>
              <tr>
                <th>Recette</th><th>Prix affiché TTC</th><th>Coût matière / pièce</th><th>Taux de marque</th>
                <th>État</th><th>Prix conseillé TTC</th><th></th>
              </tr>
            </thead>
            <tbody>
              {recipes.map((r) => {
                const c = calcs.get(r.id);
                const isOpen = open === r.id;
                const lines = c.lines;
                return (
                  <Fragment key={r.id}>
                    <tr>
                      <td><input aria-label="Nom de la recette" maxLength={200} value={r.name} onChange={(e) => update(r.id, 'name', e.target.value)} /></td>
                      <td>
                        <input aria-label="Prix affiché TTC d'une pièce" inputMode="decimal" maxLength={14} aria-invalid={r._price !== undefined && FIELDS.price(r._price) === null} value={r._price ?? fr(r.price)} onChange={(e) => update(r.id, 'price', e.target.value)} />
                      </td>
                      <td className="num">{c.unitCost > 0 ? eur(c.unitCost) : '–'}</td>
                      <td className="num">{pct(c.rate)}</td>
                      <td><Status status={c.status} /></td>
                      <td className="num">{Number.isFinite(c.suggested) ? eur(c.suggested) : '–'}</td>
                      <td className="nowrap">
                        <button className="link-btn" type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : r.id)}>
                          {isOpen ? 'Fermer' : 'Composer'}
                        </button>{' '}
                        <button className="del" type="button" aria-label={`Supprimer ${r.name || 'la recette'}`} onClick={() => remove(r)}>×</button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="detail">
                        <td colSpan={7}>
                          <div className="recipe-detail">
                            <div className="fields">
                              <div className="field">
                                <label htmlFor={`portions-${r.id}`}>Pièces par fournée</label>
                                <input id={`portions-${r.id}`} inputMode="decimal" maxLength={12} aria-invalid={r._portions !== undefined && FIELDS.portions(r._portions) === null} value={r._portions ?? fr(r.portions)} onChange={(e) => update(r.id, 'portions', e.target.value)} />
                              </div>
                              <div className="field">
                                <label htmlFor={`vat-${r.id}`}>TVA</label>
                                <select id={`vat-${r.id}`} value={r.vat} onChange={(e) => update(r.id, 'vat', +e.target.value)}>
                                  {VAT_RATES.map((v) => <option key={v} value={v}>{num(v, 1)} %</option>)}
                                </select>
                              </div>
                              <div className="field">
                                <label htmlFor={`target-${r.id}`}>Taux de marque visé (%)</label>
                                <input id={`target-${r.id}`} inputMode="decimal" maxLength={5} aria-invalid={r._target !== undefined && FIELDS.target(r._target) === null} value={r._target ?? num(r.target * 100, 1)} onChange={(e) => update(r.id, 'target', e.target.value)} />
                              </div>
                            </div>

                            {ingredients.length === 0 ? (
                              <p className="note" style={{ margin: 0 }}>Ajoutez d'abord vos matières premières (plus bas) ou lisez une facture.</p>
                            ) : (
                              <>
                                {lines.length > 0 && (
                                  <div className="scroll">
                                    <table className="tbl-items">
                                      <thead><tr><th>Matière</th><th>Quantité pour la fournée</th><th>Coût HT</th><th></th></tr></thead>
                                      <tbody>
                                        {lines.map((it) => {
                                          const ing = byId.get(it.ingredient_id);
                                          return (
                                            <tr key={it.id}>
                                              <td>
                                                <select className="cell" aria-label="Matière" value={it.ingredient_id} onChange={(e) => updateItem(it.id, 'ingredient_id', e.target.value)}>
                                                  {sorted.map((i) => <option key={i.id} value={i.id}>{i.name || 'Sans nom'} ({i.unit})</option>)}
                                                </select>
                                              </td>
                                              <td>
                                                <span className="qty">
                                                  <input aria-label={`Quantité en ${ing?.unit || 'unité'}`} inputMode="decimal" maxLength={14} aria-invalid={it._quantity !== undefined && QTY(it._quantity) === null} value={it._quantity ?? fr(it.quantity)} onChange={(e) => updateItem(it.id, 'quantity', e.target.value)} />
                                                  <span>{ing?.unit}</span>
                                                </span>
                                              </td>
                                              <td className="num">{ing?.unit_cost > 0 ? eur(it.cost) : <span className="note">prix à saisir</span>}</td>
                                              <td><button className="del" type="button" aria-label={`Retirer ${ing?.name || 'la matière'}`} onClick={() => removeItem(it.id)}>×</button></td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                                <div className="row">
                                  <button className="btn ghost sm" type="button" onClick={() => addItem(r)}><Plus size={16} />Ajouter une matière</button>
                                </div>
                              </>
                            )}

                            <p className="note" style={{ margin: 0 }}>
                              Fournée : {eur(c.batch)} HT de matières, soit {eur(c.unitCost)} par pièce
                              {Number.isFinite(c.coef) && `, prix HT ${eur(c.priceHT)}, coefficient ×${num(c.coef, 1)}`}
                              {c.missing > 0 && `, ${c.missing} matière${c.missing > 1 ? 's' : ''} sans prix ou sans quantité`}.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="note" style={{ marginBottom: 0 }}>
        Prix conseillé : coût matière divisé par (1 − taux visé), TVA comprise, arrondi aux 5 centimes supérieurs.
      </p>
    </div>
  );
}
