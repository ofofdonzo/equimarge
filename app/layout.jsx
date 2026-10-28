import Link from 'next/link';
import './globals.css';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Equimarge — le suivi de marge des PME',
  description:
    "Suivez la marge de chaque produit, repérez ce qui la fait baisser et commandez un diagnostic réalisé par un spécialiste de l'audit.",
};

export default async function RootLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Public+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <div className="wrap">
          <header className="site-header">
            <Link href="/" className="brand">
              Equi<span>marge</span>
            </Link>
            <nav className="nav" aria-label="Navigation principale">
              <Link href="/diagnostic">Diagnostic</Link>
              {user ? (
                <>
                  <Link href="/tableau-de-bord" className="primary">
                    Mon espace
                  </Link>
                  <form action="/auth/deconnexion" method="post" style={{ display: 'inline' }}>
                    <button className="btn ghost" type="submit" style={{ padding: '6px 12px', borderRadius: 999 }}>
                      Se déconnecter
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/connexion" className="primary">
                  Se connecter
                </Link>
              )}
            </nav>
          </header>

          <main>{children}</main>

          <footer className="site-footer">
            <span>© {new Date().getFullYear()} Equimarge · contact@equimarge.fr</span>
            <span className="row" style={{ gap: 16 }}>
              <Link href="/mentions-legales">Mentions légales</Link>
              <Link href="/confidentialite">Confidentialité</Link>
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
