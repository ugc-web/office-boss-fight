// 8-bit sound effects generated with the Web Audio API (no audio files).
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

function tone(freq, start, dur, type = 'square', vol = 0.07, slideTo) {
  const t = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(start, dur, vol = 0.08) {
  const t = ctx.currentTime + start;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(g).connect(ctx.destination);
  src.start(t);
}

const SFX = {
  click: () => tone(660, 0, 0.05),
  select: () => { tone(440, 0, 0.04); tone(880, 0.04, 0.05); },
  arrow: () => { tone(1400, 0, 0.18, 'sawtooth', 0.04, 300); },
  hit: () => { noise(0.35, 0.12, 0.12); tone(880, 0.35, 0.08); tone(1320, 0.43, 0.12); },
  ko: () => { noise(0.35, 0.3, 0.15); [784, 659, 523, 392, 262].forEach((f, i) => tone(f, 0.5 + i * 0.08, 0.1)); },
  hurt: () => { tone(300, 0.4, 0.3, 'sawtooth', 0.08, 60); noise(0.45, 0.2, 0.1); },
  heal: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.12, 'triangle', 0.08)),
  vs: () => { noise(0, 0.25, 0.12); tone(110, 0, 0.5, 'square', 0.08, 55); },
  win: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.14)),
  lose: () => [392, 370, 349, 330].forEach((f, i) => tone(f, i * 0.25, 0.3, 'triangle', 0.09)),
  type: () => tone(1200 + Math.random() * 400, 0, 0.015, 'square', 0.015),
};

export function play(name) {
  if (muted || typeof window === 'undefined') return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    SFX[name]?.();
  } catch {}
}
