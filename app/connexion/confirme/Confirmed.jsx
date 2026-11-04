'use client';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';

// Supabase ajoute « error » à l'adresse quand le lien a expiré ou a déjà servi.
function readError() {
  const params = new URLSearchParams(window.location.search + '&' + window.location.hash.slice(1));
  return params.get('error') || params.get('error_code') ? 'erreur' : 'ok';
}
const subscribe = () => () => {};

export default function Confirmed() {
  const state = useSyncExternalStore(subscribe, readError, () => 'ok');
  if (state === 'erreur') {
    return (
      <div className="panel stack">
        <h1 style={{ margin: 0 }}>Lien expiré</h1>
        <p className="note" style={{ margin: 0 }}>
          Ce lien de confirmation a expiré ou a déjà été utilisé. Si votre adresse est déjà confirmée, connectez-vous
          simplement dans l’application Equimarge.
        </p>
        <Link className="btn ghost" href="/connexion">Se connecter sur le site</Link>
      </div>
    );
  }
  return (
    <div className="panel stack">
      <h1 style={{ margin: 0 }}>Adresse e-mail confirmée</h1>
      <p style={{ margin: 0 }}>Revenez dans l’application Equimarge et connectez-vous avec votre e-mail et votre mot de passe.</p>
      <p className="note" style={{ margin: 0 }}>
        Vous pouvez aussi utiliser votre espace sur le site : <Link href="/connexion">se connecter</Link>.
      </p>
    </div>
  );
}
