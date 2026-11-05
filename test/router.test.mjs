// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeTask, settleEscalation, shouldEscalate } from '../src/router.mjs';

test('eşik ve üstü yükseltilmez', () => {
  assert.equal(shouldEscalate({ agreement: 0.6, threshold: 0.6, strongRemaining: 10 }).escalate, false);
  assert.equal(shouldEscalate({ agreement: 1, threshold: 0.6, strongRemaining: 10 }).escalate, false);
});

test('eşik altı yükseltilir', () => {
  assert.equal(shouldEscalate({ agreement: 0.59, threshold: 0.6, strongRemaining: 1 }).escalate, true);
  assert.equal(shouldEscalate({ agreement: null, threshold: 0.6, strongRemaining: 1 }).escalate, true);
});

test('bütçe bittiyse yükseltilmez ve sebep yazılır', () => {
  const decision = shouldEscalate({ agreement: 0.2, threshold: 0.6, strongRemaining: 0 });
  assert.equal(decision.escalate, false);
  assert.match(decision.reason, /bütçe/);
});

test('güçlü aday açık testte kalırsa geçen ucuz aday korunur', () => {
  assert.equal(settleEscalation({ cheap: { publicPass: true }, strong: { code: 'x', publicPass: false } }).pick, 'cheap');
  assert.equal(settleEscalation({ cheap: { publicPass: false }, strong: { code: 'x', publicPass: false } }).pick, 'strong');
  assert.equal(settleEscalation({ cheap: { publicPass: null }, strong: { code: 'x', publicPass: true } }).pick, 'strong');
  assert.equal(settleEscalation({ cheap: null, strong: { error: '429' } }).pick, 'cheap');
});

const selection = (agreement) => ({ chosen: 0, agreement });
const cheapCandidates = [{ id: 0, publicPass: false }];

test('yüksek uzlaşmada güçlü model hiç çağrılmaz', async () => {
  let calls = 0;
  const routed = await routeTask({
    selection: selection(1), cheapCandidates, threshold: 0.6, strongModel: 'argon', strongRemaining: 5,
    solveStrong: async () => { calls += 1; },
  });
  assert.equal(calls, 0);
  assert.equal(routed.chosen, 0);
  assert.equal(routed.log.escalated, false);
});

test('düşük uzlaşmada güçlü aday seçilir ve kayda geçer', async () => {
  const routed = await routeTask({
    selection: selection(0.33), cheapCandidates, threshold: 0.6, strongModel: 'argon', strongRemaining: 5,
    solveStrong: async () => ({ id: 3, code: 'def solve(): pass', publicPass: true }),
  });
  assert.equal(routed.chosen, 3);
  assert.equal(routed.log.escalated, true);
  assert.equal(routed.log.outcome, 'strong');
});

test('güçlü model hata verirse ucuz seçim kalır ve hata yazılır', async () => {
  const routed = await routeTask({
    selection: selection(0), cheapCandidates, threshold: 0.6, strongModel: 'argon', strongRemaining: 5,
    solveStrong: async () => { throw new Error('HTTP 429'); },
  });
  assert.equal(routed.chosen, 0);
  assert.equal(routed.log.outcome, 'cheap');
  assert.match(routed.log.strongError, /429/);
});
