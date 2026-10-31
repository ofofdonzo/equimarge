// Valeurs publiques du projet Supabase, lues dans les variables d'environnement.
// Leur présence est vérifiée au démarrage par next.config.mjs.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
