import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const asked = searchParams.get('suite');
  const suite = asked || '/tableau-de-bord/conformite';
  const safe = suite.startsWith('/') && !suite.startsWith('//') && !suite.startsWith('/\\') ? suite : '/tableau-de-bord/conformite';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Sans page demandée, l'administrateur arrive sur son poste de travail
      if (!asked) {
        const { data: isAdmin } = await supabase.rpc('is_admin');
        if (isAdmin) return NextResponse.redirect(`${origin}/admin`);
      }
      return NextResponse.redirect(`${origin}${safe}`);
    }
  }
  // Lien expiré, déjà utilisé ou incomplet : la page de connexion l'explique
  return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
}
