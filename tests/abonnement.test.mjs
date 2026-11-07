import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  billingEnabled,
  checkoutParams,
  freeReads,
  isActive,
  isOpen,
  monthStart,
  quotaMessage,
  priceLabel,
  readsLeft,
  subscriptionRow,
} from '../lib/abonnement.mjs';

const USER = '0b6f1c2e-3d4a-4b5c-9d8e-7f6a5b4c3d2e';

test('billingEnabled exige la clé secrète et le prix', () => {
  assert.equal(billingEnabled({}), false);
  assert.equal(billingEnabled({ STRIPE_SECRET_KEY: 'sk' }), false);
  assert.equal(billingEnabled({ STRIPE_SECRET_KEY: 'sk', STRIPE_PRICE_RECETTES: 'price_1' }), true);
});

test('freeReads lit FACTURES_GRATUITES avec 3 par défaut', () => {
  assert.equal(freeReads({}), 3);
  assert.equal(freeReads({ FACTURES_GRATUITES: '0' }), 0);
  assert.equal(freeReads({ FACTURES_GRATUITES: '10' }), 10);
  assert.equal(freeReads({ FACTURES_GRATUITES: '-1' }), 3);
  assert.equal(freeReads({ FACTURES_GRATUITES: 'beaucoup' }), 3);
  assert.equal(freeReads({ FACTURES_GRATUITES: '2.5' }), 3);
});

test('isActive accepte actif, essai et paiement en retard', () => {
  assert.equal(isActive({ status: 'active' }), true);
  assert.equal(isActive({ status: 'trialing' }), true);
  assert.equal(isActive({ status: 'past_due' }), true);
  assert.equal(isActive({ status: 'canceled' }), false);
  assert.equal(isActive({ status: 'unpaid' }), false);
  assert.equal(isActive(null), false);
});

test('monthStart et readsLeft', () => {
  assert.equal(monthStart(new Date('2026-11-07T13:00:00Z')), '2026-11-01T00:00:00.000Z');
  assert.equal(readsLeft({ enabled: true, active: false, used: 1, free: 3 }), 2);
  assert.equal(readsLeft({ enabled: true, active: false, used: 5, free: 3 }), 0);
  assert.equal(readsLeft({ enabled: true, active: true, used: 50, free: 3 }), Infinity);
  assert.equal(readsLeft({ enabled: false, active: false, used: 50, free: 3 }), Infinity);
});

test('subscriptionRow lit la fin de période sur l’élément de l’abonnement', () => {
  const row = subscriptionRow(
    {
      id: 'sub_123',
      customer: 'cus_456',
      status: 'active',
      cancel_at_period_end: false,
      cancel_at: null,
      metadata: { user_id: USER },
      items: { data: [{ price: { id: 'price_789' }, current_period_end: 1796000000 }] },
    },
    1795000000
  );
  assert.deepEqual(row, {
    p_user_id: USER,
    p_customer: 'cus_456',
    p_subscription: 'sub_123',
    p_status: 'active',
    p_price: 'price_789',
    p_period_end: new Date(1796000000 * 1000).toISOString(),
    p_cancel: false,
    p_event_at: new Date(1795000000 * 1000).toISOString(),
  });
});

test('subscriptionRow : client développé, résiliation programmée, ancien format', () => {
  const row = subscriptionRow({ id: 'sub_1', customer: { id: 'cus_1' }, status: 'active', cancel_at: 1796000000, current_period_end: 1796000000, metadata: { user_id: USER }, items: { data: [] } }, 1);
  assert.equal(row.p_customer, 'cus_1');
  assert.equal(row.p_cancel, true);
  assert.equal(row.p_period_end, new Date(1796000000 * 1000).toISOString());
  assert.equal(row.p_price, null);
});

test('subscriptionRow ignore un abonnement sans compte Equimarge', () => {
  assert.equal(subscriptionRow({ id: 'sub_1', status: 'active', metadata: {} }, 1), null);
  assert.equal(subscriptionRow({ id: 'sub_1', status: 'active', metadata: { user_id: 'pas-un-uuid' } }, 1), null);
  assert.equal(subscriptionRow(null, 1), null);
});

test('checkoutParams : nouveau client ou client existant', () => {
  const p = checkoutParams({ userId: USER, email: 'a@b.fr', priceId: 'price_1', origin: 'https://equimarge.fr' });
  assert.equal(p.mode, 'subscription');
  assert.deepEqual(p.line_items, [{ price: 'price_1', quantity: 1 }]);
  assert.equal(p.customer_email, 'a@b.fr');
  assert.equal(p.customer, undefined);
  assert.deepEqual(p.subscription_data.metadata, { user_id: USER });
  assert.equal(p.client_reference_id, USER);
  assert.equal(p.allow_promotion_codes, true);
  assert.equal(p.success_url, 'https://equimarge.fr/tableau-de-bord/compte?abonnement=merci');

  const q = checkoutParams({ userId: USER, email: 'a@b.fr', customerId: 'cus_1', priceId: 'price_1', taxRateId: 'txr_1', origin: 'https://equimarge.fr' });
  assert.equal(q.customer, 'cus_1');
  assert.equal(q.customer_email, undefined);
  assert.deepEqual(q.customer_update, { name: 'auto', address: 'auto' });
  assert.deepEqual(q.line_items[0].tax_rates, ['txr_1']);
});

test('priceLabel met le prix en forme', () => {
  const nbsp = (s) => s.replace(/[  ]/g, ' ');
  assert.equal(nbsp(priceLabel({ unit_amount: 2900, currency: 'eur', recurring: { interval: 'month', interval_count: 1 } })), '29 € HT / mois');
  assert.equal(nbsp(priceLabel({ unit_amount: 2990, currency: 'eur', tax_behavior: 'inclusive', recurring: { interval: 'month', interval_count: 1 } })), '29,90 € TTC / mois');
  assert.equal(nbsp(priceLabel({ unit_amount: 29000, currency: 'eur', recurring: { interval: 'year', interval_count: 1 } })), '290 € HT / an');
  assert.equal(priceLabel({ unit_amount: null, currency: 'eur' }), null);
  assert.equal(priceLabel(null), null);
});

test('quotaMessage et isOpen', () => {
  assert.match(quotaMessage(3), /Vos 3 lectures gratuites du mois sont utilisées/);
  assert.match(quotaMessage(1), /Vos 1 lecture gratuite du mois est utilisée/);
  assert.match(quotaMessage(0), /réservée aux abonnés/);
  assert.equal(isOpen({ status: 'unpaid' }), true);
  assert.equal(isOpen({ status: 'canceled' }), false);
  assert.equal(isOpen({ status: 'incomplete_expired' }), false);
  assert.equal(isOpen(null), false);
});
