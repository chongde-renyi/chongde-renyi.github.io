export function drawFortune(fortunes, rng = Math.random, excludeId = null) {
  const pool = excludeId == null ? fortunes : fortunes.filter(f => f.id !== excludeId);
  if (!pool.length) throw new Error('No fortunes available');
  const index = Math.min(pool.length - 1, Math.floor(rng() * pool.length));
  return pool[index];
}

export function getJiaobeiOutcome(left, right) {
  if (left !== right) return 'sheng';
  return left === 'flat' ? 'xiao' : 'yin';
}

export function tossJiaobei(rng = Math.random) {
  const left = rng() < 0.5 ? 'flat' : 'round';
  const right = rng() < 0.5 ? 'flat' : 'round';
  return { left, right, outcome: getJiaobeiOutcome(left, right) };
}

export function createConfirmationState() {
  return { shengCount: 0, confirmed: false, failed: false };
}

export function applyJiaobeiResult(state, outcome) {
  if (state.confirmed || state.failed) return state;
  if (outcome !== 'sheng') {
    return { shengCount: state.shengCount, confirmed: false, failed: true };
  }
  const shengCount = state.shengCount + 1;
  return { shengCount, confirmed: shengCount >= 3, failed: false };
}
