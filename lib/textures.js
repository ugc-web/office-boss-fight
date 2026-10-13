// Minecraft-style 16x16 block textures, generated as tiny SVG data URIs (no image files).
// Deterministic (seeded), so server and client render identical markup.

function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

const NOISE = {
  dirt: ['#866043', '#79553a', '#96704f', '#5d4128', '#6c4a30'],
  stone: ['#7f7f7f', '#747474', '#8f8f8f', '#686868', '#878787'],
  deepslate: ['#3d3d43', '#47474f', '#323238', '#2a2a30'],
  prismarine: ['#63a28f', '#5a9a8a', '#4f8c7c', '#76b5a0', '#3f7a6c'],
  sand: ['#dbd3a0', '#d4cb95', '#e3dbb0', '#c9bf88'],
  netherrack: ['#6f3534', '#7b3a38', '#5c2b2a', '#8a4644', '#4f2322'],
  purpur: ['#a77ba7', '#9a6c9a', '#b48bb4', '#8c5e8c'],
  grassTop: ['#5f9f35', '#6aad3d', '#559230', '#79bd48'],
  leaves: ['#3f7f1f', '#4a8f27', '#2f6a17', '#58a030', '#00000000'],
  endstone: ['#dbe0a4', '#d0d596', '#e6eab4', '#c4c98a', '#eef0c0'],
  water: ['#2f5fd0', '#3366d6', '#2a56c0', '#3b70e0'],
  obsidian: ['#140f1f', '#1d1530', '#0d0a14', '#2b1f45'],
  soulsand: ['#51402f', '#5c4935', '#463626', '#3d2f21'],
  mud: ['#3c3837', '#46403e', '#34302f', '#524a46'],
};

function pixels(name) {
  const r = rng([...name].reduce((a, c) => a * 31 + c.charCodeAt(0), 7));
  const pick = (pal) => pal[Math.floor(r() * pal.length)];
  const px = [];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let c;
      if (name === 'grass') {
        const edge = 3 + ((x * 7 + 3) % 3 === 0 ? 1 : 0) + (r() < 0.25 ? 1 : 0);
        c = y < edge ? pick(NOISE.grassTop) : pick(NOISE.dirt);
      } else if (name === 'planks') {
        const line = y % 4 === 3;
        const seam = (y >> 2) % 2 ? x === 11 : x === 4;
        c = line || seam ? '#6b5233' : pick(['#b8945f', '#a07c4a', '#ab8651', '#c29d62']);
      } else if (name === 'bricks') {
        const line = y % 8 === 7 || (y < 8 ? x === 7 : x === 15);
        c = line ? '#4f4f4f' : pick(['#7a7a7a', '#727272', '#848484', '#6c6c6c']);
      } else if (name === 'glass') {
        const frame = x === 0 || y === 0 || x === 15 || y === 15;
        const shine = (x === y + 3 || x === y + 4) && x < 10;
        c = frame ? '#d6e9ef' : shine ? '#ffffffaa' : '#9fd3e655';
      } else if (name === 'lava') {
        c = pick(['#d45a12', '#e8781a', '#f59a2a', '#cf4a0e', '#fcc54a']);
      } else {
        c = pick(NOISE[name] || NOISE.stone);
      }
      px.push(c);
    }
  }
  return px;
}

const cache = {};
export function texUrl(name) {
  if (cache[name]) return cache[name];
  const rects = pixels(name)
    .map((c, i) => `<rect x="${i % 16}" y="${Math.floor(i / 16)}" width="1" height="1" fill="${c}"/>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">${rects}</svg>`;
  return (cache[name] = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
}

/** Inline style that tiles a block texture. `size` = rendered block size in px. */
export function tex(name, size = 48, extra = {}) {
  return { backgroundImage: texUrl(name), backgroundSize: `${size}px ${size}px`, imageRendering: 'pixelated', ...extra };
}
