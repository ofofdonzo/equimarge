import Link from 'next/link';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import AuthNav from '@/components/AuthNav';
import { LogoMark } from '@/components/icons';
import { siteUrl } from '@/lib/site';

// Polices téléchargées au build et servies par le site lui-même : aucune requête vers Google
// et donc aucune adresse IP de visiteur transmise.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700', '800'], display: 'swap', variable: '--font-jakarta' });

const TITLE = 'Equimarge — conformité, marges et automatisation des PME';
const DESCRIPTION =
  'Mise en conformité des PME (procédures internes, RGPD, anti-blanchiment, anticorruption, droit social), diagnostic et suivi de marge gratuit, automatisation des tâches répétitives par agents IA.';

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

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${jakarta.variable}`}>
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
              <Link href="/#marges" className="nav-link hide-xs">
                Marges
              </Link>
              <Link href="/automatisation" className="nav-link">
                <span className="hide-xs">Automatisation</span>
                <span className="show-xs" aria-hidden="true">IA</span>
              </Link>
              <AuthNav />
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
              <p>Conformité, marges et automatisation des PME.</p>
            </div>
            <nav className="footer-links" aria-label="Liens du pied de page">
              <Link href="/conformite">Conformité</Link>
              <Link href="/diagnostic">Diagnostic de marge</Link>
              <Link href="/automatisation">Automatisation IA</Link>
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
