'use client';
import { useEffect, useState } from 'react';
import { play } from '@/lib/sound';

/** Minecraft heart: full, half or empty, drawn as a 9x9 pixel grid. */
const HEART = ['.kk...kk.', 'kRRk.kRRk', 'kRWRkRRRk', 'kRRRRRRRk', 'kRRRRRRRk', '.kRRRRRk.', '..kRRRk..', '...kRk...', '....k....'];
export function Heart({ fill = 1, size = 18, poison = false }) {
  const red = poison ? '#7a9b2f' : '#e81d1d';
  return (
    <svg viewBox="0 0 9 9" width={size} height={size} style={{ shapeRendering: 'crispEdges' }} aria-hidden>
      {HEART.flatMap((row, y) =>
        [...row].map((c, x) => {
          if (c === '.') return null;
          let col = c === 'k' ? '#1a0000' : '#3a1a1a';
          const filled = fill >= 1 || (fill > 0 && x <= 4);
          if (c !== 'k' && filled) col = c === 'W' ? '#ffc6c6' : red;
          return <rect key={`${x}${y}`} x={x} y={y} width="1" height="1" fill={col} />;
        })
      )}
    </svg>
  );
}

/** 10 hearts = 100 HP. Hearts jiggle when health is low, like in Minecraft. */
export function Hearts({ hp, max = 100, size = 18, label = 'Health' }) {
  const per = max / 10;
  const low = hp <= max * 0.3;
  return (
    <div className="flex gap-[1px]" role="meter" aria-label={label} aria-valuenow={hp} aria-valuemax={max}>
      {Array.from({ length: 10 }).map((_, i) => {
        const f = Math.max(0, Math.min(1, (hp - i * per) / per));
        return (
          <span key={i} className={low && hp > 0 ? 'animate-heartJiggle' : ''} style={{ animationDelay: `${(i * 37) % 200}ms` }}>
            <Heart fill={f >= 1 ? 1 : f >= 0.5 ? 0.5 : 0} size={size} />
          </span>
        );
      })}
    </div>
  );
}

/** Wither/Ender-dragon style boss bar. */
export function BossBar({ name, value, max = 100, color }) {
  return (
    <div className="w-full text-center">
      <p className="font-pixel text-sm sm:text-base text-white mc-text-dark leading-none mb-1 truncate">{name}</p>
      <div className="mc-bossbar" role="meter" aria-label={`${name} health`} aria-valuenow={value} aria-valuemax={max}>
        <i style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

/** Typewriter text with optional blip sound. */
export function Typewriter({ text, speed = 22, sound = false, className = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (sound && i % 3 === 0) play('type');
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, sound]);
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{text.slice(0, n)}</span>
      {n < text.length && <span aria-hidden className="animate-blink">▌</span>}
    </span>
  );
}

/** Burst of square particles (crit sparks, smoke puffs, XP orbs). */
export function Particles({ count = 12, colors = ['#fff'], size = 6, spread = 70, className = '', style, delay = 0 }) {
  return (
    <div className={`absolute pointer-events-none ${className}`} style={style} aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + (i % 3) * 0.4;
        const r = spread * (0.5 + ((i * 7) % 5) / 8);
        return (
          <span
            key={i}
            className="absolute block animate-particle opacity-0"
            style={{
              width: size, height: size, background: colors[i % colors.length],
              '--dx': `${Math.cos(a) * r}px`, '--dy': `${Math.sin(a) * r - 20}px`,
              animationDelay: `${delay + (i % 4) * 0.03}s`,
              boxShadow: 'inset -1px -1px 0 rgba(0,0,0,.3)',
            }}
          />
        );
      })}
    </div>
  );
}

export function Confetti({ count = 44 }) {
  const colors = ['#55ff55', '#ffff55', '#55ffff', '#ff55ff', '#ffaa00'];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 w-3 h-3 animate-confetti"
          style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length], animationDelay: `${(i % 11) * 0.13}s` }}
        />
      ))}
    </div>
  );
}
