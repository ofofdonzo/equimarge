import Link from 'next/link';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { LogOut, LogoMark } from '@/components/icons';

export const metadata = {
  title: 'Equimarge — le suivi de marge des PME',
  description:
    "Suivez la marge de chaque produit, repérez ce qui la fait baisser et commandez un diagnostic réalisé par un spécialiste de l'audit.",
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F8FB' },
    { media: '(prefers-color-scheme: dark)', color: '#070D12' },
  ],
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="brand">
              <LogoMark id="logo-header" />
              <span className="brand-name">
                Equi<span>marge</span>
              </span>
            </Link>
            <nav className="nav" aria-label="Navigation principale">
              <Link href="/diagnostic" className="nav-link">
                Diagnostic
              </Link>
              {user ? (
                <>
                  <form action="/auth/deconnexion" method="post">
                    <button className="nav-link" type="submit" title="Se déconnecter">
                      <LogOut size={18} />
                      <span className="hide-sm">Se déconnecter</span>
                    </button>
                  </form>
                  <Link href="/tableau-de-bord" className="btn sm">
                    Mon espace
                  </Link>
                </>
              ) : (
                <Link href="/connexion" className="btn sm">
                  Se connecter
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="wrap">{children}</main>

        <footer className="site-footer">
          <div className="wrap footer-inner">
            <div>
              <Link href="/" className="brand">
                <LogoMark id="logo-footer" size={28} />
                <span>
                  Equi<span>marge</span>
                </span>
              </Link>
              <p>Le suivi de marge des PME.</p>
            </div>
            <nav className="footer-links" aria-label="Liens du pied de page">
              <Link href="/diagnostic">Diagnostic</Link>
              <Link href="/mentions-legales">Mentions légales</Link>
              <Link href="/confidentialite">Confidentialité</Link>
              <a href="mailto:contact@equimarge.fr">contact@equimarge.fr</a>
            </nav>
          </div>
          <div className="wrap">
            <div className="footer-bottom">© {new Date().getFullYear()} Equimarge</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
