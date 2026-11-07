// Lecture des données du module « Recettes », commune à la page (serveur) et au rechargement (navigateur).
// Les colonnes numeric arrivent parfois en texte : elles sont converties en nombres ici.

export const ING_COLS = 'id,name,unit,unit_cost,supplier';
export const RECIPE_COLS = 'id,name,portions,price,vat,target';
export const ITEM_COLS = 'id,recipe_id,ingredient_id,quantity';
const HISTORY_COLS = 'ingredient_id,unit_cost,source,created_at';

export const toIngredient = (r) => ({ ...r, unit_cost: +r.unit_cost, supplier: r.supplier || '' });
export const toRecipe = (r) => ({ ...r, portions: +r.portions, price: +r.price, vat: +r.vat, target: +r.target });
export const toItem = (r) => ({ ...r, quantity: +r.quantity });
const toHistory = (r) => ({ ...r, unit_cost: +r.unit_cost });

export async function loadHistory(supabase) {
  const { data, error } = await supabase.from('ingredient_price_changes').select(HISTORY_COLS).limit(1000);
  return { error, history: (data || []).map(toHistory) };
}

export async function loadIngredients(supabase) {
  const { data, error } = await supabase.from('ingredients').select(ING_COLS).order('created_at').limit(500);
  return { error, ingredients: (data || []).map(toIngredient) };
}

export async function loadRecettes(supabase) {
  const [i, r, it, h] = await Promise.all([
    loadIngredients(supabase),
    supabase.from('recipes').select(RECIPE_COLS).order('created_at').limit(300),
    supabase.from('recipe_items').select(ITEM_COLS).order('created_at').limit(3000),
    loadHistory(supabase),
  ]);
  return {
    error: i.error || r.error || it.error || h.error,
    ingredients: i.ingredients,
    recipes: (r.data || []).map(toRecipe),
    items: (it.data || []).map(toItem),
    history: h.history,
  };
}

// Message lisible pour une erreur de la base (limite de lignes, valeur refusée…)
export function dbMessage(error) {
  if (!error) return '';
  if (error.message?.includes('limite_de_lignes')) return `Limite atteinte (${error.hint || 'nombre maximal de lignes'}).`;
  return error.message || 'erreur inconnue';
}
