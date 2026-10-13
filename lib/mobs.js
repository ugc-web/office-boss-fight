// Blocky, Minecraft-style character models. Units are "pixels" on a voxel grid.
// Each part: b(x, y, w, h, color, animClass, children, style). animClass maps to `.m-<cls>` CSS.

const b = (x, y, w, h, bg, cls = '', kids = [], st = {}) => ({ x, y, w, h, bg, cls, kids, st });
const eyes = (x1, x2, y, iris) => [b(x1, y, 2, 1, '#fff', '', [b(1, 0, 1, 1, iris)]), b(x2, y, 2, 1, '#fff', '', [b(0, 0, 1, 1, iris)])];

const hero = {
  w: 16, h: 32,
  parts: [
    b(4, 20, 4, 12, '#2c3e8f', 'leg-l', [b(0, 10, 4, 2, '#3a2a1c')]),
    b(0, 8, 4, 12, '#e9eef5', 'arm-l', [b(0, 9, 4, 3, '#e0a77c')]),
    b(4, 8, 8, 12, '#e9eef5', 'torso', [b(3, 0, 2, 9, '#d33b3b'), b(5, 6, 2, 3, '#2dd4bf')]),
    b(8, 20, 4, 12, '#24347a', 'leg-r', [b(0, 10, 4, 2, '#2e2116')]),
    b(4, 0, 8, 8, '#e8ac82', 'head', [
      b(0, 0, 8, 2, '#4a2f1b'), b(0, 2, 1, 2, '#4a2f1b'), b(0, 3, 8, 1, '#22d3ee'),
      ...eyes(1, 5, 4, '#2b4fd1'), b(3, 6, 2, 1, '#9c5b3c'),
    ]),
    b(12, 8, 4, 12, '#e9eef5', 'arm-r', [
      b(0, 9, 4, 3, '#e0a77c'),
      b(3, 3, 2, 17, 'transparent', 'bow', [
        b(0, 0, 1, 2, '#7a5230'), b(1, 2, 1, 13, '#8b5e34'), b(0, 15, 1, 2, '#7a5230'), b(-1, 1, 1, 15, '#d4d4d4'),
      ]),
    ]),
  ],
};

const hydra = {
  w: 26, h: 30,
  parts: [
    ...[[5, 6, 12, 0], [11, 1, 17, 0.35], [17, 6, 12, 0.7]].map(([x, y, h, d]) =>
      b(x, y, 3, h, '#0e9fbf', 'neck', [
        b(-3, -5, 9, 6, '#22d3ee', 'nhead', [
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
    b(6, 28, 3, 2, '#0e7490', 'leg-l'), b(17, 28, 3, 2, '#0e7490', 'leg-r'),
  ],
};

const excel = {
  w: 22, h: 22,
  parts: [
    b(0, 0, 22, 22, 'rgba(74,222,128,.7)', 'slime', [
      b(0, 0, 22, 22, 'transparent', '', [], { background: 'repeating-linear-gradient(90deg, transparent 0 18%, rgba(20,83,45,.55) 18% 20%), repeating-linear-gradient(0deg, transparent 0 18%, rgba(20,83,45,.55) 18% 20%)' }),
      b(5, 5, 12, 12, '#15803d', 'core', [
        b(1, 2, 3, 3, '#0b1f12', 'glow', [b(0, 0, 1, 1, '#bbf7d0')]),
        b(8, 2, 3, 3, '#0b1f12', 'glow', [b(0, 0, 1, 1, '#bbf7d0')]),
        b(3, 8, 6, 2, '#7f1d1d', 'jaw'),
      ]),
    ]),
  ],
};

const demon = {
  w: 16, h: 42,
  parts: [
    b(5, 21, 2, 21, '#1c1022', 'leg-l'),
    b(9, 21, 2, 21, '#1c1022', 'leg-r'),
    b(2, 9, 2, 22, '#2a1a33', 'arm-l'),
    b(4, 9, 8, 12, '#241530', 'torso', [b(3, 0, 2, 9, '#a855f7')]),
    b(12, 9, 2, 22, '#2a1a33', 'arm-r', [
      b(-5, 18, 8, 8, '#f8fafc', 'prop', [b(0, 0, 8, 2, '#dc2626'), b(1, 3, 1, 1, '#555'), b(3, 3, 1, 1, '#555'), b(5, 3, 1, 1, '#555'), b(1, 5, 1, 1, '#555'), b(3, 5, 1, 1, '#a855f7')]),
    ]),
    b(4, 1, 8, 8, '#160c1b', 'head', [
      b(0, -2, 1, 3, '#e5e7eb'), b(7, -2, 1, 3, '#e5e7eb'),
      b(0, 4, 3, 1, '#e879f9', 'glow'), b(5, 4, 3, 1, '#e879f9', 'glow'),
    ]),
  ],
};

const phantom = {
  w: 22, h: 28,
  parts: [
    ...[1, 4, 7, 10, 13, 16, 19].map((x, i) => b(x, 15, 2, 7 + ((i * 5) % 6), '#f5f5f4', 'tentacle', [], { animationDelay: `${-i * 0.18}s` })),
    b(0, 0, 22, 17, '#f5f5f4', 'torso', [
      b(2, 2, 18, 3, '#ea580c'),
      b(4, 7, 4, 2, '#3f3f46'), b(14, 7, 4, 2, '#3f3f46'),
      b(5, 9, 2, 2, '#ef4444', 'glow'), b(15, 9, 2, 2, '#ef4444', 'glow'),
      b(8, 12, 6, 3, '#3f3f46', 'jaw'),
      b(17, 12, 1, 3, '#fb923c'), b(19, 10, 1, 5, '#fb923c'), b(2, 13, 1, 2, '#60a5fa'), b(3, 11, 1, 4, '#60a5fa'),
    ]),
  ],
};

const dragon = {
  w: 36, h: 30,
  parts: [
    b(25, 17, 11, 4, '#7f1d1d', 'tail', [b(9, -2, 2, 2, '#fde047')]),
    b(15, 0, 12, 13, '#7f1d1d', 'wing-b', [], { clipPath: 'polygon(0 100%, 30% 0, 100% 20%, 100% 100%)' }),
    b(10, 11, 18, 12, '#b91c1c', 'torso', [b(2, 6, 12, 6, '#f59e0b')]),
    b(12, 23, 4, 7, '#7f1d1d', 'leg-l', [b(0, 5, 5, 2, '#1c1917')]),
    b(22, 23, 4, 7, '#7f1d1d', 'leg-r', [b(0, 5, 5, 2, '#1c1917')]),
    b(0, 5, 13, 9, '#dc2626', 'head', [
      b(10, -3, 2, 3, '#fde68a'), b(7, -2, 2, 2, '#fde68a'),
      b(3, 2, 3, 2, '#fde047', 'glow', [b(0, 0, 1, 2, '#111')]),
      b(0, 5, 2, 1, '#111'),
      b(1, 8, 11, 3, '#991b1b', 'jaw', [b(1, 0, 1, 1, '#fff'), b(4, 0, 1, 1, '#fff'), b(7, 0, 1, 1, '#fff')]),
    ]),
    b(17, -2, 14, 15, '#dc2626', 'wing', [], { clipPath: 'polygon(0 100%, 20% 0, 100% 10%, 85% 100%)' }),
  ],
};

export const MOBS = { hero, hydra, excel, demon, phantom, dragon };
