// Playable fighters: fighting styles (each with its own move list and ultimate), the look options
// for the character creator, and the preset roster. Framework-free so it can be unit-tested.
//
// Move kinds are animated by components/Arena.js and app/globals.css:
//   shot     projectiles fly across            dash     rush in, strike, rush back
//   uppercut rush in and launch the target     slam     leap up and crash down
//   rain     projectiles fall from the sky     beam     a long blast across the stage
//   summon   things burst out of the ground    spin     whirl across like a tornado
//   teleport vanish, strike from up close, vanish back
// Tier 1 = quick hit, 2 = combo / heavy, 3 = special. lib/moves.mjs picks the tier from the situation.

export const STYLES = {
  archer: {
    label: 'AI Archer',
    icon: '🏹',
    tagline: 'From drafts to direct hits.',
    blurb: 'A fast, agile fighter who turns everyday tasks into powerful attacks.',
    fx: 'arrow',
    color: '#38bdf8',
    stats: { speed: 4, power: 3, range: 5, difficulty: 2 },
    perk: { id: 'doublecheck', name: 'Double-Check', icon: '🎯', text: 'Once per stage, take away one wrong answer.', active: true },
    moves: [
      { name: 'Quick Draw', kind: 'shot', hits: 1, tier: 1 },
      { name: 'Backflip Shot', kind: 'teleport', hits: 1, tier: 1 },
      { name: 'Triple-Check Volley', kind: 'shot', hits: 3, tier: 2 },
      { name: 'Point-Blank Prompt', kind: 'dash', hits: 2, tier: 2 },
      { name: 'Fact-Check Piercer', kind: 'beam', hits: 1, tier: 3 },
      { name: 'Arrow Rain of Clarity', kind: 'rain', hits: 6, tier: 3 },
    ],
    ultimate: 'AI Overload Volley',
  },
  blade: {
    label: 'Data Blade',
    icon: '⚔️',
    tagline: 'Rows. Columns. No survivors.',
    blurb: 'A precise swordsman who wields the power of spreadsheets, automation and data.',
    fx: 'slash',
    color: '#22c55e',
    stats: { speed: 4, power: 4, range: 2, difficulty: 3 },
    perk: { id: 'focus', name: 'Laser Focus', icon: '⏱️', text: '+5 seconds on every question.' },
    moves: [
      { name: 'Sheet Slash', kind: 'dash', hits: 2, tier: 1 },
      { name: 'Shadow Step', kind: 'teleport', hits: 2, tier: 1 },
      { name: 'Pivot Table Spin', kind: 'spin', hits: 4, tier: 2 },
      { name: 'Launcher Slash', kind: 'uppercut', hits: 2, tier: 2 },
      { name: 'Data Storm', kind: 'beam', hits: 3, tier: 3 },
      { name: 'Sky Splitter', kind: 'slam', hits: 1, tier: 3 },
    ],
    ultimate: 'Auto-Formula Finish',
  },
  brawler: {
    label: 'Energy Brawler',
    icon: '👊',
    tagline: 'More chai. More power.',
    blurb: 'A close-range fighter who channels endless chai and calm energy.',
    fx: 'fist',
    color: '#f97316',
    stats: { speed: 3, power: 5, range: 1, difficulty: 3 },
    perk: { id: 'chai', name: 'Chai Power', icon: '☕', text: 'Chai Breaks heal double: +2 ♥ instead of +1 ♥.' },
    moves: [
      { name: 'Chai Rush', kind: 'dash', hits: 3, tier: 1 },
      { name: 'Focus Blast', kind: 'shot', hits: 1, tier: 1 },
      { name: 'Cup Cyclone', kind: 'spin', hits: 5, tier: 2 },
      { name: 'Fact-Check Uppercut', kind: 'uppercut', hits: 1, tier: 2 },
      { name: 'Masala Impact', kind: 'slam', hits: 1, tier: 3 },
      { name: 'Kettle Storm', kind: 'rain', hits: 5, tier: 3 },
    ],
    ultimate: 'Tea Time',
  },
  mage: {
    label: 'AI Sorcerer',
    icon: '🪄',
    tagline: 'Ask better. Win bigger.',
    blurb: 'A strategic fighter who uses prompts, AI models and automation magic.',
    fx: 'orb',
    color: '#a855f7',
    stats: { speed: 2, power: 4, range: 5, difficulty: 4 },
    perk: { id: 'swap', name: 'Model Swap', icon: '🔄', text: 'Once per game, swap a question for a different one.', active: true },
    moves: [
      { name: 'Prompt Blast', kind: 'shot', hits: 1, tier: 1 },
      { name: 'Blink Strike', kind: 'teleport', hits: 1, tier: 1 },
      { name: 'Context Prison', kind: 'summon', hits: 4, tier: 2 },
      { name: 'Chain Lightning', kind: 'beam', hits: 3, tier: 2 },
      { name: 'Meteor Shower', kind: 'rain', hits: 5, tier: 3 },
      { name: 'Gravity Slam', kind: 'slam', hits: 1, tier: 3 },
    ],
    ultimate: 'AI Overload',
  },
};

export const STAT_LABELS = { speed: 'Speed', power: 'Power', range: 'Range', difficulty: 'Difficulty' };

// Creator palettes
export const SKINS = ['#f5d0b5', '#e8ac82', '#c68642', '#8d5524', '#5c3a21'];
export const HAIR_COLORS = ['#4a2f1b', '#111111', '#d4a64a', '#a33b1c', '#e5e7eb', '#7c3aed', '#ec4899'];
export const HAIR_STYLES = ['short', 'spiky', 'long', 'bun', 'cap', 'bald'];
export const OUTFITS = ['#e9eef5', '#111827', '#f97316', '#5b21b6', '#2563eb', '#dc2626', '#16a34a', '#db2777'];
export const PANTS = ['#2c3e8f', '#1f2937', '#f5e6c8', '#57534e', '#0f766e', '#7f1d1d'];
export const ACCENTS = ['#d33b3b', '#22c55e', '#f59e0b', '#38bdf8', '#a855f7', '#f97316', '#7c2d12'];
export const EXTRAS = ['none', 'headband', 'headset', 'glasses'];
// Clothing cut, matching the 4 designs: office shirt + tie, samurai long coat, monk robe + beads, wizard robe.
export const CUTS = ['office', 'samurai', 'monk', 'wizard'];
export const BEARDS = ['none', 'short', 'long'];
export const HATS = ['none', 'wizard'];

export const NAME_MAX = 16;
export const MAX_CUSTOM = 9;

// The 4 fighters from the character sheet. `art` / `portrait` are their realistic renders (public/sprites).
export const PRESETS = [
  { id: 'intern', preset: true, name: 'The Intern', style: 'archer', cut: 'office', skin: '#e8ac82', hair: '#4a2f1b', hairStyle: 'spiky', outfit: '#e9eef5', pants: '#2c3e8f', accent: '#d33b3b', extra: 'headband', beard: 'none', hat: 'none', art: '/sprites/intern_ready.webp', portrait: '/sprites/intern_face.webp' },
  { id: 'samurai', preset: true, name: 'Sheet Samurai', style: 'blade', cut: 'samurai', skin: '#e8ac82', hair: '#111111', hairStyle: 'bun', outfit: '#111827', pants: '#1f2937', accent: '#22c55e', extra: 'headband', beard: 'none', hat: 'none', art: '/sprites/samurai_ready.webp', portrait: '/sprites/samurai_face.webp' },
  { id: 'monk', preset: true, name: 'Chai Monk', style: 'brawler', cut: 'monk', skin: '#8d5524', hair: '#111111', hairStyle: 'bun', outfit: '#f97316', pants: '#f5e6c8', accent: '#7c2d12', extra: 'headband', beard: 'short', hat: 'none', art: '/sprites/monk_ready.webp', portrait: '/sprites/monk_face.webp' },
  { id: 'wizard', preset: true, name: 'Prompt Wizard', style: 'mage', cut: 'wizard', skin: '#f5d0b5', hair: '#e5e7eb', hairStyle: 'long', outfit: '#5b21b6', pants: '#1f2937', accent: '#f59e0b', extra: 'glasses', beard: 'long', hat: 'wizard', art: '/sprites/wizard_ready.webp', portrait: '/sprites/wizard_face.webp' },
];

const pickOne = (arr, rand) => arr[Math.floor(rand() * arr.length)];

export function randomLook(rand = Math.random) {
  return {
    style: pickOne(Object.keys(STYLES), rand),
    cut: pickOne(CUTS, rand),
    beard: pickOne(BEARDS, rand),
    hat: rand() < 0.2 ? 'wizard' : 'none',
    skin: pickOne(SKINS, rand),
    hair: pickOne(HAIR_COLORS, rand),
    hairStyle: pickOne(HAIR_STYLES, rand),
    outfit: pickOne(OUTFITS, rand),
    pants: pickOne(PANTS, rand),
    accent: pickOne(ACCENTS, rand),
    extra: pickOne(EXTRAS, rand),
  };
}

/** Clean up a fighter coming from the creator or from storage. Unknown values fall back to the Intern's. */
export function sanitizeFighter(f, fallbackName = 'Fighter') {
  const base = PRESETS[0];
  const oneOf = (v, list, d) => (list.includes(v) ? v : d);
  const name = String(f?.name ?? '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX) || fallbackName;
  return {
    id: typeof f?.id === 'string' && f.id ? f.id : `f${Date.now().toString(36)}`,
    name,
    style: oneOf(f?.style, Object.keys(STYLES), base.style),
    skin: oneOf(f?.skin, SKINS, base.skin),
    hair: oneOf(f?.hair, HAIR_COLORS, base.hair),
    hairStyle: oneOf(f?.hairStyle, HAIR_STYLES, base.hairStyle),
    outfit: oneOf(f?.outfit, OUTFITS, base.outfit),
    pants: oneOf(f?.pants, PANTS, base.pants),
    accent: oneOf(f?.accent, ACCENTS, base.accent),
    extra: oneOf(f?.extra, EXTRAS, base.extra),
    cut: oneOf(f?.cut, CUTS, 'office'),
    beard: oneOf(f?.beard, BEARDS, 'none'),
    hat: oneOf(f?.hat, HATS, 'none'),
  };
}
