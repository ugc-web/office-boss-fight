// 8-bit sound effects + light background music, generated with the Web Audio API (no audio files).
let ctx;
let master;
let muted = false;

export function setMuted(m) {
  muted = m;
  try { localStorage.setItem('obf_muted', m ? '1' : '0'); } catch {}
  if (m) { stopMusic(); try { window.speechSynthesis?.cancel(); } catch {} }
  else if (wantedTheme) startMusic(wantedTheme);
}
export function getMuted() {
  try { muted = localStorage.getItem('obf_muted') === '1'; } catch {}
  return muted;
}

function out() {
  if (!master) {
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  return master;
}

function tone(freq, start, dur, type = 'square', vol = 0.07, slideTo, dest) {
  const t = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest || out());
  o.start(t);
  o.stop(t + dur + 0.02);
}

// Filtered noise: low freq = thud/rumble, high = hiss/crackle.
function noise(start, dur, vol = 0.08, freq = 0, q = 1) {
  const t = ctx.currentTime + start;
  const buf = ctx.createBuffer(1, Math.max(1, ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  g.gain.value = vol;
  src.buffer = buf;
  let node = src;
  if (freq) {
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    node = src.connect(f);
  }
  node.connect(g).connect(out());
  src.start(t);
}

const seq = (notes, step, type = 'square', vol = 0.06, len) =>
  notes.forEach((f, i) => f && tone(f, i * step, len || step * 0.9, type, vol));

const SFX = {
  // UI
  click: () => { tone(1800, 0, 0.012, 'square', 0.05); noise(0, 0.02, 0.05, 2500, 2); },
  select: () => { tone(523, 0, 0.05); tone(784, 0.05, 0.07); },
  type: () => tone(900 + Math.random() * 500, 0, 0.012, 'square', 0.012),
  tick: () => tone(1500, 0, 0.02, 'square', 0.03),
  tock: () => tone(1100, 0, 0.02, 'square', 0.03),
  // Combat
  bowDraw: () => { tone(180, 0, 0.25, 'sawtooth', 0.025, 360); noise(0, 0.25, 0.02, 3000, 3); },
  arrow: () => { noise(0, 0.22, 0.06, 4000, 1.5); tone(1400, 0, 0.18, 'triangle', 0.025, 500); },
  hit: () => { noise(0, 0.1, 0.18, 300, 0.8); tone(220, 0, 0.09, 'square', 0.07, 110); tone(1046, 0.08, 0.06, 'square', 0.04); },
  ko: () => { noise(0, 0.35, 0.18, 200, 0.6); seq([784, 659, 523, 392, 262], 0.08, 'square', 0.06); noise(0.45, 0.4, 0.07, 1200, 0.5); },
  hurt: () => { noise(0, 0.12, 0.16, 250, 0.8); tone(330, 0.02, 0.22, 'square', 0.08, 140); },
  xp: () => { tone(1568 + Math.random() * 400, 0, 0.06, 'sine', 0.06); tone(2093, 0.05, 0.06, 'sine', 0.04); },
  levelup: () => seq([523, 659, 784, 1046, 1318], 0.07, 'triangle', 0.07, 0.12),
  heal: () => { seq([392, 523, 659, 784], 0.08, 'triangle', 0.07, 0.14); noise(0, 0.3, 0.03, 6000, 1); }, // chai: pour + chime
  vs: () => { noise(0, 0.3, 0.12, 180, 0.7); tone(110, 0, 0.6, 'sawtooth', 0.06, 55); },
  step: () => noise(0, 0.05, 0.05, 500 + Math.random() * 300, 1.2),
  win: () => seq([523, 659, 784, 1046, 0, 784, 1046, 1318], 0.12, 'square', 0.06),
  lose: () => seq([392, 370, 349, 330, 262], 0.26, 'triangle', 0.08, 0.3),
  timeout: () => { tone(880, 0, 0.12, 'square', 0.06); tone(880, 0.18, 0.12, 'square', 0.06); tone(440, 0.36, 0.4, 'square', 0.07, 220); },

  // Boss roars (played on intro + when the boss attacks)
  roar_hydra: () => { tone(260, 0, 0.35, 'sawtooth', 0.05, 520); tone(320, 0.08, 0.35, 'sawtooth', 0.04, 640); noise(0, 0.4, 0.05, 2500, 2); },
  roar_golem: () => { tone(80, 0, 0.7, 'sawtooth', 0.06, 50); tone(83, 0, 0.7, 'sawtooth', 0.05, 52); noise(0, 0.5, 0.08, 300, 1); },
  roar_drone: () => { tone(220, 0, 0.6, 'sawtooth', 0.035, 330); tone(223, 0, 0.6, 'square', 0.025, 336); noise(0, 0.6, 0.04, 5000, 3); },
  roar_trex: () => { noise(0, 0.9, 0.14, 300, 0.5); tone(90, 0, 0.9, 'sawtooth', 0.07, 40); noise(0.2, 0.6, 0.06, 3000, 0.8); },
  roar_ceo: () => { tone(110, 0, 0.8, 'sawtooth', 0.06, 82); tone(165, 0, 0.8, 'square', 0.03, 123); tone(2637, 0.5, 0.25, 'sine', 0.04); },
  // Fight extras
  block: () => { noise(0, 0.08, 0.2, 2500, 3); tone(1760, 0, 0.18, 'square', 0.05, 1320); tone(880, 0.02, 0.2, 'triangle', 0.05); },
  whiff: () => { tone(300, 0, 0.25, 'sawtooth', 0.04, 120); },
  ult: () => { noise(0, 0.6, 0.12, 900, 0.5); seq([523, 659, 784, 1046, 1318, 1568], 0.06, 'square', 0.06, 0.2); },
  meter: () => seq([784, 988, 1175, 1568], 0.06, 'triangle', 0.06, 0.15),
  special: () => { tone(98, 0, 0.7, 'sawtooth', 0.07, 196); noise(0, 0.5, 0.1, 600, 1); seq([392, 370, 349], 0.12, 'square', 0.05, 0.2); },
  freeze: () => { seq([2093, 1976, 1760, 1568], 0.05, 'sine', 0.05, 0.25); noise(0, 0.4, 0.04, 7000, 2); },
  swat: () => { noise(0, 0.07, 0.18, 1200, 2); tone(600, 0, 0.08, 'square', 0.04, 200); },
  shuffle: () => { for (let i = 0; i < 6; i++) noise(i * 0.05, 0.04, 0.08, 3000, 3); },
  perk: () => seq([1046, 1568, 2093], 0.05, 'sine', 0.06, 0.2),

  // Question-topic sounds (lib/data question `sfx` field)
  email: () => { tone(1318, 0, 0.09, 'sine', 0.07); tone(1760, 0.1, 0.16, 'sine', 0.06); },
  keyboard: () => { for (let i = 0; i < 7; i++) { noise(i * 0.06 + Math.random() * 0.02, 0.025, 0.06, 2200 + Math.random() * 800, 3); } },
  phone: () => { for (let r = 0; r < 2; r++) for (let i = 0; i < 8; i++) tone(i % 2 ? 1100 : 1300, r * 0.45 + i * 0.03, 0.03, 'square', 0.035); },
  camera: () => { noise(0, 0.03, 0.12, 4000, 2); noise(0.07, 0.05, 0.1, 2500, 2); },
  clock: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 1100 : 1500, i * 0.25, 0.025, 'square', 0.04); },
  alarm: () => { for (let i = 0; i < 3; i++) { tone(988, i * 0.22, 0.1, 'square', 0.05); tone(784, i * 0.22 + 0.1, 0.1, 'square', 0.05); } },
  cash: () => { noise(0, 0.08, 0.08, 3500, 2); tone(2637, 0.08, 0.25, 'sine', 0.06); tone(3136, 0.1, 0.25, 'sine', 0.04); },
  paper: () => noise(0, 0.25, 0.06, 5000, 0.7),
  lock: () => { noise(0, 0.03, 0.1, 1800, 4); tone(400, 0.05, 0.05, 'square', 0.05); noise(0.12, 0.03, 0.1, 1200, 4); },
  magic: () => seq([1046, 1318, 1568, 2093, 1568, 2093], 0.05, 'sine', 0.035, 0.12),
  voice: () => { [220, 260, 200, 240, 190].forEach((f, i) => tone(f, i * 0.09, 0.08, 'sawtooth', 0.035, f * 1.2)); },
  crowd: () => { for (let i = 0; i < 6; i++) tone(180 + Math.random() * 160, i * 0.06, 0.15, 'sawtooth', 0.012, 200 + Math.random() * 100); noise(0, 0.5, 0.03, 700, 0.6); },
  // Fighting-game stings
  ready: () => { tone(220, 0, 0.5, 'sawtooth', 0.05, 440); noise(0, 0.5, 0.04, 800, 1); },
  fight: () => { noise(0, 0.4, 0.2, 160, 0.6); seq([392, 523, 784], 0.06, 'square', 0.08, 0.3); tone(98, 0, 0.6, 'sawtooth', 0.08, 49); },
  swoosh: () => noise(0, 0.22, 0.09, 1400, 0.7),
  slash: () => { noise(0, 0.12, 0.12, 5000, 1.2); tone(1800, 0, 0.1, 'sawtooth', 0.03, 600); },
  punch: () => { noise(0, 0.09, 0.22, 180, 0.7); tone(140, 0, 0.08, 'square', 0.08, 60); },
  slam: () => { noise(0, 0.6, 0.25, 90, 0.5); tone(70, 0, 0.6, 'sawtooth', 0.09, 35); },
  beam: () => { tone(300, 0, 0.6, 'sawtooth', 0.05, 1200); tone(305, 0, 0.6, 'square', 0.03, 1210); noise(0, 0.6, 0.04, 3000, 1); },
  zap: () => { tone(1200, 0, 0.15, 'square', 0.05, 300); noise(0, 0.12, 0.05, 4000, 2); },
  blink: () => { tone(400, 0, 0.12, 'sine', 0.06, 1600); tone(1600, 0.25, 0.12, 'sine', 0.05, 400); },
  rumble: () => { noise(0, 0.7, 0.14, 70, 0.5); tone(55, 0, 0.7, 'triangle', 0.08); },
  crit: () => { noise(0, 0.15, 0.2, 400, 0.6); seq([1046, 1568, 2093], 0.04, 'square', 0.05, 0.1); },
  finisher: () => { noise(0, 1.2, 0.2, 120, 0.4); tone(65, 0, 1.2, 'sawtooth', 0.1, 33); seq([262, 330, 392, 523, 659, 784, 1046], 0.09, 'square', 0.07, 0.25); },
  chai: () => { noise(0, 0.5, 0.04, 6000, 1); tone(1800, 0.45, 0.1, 'sine', 0.04); },
};

export function play(name) {
  if (muted || typeof window === 'undefined') return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    SFX[name]?.();
  } catch {}
}

export const SOUND_NAMES = Object.keys(SFX);

/** Announcer voice ("Round 1… Fight!") using the browser's built-in speech. Silent when muted or unsupported. */
export function announce(text, { pitch = 0.55, rate = 0.92 } = {}) {
  if (muted || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.pitch = pitch;
    u.rate = rate;
    u.volume = 1;
    const voices = window.speechSynthesis.getVoices().filter((x) => /^en(-|_)/i.test(x.lang));
    const v = voices.find((x) => /daniel|alex|fred|uk english male/i.test(x.name)) || voices[0];
    if (v) u.voice = v;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}

// ---------- Background music: quiet 8-bit loops, one mood per screen/boss ----------
// Notes as semitones from the root (null = rest). 8 steps per bar, 4 bars.
const THEMES = {
  menu: { root: 196, bpm: 84, wave: 'triangle', bass: [0, 0, 5, 5, 7, 7, 3, 3], mel: [12, null, 7, null, 10, 12, null, 7, 5, null, 7, null, 3, null, 5, null, 12, null, 14, 12, 10, null, 7, null, 5, 7, null, 3, null, 2, 0, null] },
  hydra: { root: 220, bpm: 120, wave: 'square', bass: [0, 0, 3, 3, 5, 5, 7, 3], mel: [12, 15, 12, null, 10, 12, 7, null, 12, 15, 17, 15, 12, null, 10, null, 7, 10, 12, null, 15, 12, 10, 7, 5, null, 7, 10, 12, null, null, null] },
  drone: { root: 175, bpm: 112, wave: 'square', bass: [0, 7, 0, 7, 5, 12, 5, 7], mel: [7, null, 7, 9, 10, null, 9, 7, 5, null, 5, 7, 9, null, 7, null, 7, 9, 10, 12, 10, 9, 7, null, 5, 7, 5, 3, 2, null, 0, null] },
  golem: { root: 147, bpm: 96, wave: 'sawtooth', bass: [0, 0, 1, 1, 0, 0, 6, 6], mel: [12, null, 13, null, 12, null, 11, null, 12, 15, 13, null, 12, null, null, null, 6, null, 7, null, 6, 3, 1, null, 0, null, 1, 3, 0, null, null, null] },
  ceo: { root: 147, bpm: 132, wave: 'sawtooth', bass: [0, 0, 3, 3, 8, 8, 7, 7], mel: [12, 15, 19, null, 17, 15, 12, null, 15, 19, 22, null, 20, 19, 15, null, 12, 15, 19, 20, 22, null, 19, 15, 17, null, 14, 15, 12, null, 12, null] },
  trex: { root: 130, bpm: 140, wave: 'square', bass: [0, 0, 0, 3, 5, 5, 6, 7], mel: [12, 12, 15, 12, 17, 15, 12, 10, 12, 12, 15, 17, 19, 17, 15, null, 12, 15, 17, 19, 22, 19, 17, 15, 12, 10, 7, 10, 12, null, 12, null] },
};

let wantedTheme = null;
let musicTimer = null;
let musicGain = null;

function scheduleBar(theme, startAt, step, bar) {
  const f = (st) => theme.root * Math.pow(2, st / 12);
  for (let i = 0; i < 8; i++) {
    const t = startAt + i * step - ctx.currentTime;
    const m = theme.mel[(bar * 8 + i) % theme.mel.length];
    if (m != null) tone(f(m), t, step * 0.85, theme.wave, 0.05, undefined, musicGain);
    if (i % 2 === 0) tone(f(theme.bass[i] - 12), t, step * 1.6, 'triangle', 0.08, undefined, musicGain);
    if (theme.bpm >= 110 && i % 2 === 1) noise(t, 0.03, 0.02, 7000, 1);
  }
}

export function startMusic(name) {
  wantedTheme = name;
  if (muted || typeof window === 'undefined') return;
  const theme = THEMES[name];
  if (!theme) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    stopMusic(true);
    musicGain = ctx.createGain();
    musicGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicGain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 1.2);
    musicGain.connect(out());
    const step = 60 / theme.bpm / 2;
    let bar = 0;
    let next = ctx.currentTime + 0.1;
    const pump = () => {
      while (next < ctx.currentTime + 1.5) {
        scheduleBar(theme, next, step, bar++);
        next += step * 8;
      }
    };
    pump();
    musicTimer = setInterval(pump, 500);
  } catch {}
}

export function stopMusic(keepWanted = false) {
  if (!keepWanted) wantedTheme = null;
  clearInterval(musicTimer);
  musicTimer = null;
  if (musicGain && ctx) {
    const g = musicGain;
    try {
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      setTimeout(() => g.disconnect(), 400);
    } catch {}
  }
  musicGain = null;
}

/** Duck music while dramatic SFX play. */
export function duck(ms = 900) {
  if (!musicGain || !ctx) return;
  const g = musicGain.gain;
  g.cancelScheduledValues(ctx.currentTime);
  g.setValueAtTime(0.12, ctx.currentTime);
  g.linearRampToValueAtTime(0.35, ctx.currentTime + ms / 1000);
}
