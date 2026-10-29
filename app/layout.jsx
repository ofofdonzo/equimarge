import Link from 'next/link';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { LogOut, LogoMark } from '@/components/icons';
import CookieConsent, { ManageCookies } from '@/components/CookieConsent';
import { siteUrl } from '@/lib/site';

const TITLE = 'Equimarge — conformité et marges des PME';
const DESCRIPTION =
  'Mise en conformité des PME (procédures internes, RGPD, anti-blanchiment, anticorruption, droit social), diagnostic et suivi de marge gratuit.';

export function generateMetadata() {
  return {
    metadataBase: new URL(siteUrl()),
    title: TITLE,
    description: DESCRIPTION,
    applicationName: 'Equimarge',
    // Aperçu affiché quand le lien est partagé (LinkedIn, WhatsApp, e-mail…) ; l'image est app/opengraph-image.png
    openGraph: { type: 'website', locale: 'fr_FR', siteName: 'Equimarge', title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
    // Code de vérification Google Search Console (méthode « Balise HTML »), à mettre dans Netlify > Environment variables
    verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  };
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F9F7' },
    { media: '(prefers-color-scheme: dark)', color: '#071226' },
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
              <Link href="/conformite" className="nav-link">
                Conformité
              </Link>
              <Link href="/#marges" className="nav-link">
                Marges
              </Link>
              {user ? (
                <>
                  <form action="/auth/deconnexion" method="post" className="logout">
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
              <p>Conformité et marges des PME.</p>
            </div>
            <nav className="footer-links" aria-label="Liens du pied de page">
              <Link href="/conformite">Conformité</Link>
              <Link href="/pre-diagnostic">Pré-diagnostic offert</Link>
              <Link href="/diagnostic">Diagnostic de marge</Link>
              <Link href="/mentions-legales">Mentions légales</Link>
              <Link href="/confidentialite">Confidentialité</Link>
              <a href="mailto:contact@equimarge.fr">contact@equimarge.fr</a>
              <ManageCookies />
            </nav>
          </div>
          <div className="wrap">
            <div className="footer-bottom">© {new Date().getFullYear()} Equimarge</div>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
