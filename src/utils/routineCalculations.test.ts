import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotalsMAD, formatPriceMAD, FREE_DELIVERY_THRESHOLD } from './routineCalculations';

test('formatPriceMAD formats Moroccan Dirhams with DH suffix', () => {
  assert.equal(formatPriceMAD(180), '180 DH');
  assert.equal(formatPriceMAD(500), '500 DH');
  assert.equal(formatPriceMAD(1250), '1 250 DH');
});

test('calculateCartTotalsMAD computes subtotal and delivery fee below 1000 DH', () => {
  const items = [
    { id: 1, brand: 'Anua', name: 'Niacinamide Serum', vol: '30 ml', price: 235, img: '', quantity: 1 }, // 235 DH
  ];

  const result = calculateCartTotalsMAD(items, 35);
  assert.equal(result.subtotal, 235);
  assert.equal(result.deliveryFee, 35);
  assert.equal(result.isFreeDelivery, false);
  assert.equal(result.freeDeliveryRemaining, 1000 - 235);
  assert.equal(result.total, 270);
});

test('calculateCartTotalsMAD grants free delivery when subtotal reaches 1000 DH threshold', () => {
  const items = [
    { id: 1, brand: 'SKIN1004', name: 'Travel Kit', vol: 'Kit', price: 260, img: '', quantity: 4 }, // 1040 DH
  ];

  const result = calculateCartTotalsMAD(items, 35);
  assert.equal(result.subtotal, 1040);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.isFreeDelivery, true);
  assert.equal(result.freeDeliveryRemaining, 0);
  assert.equal(result.total, 1040);
});

test('calculateCartTotalsMAD applies promo code discount for AURA10', () => {
  const items = [
    { id: 1, brand: 'COSRX', name: 'Cleanser', vol: '150 ml', price: 180, img: '', quantity: 2 }, // 360 DH
  ];

  const result = calculateCartTotalsMAD(items, 35, 'AURA10');
  assert.equal(result.discount, 36);
  assert.equal(result.total, 360 - 36 + 35);
});
