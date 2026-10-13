// Hand-made pixel-art sprites rendered as crisp SVG rects (no image assets).
// Each map is an array of rows; each char is a palette key ('.' = transparent).

const SPRITES = {
  hero: {
    palette: { k: '#0b0b14', h: '#3b2416', g: '#22d3ee', s: '#f1b48a', w: '#f8fafc', t: '#ef4444', p: '#1e3a8a', b: '#a16207', c: '#67e8f9', e: '#0b0b14', d: '#cbd5e1' },
    map: [
      '.....hhhhh.......',
      '....hhhhhhhh.....',
      '....gggggggg..b..',
      '....sseesses...b.',
      '....ssssssss...b.',
      '.....ssddss....bb',
      '.....wwwtww.....b',
      '...wwwwwtwwwcccbc',
      '..ss.wwwtww.....b',
      '.....wwwtww.....b',
      '.....wwwwww....bb',
      '.....pppppp....b.',
      '.....ppp.ppp..b..',
      '.....ppp.ppp.b...',
      '....kkkk.kkkk....',
    ],
  },
  hydra: {
    palette: { c: '#0891b2', C: '#22d3ee', k: '#0b0b14', w: '#f8fafc', r: '#ef4444', W: '#e2e8f0', l: '#94a3b8' },
    map: [
      '.CC.......CC.......CC.',
      'CwkC.....CwkC.....CwkC',
      'CCCC.....CCCC.....CCCC',
      'CrrC.....CrrC.....CrrC',
      '.CC.......CC.......CC.',
      '.cC.......cC......Cc..',
      '..cC......cC.....Cc...',
      '...cC.....cC....Cc....',
      '....cC....cC...Cc.....',
      '.....cCCCCCCCCCCc.....',
      '....cWWWWWWWWWWWWc....',
      '....cWlWWWWWWWWlWc....',
      '....cWWlWWWWWWlWWc....',
      '....cWWWlWWWWlWWWc....',
      '....cWWWWllllWWWWc....',
      '....cWWWWWWWWWWWWc....',
      '....cccccccccccccc....',
      '.....cc........cc.....',
      '....ccc........ccc....',
    ],
  },
  excel: {
    palette: { g: '#15803d', G: '#4ade80', l: '#166534', w: '#f8fafc', k: '#0b0b14', r: '#ef4444' },
    map: [
      '...g............g...',
      '..ggg..........ggg..',
      '.gggggggggggggggggg.',
      '.gGGGlGGGlGGGlGGGGg.',
      '.gGwwlGGGlGGGlwwGGg.',
      '.gGwklGGGlGGGlkwGGg.',
      '.glllllllllllllllllg',
      '.gGGGlGGGlGGGlGGGGg.',
      '.gkkkkkkkkkkkkkkkkg.',
      '.gkwkwkwkwkwkwkwkkg.',
      '.gkkrrrrrrrrrrrrkkg.',
      '.gkkwkwkwkwkwkwkwkg.',
      '.glllllllllllllllllg',
      '.gGGGlGGGlGGGlGGGGg.',
      '.gggggggggggggggggg.',
      '..gg............gg..',
      '.ggg............ggg.',
    ],
  },
  demon: {
    palette: { h: '#f8fafc', p: '#6b21a8', P: '#a855f7', y: '#fde047', k: '#0b0b14', w: '#f8fafc', W: '#e2e8f0', r: '#ef4444', n: '#334155' },
    map: [
      '.h................h.',
      '.hh..............hh.',
      '..hh............hh..',
      '...pppppppppppppp...',
      '..pPPPPPPPPPPPPPPp..',
      '..pPyyPPPPPPPPyyPp..',
      '..pPykPPPPPPPPkyPp..',
      '..pPPPPPPPPPPPPPPp..',
      '..pPPkkkkkkkkkkPPp..',
      '..pPPkwkwkwkwkkPPp..',
      '..pPPPkkkkkkkkPPPp..',
      '...pppppppppppppp...',
      '.....nnnnnnnnnn.....',
      '..PPWWWWWWWWWWWWPP..',
      '..PPWrrrrrrrrrrWPP..',
      '....WWkWWkWWkWWW....',
      '....WWWWWWWWWWWW....',
      '....WWkWWkWWkWWW....',
      '....WWWWWWWWWWWW....',
    ],
  },
  phantom: {
    palette: { o: '#ea580c', O: '#fb923c', k: '#0b0b14', w: '#f8fafc', W: '#f1f5f9', b: '#3b82f6', y: '#fde047' },
    map: [
      '......OOOOOOOO......',
      '....OOOOOOOOOOOO....',
      '...OOOOOOOOOOOOOO...',
      '..OOOkkOOOOOOkkOOO..',
      '..OOOkyOOOOOOkyOOO..',
      '..OOOOOOOOOOOOOOOO..',
      '..OOOOOOOkkOOOOOOO..',
      '..OOOOOOkwwkOOOOOO..',
      '..OOOOOOOkkOOOOOOO..',
      '..oWWWWWWWWWWWWWWo..',
      '..oWbbbbbbWWWWWWWo..',
      '..oWWWWWWWWbbbbbWo..',
      '..oWbbbbWWWWWWWWWo..',
      '..oWWWWWWWWWWWWWWo..',
      '..oOOOOOOOOOOOOOOo..',
      '..OO.OOO.OO.OOO.OO..',
      '..O...O...O...O..O..',
    ],
  },
  dragon: {
    palette: { r: '#991b1b', R: '#ef4444', y: '#fde047', k: '#0b0b14', w: '#f8fafc', o: '#f97316', c: '#0b0b14' },
    map: [
      '..rr............rr..',
      '..yrr..........rry..',
      '...rrrrrrrrrrrrrr...',
      '..rRRRRRRRRRRRRRRr..',
      '..rRyyRRRRRRRRyyRr..',
      '..rRykRRRRRRRRkyRr..',
      '..rRRRRRRRRRRRRRRr..',
      '.rrRRwRwRRRRwRwRRrr.',
      'rRrRkkkkkkkkkkkkRrRr',
      'rRRrRoooooooooRRrRRr',
      '.rRRrRRRRRRRRRRrRRr.',
      '..rrrRRwwwwwwRRrrr..',
      '....rRwwwkwwwwRr....',
      '....rRwwwkkkwwRr....',
      '....rRRwwwwwwRRr....',
      '.....rRRRRRRRRr.....',
      '....rrr......rrr....',
    ],
  },
};

export default function Sprite({ name, size = 120, className = '', style, title }) {
  const s = SPRITES[name];
  if (!s) return null;
  const h = s.map.length;
  const w = Math.max(...s.map.map((r) => r.length));
  const rects = [];
  s.map.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = s.palette[ch];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={fill} />);
    });
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      className={className}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', ...style }}
      role="img"
      aria-label={title || name}
    >
      {rects}
    </svg>
  );
}
