import { createClient as create } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/config';

// Client Supabase de l'application : la session est gardée dans le stockage local de l'appli (propre à
// l'appli, protégé par iOS) et non dans des cookies. Les règles d'accès de la base sont les mêmes que sur le site.
let client;
export function createClient() {
  if (!client) {
    client = create(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'equimarge-session' },
    });
  }
  return client;
}
