'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Pixel Meta (Facebook, Instagram) : mesure des visites et des demandes venues des publicités.
// Il n'est chargé qu'après l'accord du visiteur (exigence CNIL). Sans NEXT_PUBLIC_META_PIXEL_ID : ni pixel ni bandeau.
const PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID || '').trim();
const KEY = 'equimarge-cookies';
const MAX_AGE = 182 * 24 * 3600 * 1000; // le choix est redemandé au bout de 6 mois (recommandation CNIL)
const OPEN_EVENT = 'equimarge:cookies';

// true (accepté), false (refusé) ou null (pas encore de choix, ou choix expiré)
function readChoice() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY));
    if (c && Date.now() - c.at < MAX_AGE) return c.ads === true;
  } catch {}
  return null;
}

function saveChoice(ads) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ads, at: Date.now() }));
  } catch {}
}

// Version lisible du code d'installation fourni par Meta
function loadPixel() {
  if (!window.fbq) {
    const fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    // Pas de suivi automatique des clics ni du contenu des pages : seulement les visites et les demandes envoyées
    fbq('set', 'autoConfig', false, PIXEL_ID);
    fbq('init', PIXEL_ID);
  }
  window.fbq('consent', 'grant');
}

// Retrait de l'accord : le pixel cesse d'envoyer et ses cookies sont effacés
function unloadPixel() {
  if (window.fbq) window.fbq('consent', 'revoke');
  const host = location.hostname;
  const domains = ['', host, host.split('.').slice(-2).join('.')];
  for (const name of ['_fbp', '_fbc']) {
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? '; domain=' + d : ''}`;
  }
}

function Banner() {
  const pathname = usePathname();
  const [ads, setAds] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = readChoice();
    setAds(choice);
    setOpen(choice === null);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  // Une visite comptée à chaque changement de page, une fois l'accord donné
  useEffect(() => {
    if (!ads) return;
    loadPixel();
    window.fbq('track', 'PageView');
  }, [ads, pathname]);

  function decide(value) {
    saveChoice(value);
    if (!value) unloadPixel();
    setAds(value);
    setOpen(false);
  }

  if (!open) return null;
  return (
    <section className="consent" aria-label="Cookies publicitaires">
      <p>
        <b>Cookies publicitaires.</b> Avec votre accord, nous utilisons le pixel Meta (Facebook, Instagram) pour mesurer
        l'efficacité de nos publicités. Il dépose des cookies et transmet à Meta des données sur votre visite. Vous pouvez
        changer d'avis à tout moment (« Gérer les cookies », en bas de page).{' '}
        <Link href="/confidentialite#cookies">En savoir plus</Link>
      </p>
      <div className="row">
        <button type="button" className="btn sm" onClick={() => decide(false)}>Refuser</button>
        <button type="button" className="btn sm" onClick={() => decide(true)}>Accepter</button>
      </div>
    </section>
  );
}

export default function CookieConsent() {
  return PIXEL_ID ? <Banner /> : null;
}

// Lien du pied de page pour revoir son choix (affiché seulement si le pixel est configuré)
export function ManageCookies() {
  if (!PIXEL_ID) return null;
  return (
    <button type="button" className="link-btn" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Gérer les cookies
    </button>
  );
}
