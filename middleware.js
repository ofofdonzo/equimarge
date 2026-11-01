import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const PROTECTED = ['/tableau-de-bord', '/admin'];

export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (!user && PROTECTED.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    url.searchParams.set('suite', path);
    return NextResponse.redirect(url);
  }

  return response;
}

// Le middleware ne tourne que là où la session sert côté serveur : espaces privés, et formulaires
// qui préremplissent l'e-mail du client connecté. Les autres pages restent statiques.
export const config = {
  matcher: ['/tableau-de-bord/:path*', '/admin/:path*', '/diagnostic', '/conformite', '/automatisation', '/intermediaires-assurance'],
};
