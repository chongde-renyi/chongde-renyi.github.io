import test from 'node:test';
import assert from 'node:assert/strict';
import { FORTUNES } from './fortunes.js';
import { drawFortune, getJiaobeiOutcome, createConfirmationState, applyJiaobeiResult } from './logic.js';

test('contains exactly 60 unique Jiazi fortunes in sequence', () => {
  assert.equal(FORTUNES.length, 60);
  assert.deepEqual(FORTUNES.map(f => f.id), Array.from({length: 60}, (_, i) => i + 1));
  assert.equal(new Set(FORTUNES.map(f => f.ganzhi)).size, 60);
});

test('drawFortune maps random values to a fortune and can exclude the current one', () => {
  assert.equal(drawFortune(FORTUNES, () => 0).id, 1);
  assert.equal(drawFortune(FORTUNES, () => 0.999999).id, 60);
  const next = drawFortune(FORTUNES, () => 0, 1);
  assert.notEqual(next.id, 1);
});

test('jiaobei outcome uses one flat and one rounded side as sheng', () => {
  assert.equal(getJiaobeiOutcome('flat', 'round'), 'sheng');
  assert.equal(getJiaobeiOutcome('round', 'flat'), 'sheng');
  assert.equal(getJiaobeiOutcome('flat', 'flat'), 'xiao');
  assert.equal(getJiaobeiOutcome('round', 'round'), 'yin');
});

test('three consecutive sheng results confirm the fortune', () => {
  let state = createConfirmationState();
  state = applyJiaobeiResult(state, 'sheng');
  assert.equal(state.shengCount, 1);
  assert.equal(state.confirmed, false);
  state = applyJiaobeiResult(state, 'sheng');
  assert.equal(state.shengCount, 2);
  state = applyJiaobeiResult(state, 'sheng');
  assert.equal(state.shengCount, 3);
  assert.equal(state.confirmed, true);
});

test('a non-sheng result fails the current confirmation', () => {
  let state = createConfirmationState();
  state = applyJiaobeiResult(state, 'sheng');
  state = applyJiaobeiResult(state, 'xiao');
  assert.equal(state.failed, true);
  assert.equal(state.confirmed, false);
});
