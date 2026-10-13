// Blocky, voxel-style character models, built to match the character sheet. Units are "pixels" on a voxel grid.
// Each part: b(x, y, w, h, color, animClass, children, style). animClass maps to `.m-<cls>` CSS.
// Heroes face right; bosses face left (towards the hero).
import { STYLES } from './fighters.mjs';

const b = (x, y, w, h, bg, cls = '', kids = [], st = {}) => ({ x, y, w, h, bg, cls, kids, st });
// A part with a word printed on it (scaled with the model), e.g. the T-Rex's DEADLINE sign.
const label = (part, text, color) => ({ ...part, text, tc: color });
const eyes = (x1, x2, y, iris) => [b(x1, y, 2, 1, '#fff', '', [b(1, 0, 1, 1, iris)]), b(x2, y, 2, 1, '#fff', '', [b(0, 0, 1, 1, iris)])];
const glow = (c, r = 6) => ({ boxShadow: `0 0 ${r}px ${c}, 0 0 ${r * 2}px ${c}` });

// Darken (amt < 0) or lighten a #rrggbb colour.
const tint = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
  return `#${[n >> 16, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, '0')).join('')}`;
};

// ---------- Heroes ----------
const HAIR = {
  short: (c) => [b(0, 0, 8, 2, c), b(0, 2, 1, 2, c)],
  spiky: (c) => [b(0, 0, 8, 2, c), b(0, 2, 2, 2, c), b(0, -1, 2, 1, c), b(2, -2, 2, 2, tint(c, 0.06)), b(4, -1, 2, 1, c), b(6, -2, 2, 2, tint(c, -0.05)), b(7, 1, 1, 2, c)],
  long: (c) => [b(0, 0, 8, 2, c), b(0, 2, 1, 6, c), b(7, 2, 1, 3, c), b(-1, 1, 1, 9, tint(c, -0.08))],
  bun: (c) => [b(0, 0, 8, 2, c), b(0, 2, 1, 2, c), b(1, -2, 4, 2, tint(c, -0.06)), b(-2, -1, 2, 5, tint(c, -0.1))],
  cap: (c, accent) => [b(0, 2, 1, 2, c), b(0, -1, 8, 3, accent), b(5, 1, 5, 1, tint(accent, -0.15))],
  bald: () => [b(1, 0, 3, 1, 'rgba(255,255,255,.18)')],
};

const EXTRA = {
  none: () => [],
  headset: () => [b(0, 3, 8, 1, '#22d3ee'), b(-1, 3, 1, 3, '#0e7490')],
  glasses: (c) => [b(1, 3, 3, 2, c, '', [b(1, 1, 1, 1, '#fde68a')]), b(5, 3, 3, 2, c, '', [b(1, 1, 1, 1, '#fde68a')]), b(4, 3, 1, 1, c)],
  headband: (c) => [b(0, 2, 8, 1, c, '', [], glow(c, 3)), b(-3, 2, 3, 1, c, 'band'), b(-3, 3, 2, 1, tint(c, -0.15), 'band')],
};

const BEARD = {
  none: () => [],
  short: (c) => [b(0, 5, 1, 3, c), b(7, 5, 1, 3, c), b(1, 7, 6, 2, c), b(2, 6, 1, 1, c), b(5, 6, 1, 1, c)],
  long: (c) => [b(0, 5, 8, 2, c), b(1, 7, 6, 3, c), b(2, 10, 4, 2, tint(c, -0.06)), b(3, 12, 2, 1, tint(c, -0.1)), b(3, 5, 2, 1, tint(c, -0.3))],
};

const HAT = {
  none: () => [],
  wizard: (c, accent) => [
    b(-2, -1, 12, 2, tint(c, -0.12)), b(0, -4, 8, 3, c, '', [b(0, 2, 8, 1, accent)]), b(1, -7, 6, 3, tint(c, 0.04)),
    b(2, -10, 4, 3, c), b(3, -12, 3, 2, tint(c, 0.04)), b(5, -13, 3, 2, c, '', [b(2, 0, 1, 1, accent, 'glow')]),
    b(2, -6, 1, 1, accent, 'glow'), b(5, -9, 1, 1, accent, 'glow'),
  ],
};

// Weapon held in the right hand (child of the right arm, hand at y = 9..12). `g` is the style's glow colour.
const WEAPON = {
  archer: (accent, g) => [b(3, 3, 2, 17, 'transparent', 'bow', [
    b(0, 0, 1, 2, '#334155'), b(1, 2, 1, 13, '#475569', '', [], glow(g, 3)), b(0, 15, 1, 2, '#334155'), b(-1, 1, 1, 15, g, '', [], glow(g, 4)),
  ])],
  blade: (accent, g) => [b(1, -6, 2, 20, 'transparent', 'sword', [
    b(0, 0, 2, 14, tint(g, 0.45), '', [b(0, 0, 1, 14, '#ffffff')], glow(g, 6)), b(-1, 14, 4, 1, '#caa53b'), b(0, 15, 2, 4, '#1f2937', '', [b(0, 1, 2, 1, g)]),
  ])],
  brawler: (accent) => [b(-1, 8, 6, 5, accent, 'glove', [b(0, 0, 6, 1, tint(accent, 0.2))])],
  mage: (accent, g) => [b(2, -11, 1, 29, '#7a5230', 'staff', [
    b(-1, 2, 3, 1, accent), b(-2, -5, 5, 5, tint(g, 0.25), 'glow', [b(1, 1, 3, 3, '#fff', '', [], glow(g, 4))], glow(g, 8)),
  ])],
};

/** Build a hero model from a fighter look (see lib/fighters.mjs). */
export function heroModel(f) {
  const g = (STYLES[f.style] || STYLES.archer).color;
  const hand = tint(f.skin, -0.04);
  const cut = f.cut || 'office';
  const brawler = f.style === 'brawler';
  const shoe = cut === 'office' ? f.accent : cut === 'monk' ? '#7c2d12' : '#1c1917';
  const leg = (x, c) => b(x, 20, 4, 12, c, x < 8 ? 'leg-l' : 'leg-r', [b(0, 10, 4, 2, shoe, '', [b(0, 1, 4, 1, cut === 'office' ? '#f8fafc' : tint(shoe, -0.2))])]);
  const sleeve = (accentCuff) => (accentCuff ? [b(0, 8, 4, 1, accentCuff)] : []);
  const leftHand = brawler ? b(-1, 8, 6, 5, f.accent, 'glove') : b(0, 9, 4, 3, hand);

  const torsoKids = {
    office: [b(3, 0, 2, 2, '#f8fafc'), b(3, 1, 2, 8, f.accent), b(5, 5, 2, 3, '#f8fafc', '', [b(0, 0, 2, 1, '#38bdf8')]), b(0, 10, 8, 2, '#3f2a1d', '', [b(3, 0, 2, 2, '#caa53b')])],
    samurai: [b(3, 0, 2, 6, '#e5e7eb'), b(2, 0, 1, 9, f.accent), b(5, 0, 1, 9, f.accent), b(0, 9, 8, 1, f.accent, '', [], glow(f.accent, 2)), b(0, 10, 8, 2, '#0b0f19')],
    monk: [
      b(0, 0, 8, 12, 'transparent', '', [], { background: 'linear-gradient(135deg, transparent 38%, #f5e6c8 38% 56%, transparent 56%)' }),
      ...[[1, 1], [2, 2], [3, 3], [4, 3], [5, 2], [6, 1]].map(([x, y]) => b(x, y, 1, 1, '#3f2a1d')), b(3, 4, 2, 2, '#7c2d12'),
      b(0, 9, 8, 2, '#3f2a1d', '', [b(1, 0, 2, 2, '#57534e'), b(5, 0, 2, 2, '#57534e')]),
    ],
    wizard: [b(3, 0, 2, 12, f.accent), b(0, 9, 8, 1, '#3f2a1d', '', [b(3, 0, 2, 1, f.accent)]), b(1, 2, 1, 1, f.accent, 'glow'), b(6, 4, 1, 2, '#e5e7eb')],
  }[cut];

  const parts = [];
  // Behind the body: the archer's quiver, the samurai's ponytail ribbon
  if (f.style === 'archer') parts.push(b(1, 3, 3, 13, '#6b4423', '', [b(0, 0, 3, 1, '#3f2a1d'), b(0, -3, 1, 3, g, '', [], glow(g, 3)), b(2, -4, 1, 4, g, '', [], glow(g, 3)), b(1, -2, 1, 2, '#e2e8f0')]));
  parts.push(leg(4, f.pants));
  parts.push(b(0, 8, 4, 12, f.outfit, 'arm-l', [...sleeve(cut === 'wizard' ? f.accent : cut === 'samurai' ? f.accent : null), ...(cut === 'monk' ? [b(0, 5, 4, 4, f.skin)] : []), leftHand,
    ...(cut === 'monk' && !brawler ? [b(-1, 9, 3, 3, '#f8fafc', '', [b(0, 0, 3, 1, '#b45309')])] : [])]));
  parts.push(b(4, 8, 8, 12, f.outfit, 'torso', torsoKids));
  parts.push(leg(8, tint(f.pants, -0.06)));
  // Long coats and robes hang in front of the legs
  if (cut === 'samurai') parts.push(b(3, 19, 10, 7, f.outfit, '', [b(4, 0, 2, 7, tint(f.outfit, 0.06)), b(0, 6, 10, 1, f.accent)]));
  if (cut === 'wizard') parts.push(b(3, 19, 10, 11, f.outfit, '', [b(4, 0, 2, 11, f.accent), b(0, 10, 10, 1, f.accent), b(1, 3, 1, 1, f.accent, 'glow'), b(8, 6, 1, 1, f.accent, 'glow')]));
  if (cut === 'monk') parts.push(b(3, 19, 10, 3, f.outfit, '', [b(0, 2, 10, 1, tint(f.outfit, -0.15))]));
  const beardColor = f.beard === 'long' && f.hair === '#111111' ? '#2b2b2b' : f.hair;
  const headwear = (f.hat || 'none') === 'wizard' ? HAT.wizard(f.outfit, f.accent) : (HAIR[f.hairStyle] || HAIR.short)(f.hair, f.accent);
  parts.push(b(4, 0, 8, 8, f.skin, 'head', [
    ...((f.hat || 'none') === 'wizard' ? [b(0, 0, 8, 1, f.hair), b(0, 1, 1, 4, f.hair), b(-1, 1, 1, 6, f.hair)] : []),
    ...headwear,
    ...eyes(1, 5, 4, cut === 'wizard' ? '#f59e0b' : '#2b4fd1'),
    b(3, 6, 2, 1, tint(f.skin, -0.3)),
    ...(BEARD[f.beard || 'none'] || BEARD.none)(beardColor),
    ...(f.extra === 'glasses' ? EXTRA.glasses(cut === 'wizard' ? f.accent : '#111') : (EXTRA[f.extra] || EXTRA.none)(g)),
  ]));
  parts.push(b(12, 8, 4, 12, f.outfit, 'arm-r', [...sleeve(cut === 'wizard' || cut === 'samurai' ? f.accent : null), ...(cut === 'monk' ? [b(0, 5, 4, 4, f.skin)] : []), b(0, 9, 4, 3, hand), ...(WEAPON[f.style] || WEAPON.archer)(f.accent, g)]));
  return { w: 16, h: 32, parts };
}

const hero = heroModel({ style: 'archer', cut: 'office', skin: '#e8ac82', hair: '#4a2f1b', hairStyle: 'spiky', outfit: '#e9eef5', pants: '#2c3e8f', accent: '#d33b3b', extra: 'headband', beard: 'none', hat: 'none' });

// ---------- Bosses ----------
// Inbox Hydra: three cyan heads on an envelope body.
const hydra = {
  w: 26, h: 30,
  parts: [
    ...[[5, 6, 12, 0], [11, 1, 17, 0.35], [17, 6, 12, 0.7]].map(([x, y, h, d]) =>
      b(x, y, 3, h, '#0e9fbf', 'neck', [
        b(-3, -5, 9, 6, '#22d3ee', 'nhead', [
          b(0, 0, 9, 1, '#67e8f9'),
          b(1, 1, 2, 2, '#fff', '', [b(0, 1, 1, 1, '#111')]),
          b(6, 1, 2, 2, '#fff', '', [b(1, 1, 1, 1, '#111')]),
          b(1, 4, 7, 1, '#7f1d1d', 'jaw', [b(1, 0, 1, 1, '#fff'), b(5, 0, 1, 1, '#fff')]),
        ]),
      ], { animationDelay: `${-d}s` })
    ),
    b(4, 17, 18, 11, '#eef2f6', 'torso', [
      b(0, 0, 18, 6, 'transparent', '', [], { background: 'linear-gradient(160deg, transparent 46%, #8b98a5 46% 56%, transparent 56%), linear-gradient(20deg, transparent 46%, #8b98a5 46% 56%, transparent 56%)' }),
      b(15, -2, 5, 4, '#ef4444', 'badge'),
    ]),
    b(-3, 12, 5, 4, '#f8fafc', 'orbit', [b(0, 0, 5, 1, '#94a3b8')], { animationDelay: '-1s' }),
    b(23, 10, 5, 4, '#f8fafc', 'orbit', [b(0, 0, 5, 1, '#94a3b8')], { animationDelay: '-2.2s' }),
    b(6, 28, 3, 2, '#0e7490', 'leg-l'), b(17, 28, 3, 2, '#0e7490', 'leg-r'),
  ],
};

// Meeting Golem: a hulking block-man in a suit, ringed by floating meeting screens.
const screen = (x, y, d) => b(x, y, 7, 5, '#e11d48', 'orbit', [b(1, 1, 5, 3, '#fff1f2', '', [b(0, 0, 5, 1, '#f43f5e'), b(1, 2, 1, 1, '#9f1239'), b(3, 2, 1, 1, '#9f1239')])], { animationDelay: `${d}s`, ...glow('#f43f5e', 4) });
const golem = {
  w: 24, h: 32,
  parts: [
    screen(-6, 2, 0), screen(19, -1, -1.1), screen(21, 14, -2.2),
    b(6, 22, 5, 10, '#27272a', 'leg-l', [b(0, 8, 5, 2, '#0a0a0a')]),
    b(1, 9, 5, 14, '#27272a', 'arm-l', [b(0, 0, 5, 3, '#3f3f46'), b(0, 11, 5, 4, '#9f1239', '', [b(0, 0, 5, 1, '#be123c')])]),
    b(5, 9, 14, 13, '#27272a', 'torso', [
      b(5, 0, 4, 7, '#f4f4f5'), b(6, 1, 2, 8, '#e11d48'), b(1, 1, 3, 1, '#3f3f46'), b(10, 1, 3, 1, '#3f3f46'),
      b(10, 3, 3, 2, '#f43f5e', 'glow'), b(0, 11, 14, 2, '#18181b', '', [b(6, 0, 2, 2, '#a1a1aa')]),
    ]),
    b(13, 22, 5, 10, '#1f1f23', 'leg-r', [b(0, 8, 5, 2, '#0a0a0a')]),
    b(6, 0, 12, 9, '#9f1239', 'head', [
      b(0, 0, 12, 2, '#18181b'), b(10, 2, 2, 3, '#18181b'), b(0, 2, 1, 1, '#18181b'),
      b(1, 4, 4, 2, '#fff', 'glow'), b(7, 4, 4, 2, '#fff', 'glow'), b(1, 3, 4, 1, '#450a0a'), b(7, 3, 4, 1, '#450a0a'),
      b(3, 7, 6, 1, '#450a0a', 'jaw'),
    ]),
    b(18, 9, 5, 14, '#27272a', 'arm-r', [b(0, 0, 5, 3, '#3f3f46'), b(0, 11, 5, 4, '#9f1239'), b(-5, 9, 7, 6, '#e11d48', 'prop', [b(1, 1, 5, 4, '#fff1f2', '', [b(0, 0, 5, 1, '#f43f5e')])])]),
  ],
};

// Micromanager Drone: a yellow-and-black quad drone with a face screen and camera pods.
const pod = (x, y, d, cam) => b(x, y, 6, 4, '#facc15', '', [
  b(0, 0, 6, 1, '#1c1917'), b(-1, -2, 8, 1, '#e5e7eb', 'rotor', [], { animationDelay: `${d}s` }), b(2, -1, 2, 1, '#1c1917'),
  ...(cam ? [b(1, 3, 4, 3, '#1c1917', '', [b(1, 1, 2, 1, '#ef4444', 'glow')])] : []),
]);
const drone = {
  w: 28, h: 24,
  parts: [
    b(5, 7, 6, 2, '#1c1917'), b(17, 7, 6, 2, '#1c1917'), b(5, 15, 6, 2, '#1c1917'), b(17, 15, 6, 2, '#1c1917'),
    pod(0, 5, 0, false), pod(22, 5, -0.05, false), pod(0, 14, -0.03, true), pod(22, 14, -0.08, true),
    b(13, 0, 2, 4, '#1c1917', '', [b(0, -1, 2, 1, '#ef4444', 'glow')]),
    b(9, 4, 10, 14, '#facc15', 'torso', [
      b(0, 0, 10, 2, '#1c1917'), b(0, 12, 10, 2, '#1c1917'),
      b(1, 3, 8, 7, '#0f172a', '', [b(1, 2, 2, 2, '#4ade80', 'glow'), b(5, 2, 2, 2, '#4ade80', 'glow'), b(2, 5, 4, 1, '#4ade80'), b(0, 0, 8, 1, '#1e293b')]),
      b(-1, 5, 1, 3, '#1c1917'), b(10, 5, 1, 3, '#1c1917'),
    ]),
    b(11, 18, 2, 4, '#1c1917', 'arm-l', [b(-1, 3, 2, 2, '#71717a')]),
    b(15, 18, 2, 4, '#1c1917', 'arm-r', [b(1, 3, 2, 2, '#71717a')]),
    b(12, 18, 4, 3, '#27272a', 'jaw', [b(1, 1, 2, 1, '#ef4444', 'glow')]),
  ],
};

// Deadline T-Rex: a red block dinosaur with a DEADLINE sign on its back.
const trex = {
  w: 38, h: 30,
  parts: [
    b(25, 11, 13, 5, '#b91c1c', 'tail', [b(8, 1, 5, 3, '#991b1b'), b(3, -1, 2, 1, '#7f1d1d'), b(8, -1, 2, 1, '#7f1d1d')]),
    b(21, 20, 5, 10, '#991b1b', 'leg-r', [b(-1, 8, 6, 2, '#450a0a', '', [b(0, 1, 1, 1, '#fef3c7')])]),
    b(12, 8, 15, 14, '#dc2626', 'torso', [
      b(1, 7, 10, 6, '#fde68a', '', [b(0, 2, 10, 1, '#fcd34d'), b(0, 4, 10, 1, '#fcd34d')]),
      b(4, -2, 2, 2, '#7f1d1d'), b(8, -2, 2, 2, '#7f1d1d'), b(12, -1, 2, 2, '#7f1d1d'),
      label(b(5, 0, 11, 4, '#f8fafc', '', [b(0, -3, 1, 3, '#78716c'), b(10, -3, 1, 3, '#78716c')], { transform: 'rotate(-6deg)' }), 'DEADLINE', '#dc2626'),
    ]),
    b(14, 20, 5, 10, '#b91c1c', 'leg-l', [b(-1, 8, 6, 2, '#450a0a', '', [b(0, 1, 1, 1, '#fef3c7')])]),
    b(10, 13, 3, 5, '#b91c1c', 'arm-r', [b(-1, 4, 2, 1, '#fef3c7')]),
    b(0, 1, 16, 10, '#dc2626', 'head', [
      b(0, 0, 16, 1, '#ef4444'), b(4, 2, 3, 2, '#fde047', 'glow', [b(0, 0, 1, 2, '#111')]), b(3, 1, 5, 1, '#7f1d1d'),
      b(0, 3, 1, 1, '#450a0a'), b(1, 6, 1, 1, '#fff'), b(4, 6, 1, 1, '#fff'), b(7, 6, 1, 1, '#fff'), b(10, 6, 1, 1, '#fff'),
      b(0, 7, 14, 4, '#991b1b', 'jaw', [b(1, 0, 1, 1, '#fff'), b(4, 0, 1, 1, '#fff'), b(7, 0, 1, 1, '#fff'), b(10, 0, 1, 1, '#fff'), b(0, 2, 13, 1, '#7f1d1d')]),
    ]),
  ],
};

// CEO Final Form: crown, shades, sharp suit, and golden robot arms holding growth charts.
const chart = (c) => b(-2, 12, 7, 6, '#fde047', '', [b(1, 1, 5, 4, '#fffbeb', '', [b(0, 3, 1, 1, c), b(1, 2, 1, 2, c), b(2, 1, 1, 3, c), b(3, 0, 1, 4, c)])]);
const ceo = {
  w: 24, h: 36,
  parts: [
    b(-2, 8, 3, 13, '#ca8a04', 'mecha', [b(0, 0, 3, 2, '#fde047'), chart('#16a34a')]),
    b(22, 6, 3, 13, '#ca8a04', 'mecha', [b(0, 0, 3, 2, '#fde047'), chart('#7c3aed')], { animationDelay: '-.8s' }),
    b(7, 23, 4, 13, '#18181b', 'leg-l', [b(0, 11, 5, 2, '#0a0a0a')]),
    b(3, 11, 4, 13, '#18181b', 'arm-l', [b(0, 0, 4, 1, '#c084fc'), b(0, 10, 4, 3, '#e8ac82')]),
    b(7, 11, 10, 12, '#18181b', 'torso', [
      b(3, 0, 4, 6, '#f8fafc'), b(4, 0, 2, 9, '#dc2626'), b(0, 0, 1, 12, '#c084fc', '', [], glow('#c084fc', 3)), b(9, 0, 1, 12, '#c084fc', '', [], glow('#c084fc', 3)),
      b(7, 4, 2, 3, '#f8fafc', '', [b(0, 0, 2, 1, '#7c3aed')]), b(1, 3, 2, 1, '#fde047'),
    ]),
    b(13, 23, 4, 13, '#0f0f12', 'leg-r', [b(0, 11, 5, 2, '#0a0a0a')]),
    b(7, 2, 10, 9, '#e8ac82', 'head', [
      b(0, 0, 10, 2, '#1c1917'), b(9, 2, 1, 3, '#1c1917'), b(8, 1, 2, 1, '#292524'),
      b(0, 4, 7, 2, '#0a0a0a', '', [b(1, 0, 2, 1, '#6b7280')]), b(7, 4, 2, 1, '#0a0a0a'),
      b(1, 7, 3, 1, '#9a3412'),
      b(1, -3, 8, 3, '#facc15', 'glow', [b(0, -1, 1, 1, '#facc15'), b(3, -2, 2, 2, '#facc15'), b(7, -1, 1, 1, '#facc15'), b(1, 1, 1, 1, '#ef4444'), b(4, 1, 1, 1, '#a855f7'), b(6, 1, 1, 1, '#22c55e')], glow('#facc15', 4)),
    ]),
    b(17, 11, 4, 13, '#18181b', 'arm-r', [b(0, 0, 4, 1, '#c084fc'), b(0, 10, 4, 3, '#e8ac82')]),
  ],
};

export const MOBS = { hero, hydra, golem, drone, trex, ceo };
