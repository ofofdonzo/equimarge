'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from '@/components/icons';
import { isActive, PLAN_NAME, STATUS_LABELS } from '@/lib/abonnement.mjs';

const day = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

// Abonnement Recettes Pro : souscription (page de paiement Stripe) ou gestion (espace client Stripe).
// sub : ligne de la table subscriptions, ou null ; result : « merci » ou « annule » au retour de Stripe.
export default function SubscriptionPanel({ price, sub, used, free, result }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = isActive(sub);
  const waiting = result === 'merci' && !active;

  // Retour du paiement : l'abonnement arrive par l'événement Stripe, quelques secondes plus tard
  useEffect(() => {
    if (!waiting) return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      router.refresh();
      if (n >= 8) clearInterval(id);
    }, 3000);
    return () => clearInterval(id);
  }, [waiting, router]);

  async function go(path) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(path, { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) throw new Error(body.error || 'Service indisponible pour le moment. Réessayez.');
      window.location.assign(body.url);
    } catch (e) {
      setBusy(false);
      setError(e.message === 'Failed to fetch' ? 'Connexion impossible. Vérifiez votre réseau et réessayez.' : e.message);
    }
  }

  return (
    <section className="panel" id="abonnement">
      <div className="panel-head" style={{ marginBottom: 8 }}>
        <h2>Abonnement {PLAN_NAME}</h2>
        {sub && <span className={'pill ' + (active ? (sub.status === 'past_due' ? 'warn' : 'ok') : 'none')}>{STATUS_LABELS[sub.status] || sub.status}</span>}
      </div>

      {result === 'merci' && active && <p className="success-line"><Check size={18} /> Merci : votre abonnement est actif.</p>}
      {waiting && <p className="note" aria-live="polite">Paiement reçu, activation de l'abonnement en cours…</p>}
      {result === 'annule' && !active && <p className="note">Paiement annulé : rien n'a été prélevé.</p>}

      {active ? (
        <>
          {sub.status === 'past_due' && (
            <p className="err" role="alert" style={{ marginBottom: 12 }}>Le dernier paiement a échoué. Mettez à jour votre carte pour garder l'abonnement.</p>
          )}
          <p style={{ marginTop: 0 }}>
            Lecture de vos factures fournisseurs jusqu'à 300 par mois.{' '}
            {sub.current_period_end &&
              (sub.cancel_at_period_end
                ? `Résiliation demandée : l'abonnement s'arrête le ${day(sub.current_period_end)}.`
                : `Prochain renouvellement le ${day(sub.current_period_end)}.`)}
          </p>
          <div className="row">
            <button type="button" className="btn ghost" disabled={busy} onClick={() => go('/api/abonnement/gestion')}>
              {busy ? 'Ouverture…' : 'Gérer mon abonnement'}
            </button>
          </div>
          <p className="note" style={{ marginBottom: 0 }}>Carte bancaire, factures et résiliation, sur l'espace sécurisé de Stripe.</p>
        </>
      ) : (
        <>
          <p style={{ marginTop: 0 }}>
            Faites lire toutes vos factures fournisseurs par l'IA : le coût de vos matières et de vos recettes se met à jour
            tout seul.{price && <> <b className="nowrap">{price}</b>, sans engagement.</>}
          </p>
          <ul className="checks" style={{ margin: '0 0 16px' }}>
            <li><Check size={16} />Jusqu'à 300 factures lues par mois (30 par jour)</li>
            <li><Check size={16} />Résiliable en ligne à tout moment, effet à la fin de la période payée</li>
            <li><Check size={16} />Facture mensuelle envoyée par e-mail</li>
          </ul>
          <p className="note">
            Sans abonnement : recettes et matières sans limite, et {free} lecture{free > 1 ? 's' : ''} de facture gratuite{free > 1 ? 's' : ''} par mois
            ({Math.min(used, free)} utilisée{Math.min(used, free) > 1 ? 's' : ''} ce mois-ci).
          </p>
          <div className="row">
            <button type="button" className="btn" disabled={busy || waiting} onClick={() => go('/api/abonnement/paiement')}>
              {busy ? 'Ouverture du paiement…' : "S'abonner"} <ArrowRight size={18} />
            </button>
            {sub && (
              <button type="button" className="btn ghost" disabled={busy} onClick={() => go('/api/abonnement/gestion')}>
                Mes anciennes factures
              </button>
            )}
          </div>
          <p className="note" style={{ marginBottom: 0 }}>Paiement sécurisé par Stripe. Equimarge ne voit jamais votre numéro de carte.</p>
        </>
      )}
      {error && <p className="err" role="alert" style={{ marginTop: 12 }}>{error}</p>}
    </section>
  );
}
