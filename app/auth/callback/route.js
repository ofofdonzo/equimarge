import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const suite = searchParams.get('suite') || '/tableau-de-bord';
  const safe = suite.startsWith('/') && !suite.startsWith('//') && !suite.startsWith('/\\') ? suite : '/tableau-de-bord';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safe}`);
  }
  // Lien expiré, déjà utilisé ou incomplet : la page de connexion l'explique
  return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
}
