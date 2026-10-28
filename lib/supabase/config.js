// Valeurs publiques du projet Supabase (elles sont de toute façon visibles dans le navigateur).
// Les variables d'environnement, si elles sont définies, sont prioritaires.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fiqmbjjfxeyyaiilqmgc.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpcW1iampmeGV5eWFpaWxxbWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxOTM3MDMsImV4cCI6MjEwODc2OTcwM30.n3_eQzRIvqMOchck7Ih67Rw6diwnk9Bz0C9wLXVgWMo';
