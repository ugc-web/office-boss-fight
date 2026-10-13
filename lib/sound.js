// Tiny 8-bit sound effects generated with the Web Audio API (no audio files).
let ctx;
let muted = false;

export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('obf_muted', m ? '1' : '0'); } catch {}
}
export function getMuted() {
  try { muted = localStorage.getItem('obf_muted') === '1'; } catch {}
  return muted;
}

function tone(freq, start, dur, type = 'square', vol = 0.08) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + start);
  g.gain.setValueAtTime(vol, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur);
}

const SFX = {
  click: [[660, 0, 0.05]],
  hit: [[880, 0, 0.08], [1320, 0.08, 0.12]],
  hurt: [[200, 0, 0.15, 'sawtooth'], [120, 0.12, 0.25, 'sawtooth']],
  heal: [[523, 0, 0.1, 'triangle'], [659, 0.1, 0.1, 'triangle'], [784, 0.2, 0.2, 'triangle']],
  win: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1046, 0.36, 0.35]],
  lose: [[392, 0, 0.2, 'triangle'], [330, 0.2, 0.2, 'triangle'], [262, 0.4, 0.5, 'triangle']],
};

export function play(name) {
  if (muted || typeof window === 'undefined') return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    (SFX[name] || []).forEach((args) => tone(...args));
  } catch {}
}
