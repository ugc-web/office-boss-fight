'use client';
import { useEffect, useState } from 'react';
import { play } from '@/lib/sound';

export function SegBar({ value, max = 100, color, label, right, align = 'left' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = pct > 50 ? color : pct > 25 ? '#fbbf24' : '#ef4444';
  return (
    <div className="w-full">
      <div className={`flex items-baseline gap-2 font-pixel text-[8px] sm:text-[10px] mb-1 text-outline ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className="truncate">{label}</span>
        <span className="text-gold shrink-0">{right ?? value}</span>
      </div>
      <div className="segbar" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemax={max}>
        <div className={`fill ${align === 'right' ? 'ml-auto' : ''}`} style={{ width: `${pct}%`, background: `linear-gradient(180deg, ${fill}, ${fill}cc)` }} />
        <div className="shine" />
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

/** Pixel office background: skyline window, posters, floor tiles. */
export function OfficeBackdrop({ tint = '#a855f7', danger = false }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* wall */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1a1d45 0%, #232766 62%, transparent 62%)` }} />
      {/* window with skyline */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[8%] w-[46%] h-[38%] border-[3px] border-black" style={{ background: danger ? 'linear-gradient(180deg,#7f1d1d,#f97316)' : 'linear-gradient(180deg,#312e81,#7c3aed 70%,#f472b6)' }}>
        <div className="absolute bottom-0 inset-x-0 h-[55%] flex items-end gap-[3%] px-[3%]">
          {[60, 85, 45, 95, 70, 50, 80, 65].map((h, i) => (
            <div key={i} className="flex-1 bg-[#0b0b24] relative" style={{ height: `${h}%` }}>
              <div className="absolute inset-1 opacity-70" style={{ background: 'repeating-linear-gradient(0deg, transparent 0 5px, #fde04755 5px 7px)' }} />
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-1/2 w-[3px] bg-black" />
        <div className="absolute inset-x-0 top-1/2 h-[3px] bg-black" />
      </div>
      {/* poster + clock */}
      <div className="absolute left-[5%] top-[12%] w-[13%] aspect-[3/4] border-[3px] border-black bg-[#fde047] hidden sm:flex flex-col items-center justify-center rotate-[-4deg]">
        <span className="font-pixel text-[6px] text-navy text-center leading-tight">HANG IN<br />THERE</span>
        <span className="text-sm">🐱</span>
      </div>
      <div className="absolute right-[6%] top-[12%] w-9 h-9 rounded-full border-[3px] border-black bg-white flex items-center justify-center">
        <span className="font-pixel text-[6px] text-red-600">4:59</span>
      </div>
      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[38%]" style={{ background: 'repeating-linear-gradient(90deg, #2a1f3d 0 32px, #231a35 32px 64px)' }}>
        <div className="absolute inset-x-0 top-0 h-[4px] bg-black/60" />
      </div>
      {/* desk + plant */}
      <div className="absolute left-[3%] bottom-[8%] text-2xl sm:text-3xl">🪴</div>
      <div className="absolute right-[3%] bottom-[8%] text-2xl sm:text-3xl">🗄️</div>
      <div className="absolute inset-0 mix-blend-overlay opacity-40" style={{ background: `radial-gradient(ellipse at 70% 60%, ${tint}, transparent 60%)` }} />
    </div>
  );
}

export function Confetti({ count = 40 }) {
  const colors = ['#a855f7', '#22d3ee', '#4ade80', '#fbbf24', '#f97316'];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 w-2 h-3 animate-confetti"
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i % 10) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}
