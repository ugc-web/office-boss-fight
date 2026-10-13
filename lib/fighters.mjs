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
    blurb: 'Hits from range. Checks every shot twice.',
    fx: 'arrow',
    moves: [
      { name: 'Quick Draw', kind: 'shot', hits: 1, tier: 1 },
      { name: 'Backflip Shot', kind: 'teleport', hits: 1, tier: 1 },
      { name: 'Triple-Check Volley', kind: 'shot', hits: 3, tier: 2 },
      { name: 'Point-Blank Prompt', kind: 'dash', hits: 2, tier: 2 },
      { name: 'Fact-Check Piercer', kind: 'beam', hits: 1, tier: 3 },
      { name: 'Arrow Rain of Clarity', kind: 'rain', hits: 6, tier: 3 },
    ],
    ultimate: 'AI Overlord Barrage',
  },
  blade: {
    label: 'Prompt Samurai',
    icon: '⚔️',
    blurb: 'Fast and precise. Cuts long emails down to size.',
    fx: 'slash',
    moves: [
      { name: 'Quick Slash', kind: 'dash', hits: 1, tier: 1 },
      { name: 'Shadow Step', kind: 'teleport', hits: 2, tier: 1 },
      { name: 'Launcher Slash', kind: 'uppercut', hits: 2, tier: 2 },
      { name: 'Whirlwind Edit', kind: 'spin', hits: 4, tier: 2 },
      { name: 'Wave Slash', kind: 'beam', hits: 1, tier: 3 },
      { name: 'Sky Splitter', kind: 'slam', hits: 1, tier: 3 },
    ],
    ultimate: 'Thousand-Cut Summary',
  },
  brawler: {
    label: 'Chai Brawler',
    icon: '👊',
    blurb: 'Up close and powered by chai. Never skips leg day.',
    fx: 'fist',
    moves: [
      { name: 'Jab-Jab-Summarise', kind: 'dash', hits: 3, tier: 1 },
      { name: 'Focus Blast', kind: 'shot', hits: 1, tier: 1 },
      { name: 'Fact-Check Uppercut', kind: 'uppercut', hits: 1, tier: 2 },
      { name: 'Hurricane Kick', kind: 'spin', hits: 5, tier: 2 },
      { name: 'Chai-Powered Ground Pound', kind: 'slam', hits: 1, tier: 3 },
      { name: 'Hundred-Fist Rush', kind: 'dash', hits: 8, tier: 3 },
    ],
    ultimate: 'Final Chai Fury',
  },
  mage: {
    label: 'Data Wizard',
    icon: '🪄',
    blurb: 'Bends numbers and words with a wave of the staff.',
    fx: 'orb',
    moves: [
      { name: 'Spark Bolt', kind: 'shot', hits: 1, tier: 1 },
      { name: 'Blink Strike', kind: 'teleport', hits: 1, tier: 1 },
      { name: 'Chain Lightning', kind: 'beam', hits: 3, tier: 2 },
      { name: 'Data Storm', kind: 'summon', hits: 4, tier: 2 },
      { name: 'Meteor Shower', kind: 'rain', hits: 5, tier: 3 },
      { name: 'Gravity Slam', kind: 'slam', hits: 1, tier: 3 },
    ],
    ultimate: 'Supernova Summary',
  },
};

// Creator palettes
export const SKINS = ['#f5d0b5', '#e8ac82', '#c68642', '#8d5524', '#5c3a21'];
export const HAIR_COLORS = ['#4a2f1b', '#111111', '#d4a64a', '#a33b1c', '#e5e7eb', '#7c3aed', '#ec4899'];
export const HAIR_STYLES = ['short', 'long', 'bun', 'spiky', 'cap', 'bald'];
export const OUTFITS = ['#e9eef5', '#2563eb', '#dc2626', '#16a34a', '#111827', '#f59e0b', '#7c3aed', '#db2777'];
export const PANTS = ['#2c3e8f', '#1f2937', '#57534e', '#0f766e', '#7f1d1d'];
export const ACCENTS = ['#d33b3b', '#22d3ee', '#facc15', '#a855f7', '#16a34a', '#f97316'];
export const EXTRAS = ['none', 'headset', 'glasses', 'headband'];

export const NAME_MAX = 16;
export const MAX_CUSTOM = 9;

export const PRESETS = [
  { id: 'intern', preset: true, name: 'The Intern', style: 'archer', skin: '#e8ac82', hair: '#4a2f1b', hairStyle: 'short', outfit: '#e9eef5', pants: '#2c3e8f', accent: '#d33b3b', extra: 'headset' },
  { id: 'samurai', preset: true, name: 'Sheet Samurai', style: 'blade', skin: '#c68642', hair: '#111111', hairStyle: 'bun', outfit: '#111827', pants: '#1f2937', accent: '#d33b3b', extra: 'headband' },
  { id: 'monk', preset: true, name: 'Chai Monk', style: 'brawler', skin: '#8d5524', hair: '#111111', hairStyle: 'bald', outfit: '#f59e0b', pants: '#57534e', accent: '#16a34a', extra: 'none' },
  { id: 'wizard', preset: true, name: 'Prompt Wizard', style: 'mage', skin: '#f5d0b5', hair: '#e5e7eb', hairStyle: 'long', outfit: '#7c3aed', pants: '#1f2937', accent: '#facc15', extra: 'glasses' },
];

const pickOne = (arr, rand) => arr[Math.floor(rand() * arr.length)];

export function randomLook(rand = Math.random) {
  return {
    style: pickOne(Object.keys(STYLES), rand),
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
  };
}
