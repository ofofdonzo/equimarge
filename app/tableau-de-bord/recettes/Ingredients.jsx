'use client';
import { useMemo } from 'react';
import { Plus } from '@/components/icons';
import { MAX_COST, parseNumber, UNITS } from '@/lib/recettes.mjs';
import { INVALID } from './useAutosave';
import { ING_COLS, toIngredient } from './data';
import { fr, pct } from './format';

const MAX_ROWS = 500;
const bad = (raw) => raw !== undefined && parseNumber(raw, { decimals: 4, max: MAX_COST }) === null;

// Matières premières : nom, unité, coût hors taxes par unité, fournisseur, dernière hausse
export default function Ingredients({ ingredients, setIngredients, setItems, usage, increases, supabase, save, onCostSaved }) {
  const rise = useMemo(() => new Map(increases.map((x) => [x.ingredient_id, x])), [increases]);

  function update(id, field, value) {
    const cost = field === 'unit_cost' ? parseNumber(value, { decimals: 4, max: MAX_COST }) : null;
    const valid = field !== 'unit_cost' || cost !== null;
    const next = ingredients.map((i) =>
      i.id === id ? { ...i, ...(valid && { [field]: field === 'unit_cost' ? cost : value }), ['_' + field]: value } : i
    );
    setIngredients(next);
    if (!valid) return save.setState(INVALID);
    const row = next.find((i) => i.id === id);
    save.schedule('i' + id, async () => {
      const res = await supabase
        .from('ingredients')
        .update({ name: row.name, unit: row.unit, unit_cost: row.unit_cost, supplier: row.supplier, cost_source: 'Saisie' })
        .eq('id', id);
      if (!res.error && field === 'unit_cost') onCostSaved();
      return res;
    });
  }

  async function add() {
    if (ingredients.length >= MAX_ROWS) return save.setState(`Limite de ${MAX_ROWS} matières atteinte.`);
    const { data, error } = await save.run(
      () => supabase.from('ingredients').insert({ name: '', unit: 'kg', unit_cost: 0 }).select(ING_COLS).single(),
      "Impossible d'ajouter la matière"
    );
    if (!error) setIngredients((l) => [...l, toIngredient(data)]);
  }

  async function remove(ing) {
    const n = usage.get(ing.id) || 0;
    if (n > 0 && !window.confirm(`${ing.name || 'Cette matière'} est utilisée dans ${n} recette${n > 1 ? 's' : ''}. La supprimer l'en retire aussi. Continuer ?`)) return;
    save.cancel('i' + ing.id);
    const { error } = await save.run(() => supabase.from('ingredients').delete().eq('id', ing.id), 'Suppression impossible');
    if (error) return;
    setIngredients((l) => l.filter((i) => i.id !== ing.id));
    setItems((l) => l.filter((it) => it.ingredient_id !== ing.id));
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Matières premières</h2>
        <button className="btn ghost sm" type="button" onClick={add}><Plus size={16} />Ajouter une matière</button>
      </div>
      {ingredients.length === 0 ? (
        <div className="empty"><p className="note">Lisez une facture ou ajoutez vos matières une par une.</p></div>
      ) : (
        <div className="scroll">
          <table className="tbl-wide">
            <thead>
              <tr><th>Matière</th><th>Unité</th><th>Coût HT par unité</th><th>Fournisseur</th><th>Dernière évolution</th><th></th></tr>
            </thead>
            <tbody>
              {ingredients.map((i) => {
                const r = rise.get(i.id);
                return (
                  <tr key={i.id}>
                    <td><input aria-label="Matière" maxLength={200} value={i.name} onChange={(e) => update(i.id, 'name', e.target.value)} /></td>
                    <td>
                      <select className="cell" aria-label="Unité" value={i.unit} onChange={(e) => update(i.id, 'unit', e.target.value)}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        aria-label={`Coût hors taxes par ${i.unit}`}
                        inputMode="decimal"
                        maxLength={14}
                        aria-invalid={bad(i._unit_cost)}
                        value={i._unit_cost ?? fr(i.unit_cost)}
                        onChange={(e) => update(i.id, 'unit_cost', e.target.value)}
                      />
                    </td>
                    <td><input className="left" aria-label="Fournisseur" maxLength={200} value={i.supplier} onChange={(e) => update(i.id, 'supplier', e.target.value)} /></td>
                    <td className="num">{r ? <span className="up">+{pct(r.change, 1)}</span> : <span className="note">–</span>}</td>
                    <td><button className="del" type="button" aria-label={`Supprimer ${i.name || 'la matière'}`} onClick={() => remove(i)}>×</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="note" style={{ marginBottom: 0 }}>
        Coût hors taxes pour un kilo, un litre ou une pièce. Une hausse de 5 % ou plus depuis le prix précédent est signalée.
      </p>
    </div>
  );
}
