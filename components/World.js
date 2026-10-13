// Blocky Minecraft-style worlds. Each boss fights in its own biome with moving details.
import { tex } from '@/lib/textures';

const BIOMES = {
  menu:   { sky: 'linear-gradient(180deg,#78a7ff 0%,#a9c8ff 60%,#cfe0ff 100%)', ground: 'grass', under: 'dirt', clouds: true, trees: true },
  ocean:  { sky: 'linear-gradient(180deg,#4f7fe0 0%,#8fb8ff 70%)', ground: 'sand', under: 'sand', water: true, clouds: true, label: 'Ocean Office' },
  swamp:  { sky: 'linear-gradient(180deg,#4d6b4a 0%,#8aa37a 75%)', ground: 'grass', under: 'mud', clouds: true, trees: true, fog: 'rgba(120,160,110,.25)', label: 'Spreadsheet Swamp' },
  end:    { sky: 'radial-gradient(ellipse at 50% 30%,#2b1a40 0%,#0d0716 70%)', ground: 'endstone', under: 'endstone', stars: true, pillars: true, label: 'The Endless Meeting' },
  desert: { sky: 'linear-gradient(180deg,#f0b46a 0%,#ffd9a0 70%)', ground: 'sand', under: 'sand', clouds: true, cactus: true, label: 'Slide Desert' },
  nether: { sky: 'linear-gradient(180deg,#3a0b0b 0%,#7a1a10 70%,#b33b14 100%)', ground: 'netherrack', under: 'netherrack', lava: true, embers: true, label: 'Deadline Volcano' },
  city: { sky: 'linear-gradient(180deg,#0b1026 0%,#1b2550 60%,#3b3a6b 100%)', ground: 'stone', under: 'deepslate', stars: true, skyline: '#111633', windows: '#facc15', searchlights: true, label: 'The Open-Plan Office' },
  tower: { sky: 'linear-gradient(180deg,#1e0b3a 0%,#5b2a86 45%,#d97706 85%,#fbbf24 100%)', ground: 'obsidian', under: 'purpur', skyline: '#1a0b2e', windows: '#c084fc', gold: true, label: 'The Top Floor' },
};

const Cloud = ({ top, w, delay, dur = 70 }) => (
  <div className="absolute animate-cloud" style={{ top, animationDelay: `${delay}s`, animationDuration: `${dur}s` }}>
    <div style={{ width: w, height: w / 4, background: '#fff', opacity: 0.9, boxShadow: `${w / 4}px ${-w / 8}px 0 #fff, ${w / 2}px 0 0 #fff` }} />
  </div>
);

function Tree({ left, scale = 1 }) {
  const s = 16 * scale;
  return (
    <div className="absolute" style={{ left, bottom: '100%' }}>
      <div style={{ ...tex('leaves', s), width: s * 3, height: s * 2, marginLeft: -s }} />
      <div style={{ ...tex('planks', s, { filter: 'hue-rotate(-10deg) brightness(.7)' }), width: s, height: s * 2 }} />
    </div>
  );
}

/** Full-bleed biome. `block` is the rendered size of one block in px. */
export default function World({ biome = 'menu', block = 40, children, className = '', npc = true }) {
  const b = BIOMES[biome] || BIOMES.menu;
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0" style={{ background: b.sky }} />

      {b.stars && Array.from({ length: 40 }).map((_, i) => (
        <span key={i} className="absolute block w-1 h-1 bg-white animate-blink" style={{ left: `${(i * 53) % 100}%`, top: `${(i * 29) % 60}%`, animationDelay: `${(i % 7) * 0.3}s`, animationDuration: `${2 + (i % 3)}s`, opacity: 0.7 }} />
      ))}
      {b.pillars && [12, 30, 70, 88].map((l, i) => (
        <div key={l} className="absolute bottom-[28%]" style={{ left: `${l}%`, width: block * 0.9, height: `${30 + i * 9}%`, ...tex('obsidian', block * 0.9) }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-fuchsia-300 animate-drift" style={{ boxShadow: '0 0 14px #f0abfc' }} />
        </div>
      ))}
      {b.skyline && (
        <div className="absolute inset-x-0 bottom-[28%] h-[46%] pointer-events-none">
          {[[0, 46, 9], [8, 70, 7], [14, 38, 10], [23, 82, 8], [30, 56, 11], [40, 92, 7], [46, 64, 9], [54, 44, 8], [61, 78, 10], [70, 52, 7], [76, 88, 9], [84, 60, 8], [91, 74, 9]].map(([l, h, w], i) => (
            <div key={i} className="absolute bottom-0" style={{ left: `${l}%`, width: `${w}%`, height: `${h}%`, background: b.skyline, boxShadow: 'inset -4px 0 0 rgba(255,255,255,.04)' }}>
              <div className="absolute inset-[8%] opacity-80" style={{ backgroundImage: `radial-gradient(${b.windows} 0 1.5px, transparent 2px)`, backgroundSize: '9px 11px', maskImage: 'linear-gradient(0deg, rgba(0,0,0,.25), #000)' }} />
              {i % 4 === 1 && <span className="absolute -top-2 left-1/2 w-1 h-2 bg-red-500 animate-blink" />}
            </div>
          ))}
        </div>
      )}
      {b.searchlights && [20, 75].map((l, i) => (
        <div key={l} className="absolute bottom-[28%] w-[16%] h-[70%] origin-bottom opacity-25 animate-drift" style={{ left: `${l}%`, background: 'linear-gradient(0deg, #fde68a, transparent)', clipPath: 'polygon(45% 100%, 55% 100%, 100% 0, 0 0)', animationDuration: `${5 + i}s` }} />
      ))}
      {b.gold && <div className="absolute left-1/2 bottom-[30%] w-40 h-40 -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(circle, #fde68a, #f59e0b 45%, transparent 70%)', opacity: 0.55 }} />}
      {b.clouds && (
        <>
          <Cloud top="8%" w={120} delay={-10} />
          <Cloud top="18%" w={80} delay={-40} dur={90} />
          <Cloud top="4%" w={160} delay={-62} dur={110} />
        </>
      )}
      {b.fog && <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${b.fog}, transparent 60%)` }} />}
      {b.embers && Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="absolute block w-1.5 h-1.5 bg-orange-400 animate-drift" style={{ left: `${(i * 41) % 100}%`, top: `${20 + ((i * 17) % 50)}%`, animationDelay: `${-i * 0.4}s`, boxShadow: '0 0 6px #fb923c' }} />
      ))}

      {/* ground: top row of the biome block + layers of under-block */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: '28%' }}>
        {b.trees && <><Tree left="6%" scale={block / 40} /><Tree left="82%" scale={block / 48} /></>}
        {b.cactus && [8, 90].map((l) => (
          <div key={l} className="absolute bottom-full" style={{ left: `${l}%`, width: block * 0.8, height: block * 1.6, background: '#3f8a2a', boxShadow: 'inset 4px 0 0 #2b6a1c, inset -4px 0 0 #5fae3f', backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 8px, rgba(0,0,0,.25) 8px 10px)' }} />
        ))}
        {b.water && <div className="absolute bottom-full inset-x-0 h-3 opacity-80" style={tex('water', 24)} />}
        <div className="absolute inset-x-0 top-0" style={{ height: block, ...tex(b.ground, block) }} />
        <div className="absolute inset-x-0 bottom-0" style={{ top: block, ...tex(b.under, block, { filter: 'brightness(.75)' }) }} />
        {b.lava && <div className="absolute inset-x-0 bottom-0 h-[30%] animate-lavaPulse" style={tex('lava', block)} />}
      </div>

      {npc && (
        <div className="absolute bottom-[28%] animate-npc opacity-70" style={{ animationDelay: '-6s' }}>
          <div className="flex flex-col items-center scale-[.55] origin-bottom">
            <div className="w-6 h-6" style={{ background: '#c68d63', boxShadow: 'inset 0 6px 0 #3b2416' }} />
            <div className="w-6 h-7 bg-slate-600" />
            <div className="flex gap-0"><div className="w-3 h-7 bg-slate-800 animate-bob" /><div className="w-3 h-7 bg-slate-900 animate-bob" style={{ animationDelay: '-.7s' }} /></div>
          </div>
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs">☕</span>
        </div>
      )}

      {children}
    </div>
  );
}

export const biomeLabel = (biome) => BIOMES[biome]?.label || '';
