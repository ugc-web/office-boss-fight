'use client';
import { BOSSES } from '@/lib/bosses.mjs';
import Mob from './Mob';
import { PRESETS, STYLES } from '@/lib/fighters.mjs';
import { heroModel } from '@/lib/mobs';
import { artFit, HeroFigure, BossFigure } from './Sprite';
import { Typewriter } from './ui';

/** Minecraft-style title screen. */
export default function Landing({ onStart, best, challenge }) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center gap-5 sm:gap-6 py-4 sm:py-8">
      <div className="relative">
        <h1 className="font-title leading-[0.9]">
          <span className="block text-[2.6rem] sm:text-7xl lg:text-8xl mc-title">OFFICE</span>
          <span className="block text-[2.6rem] sm:text-7xl lg:text-8xl mc-title" style={{ color: '#7ee15a', textShadow: '3px 3px 0 #2d5a1b, 6px 6px 0 #000' }}>BOSS FIGHT</span>
        </h1>
        <span className="mc-splash absolute -right-1 -bottom-5 sm:-right-20 sm:-bottom-6 font-pixel text-sm sm:text-xl whitespace-nowrap">No tech skills needed!</span>
      </div>
      <p className="font-pixel text-base sm:text-xl text-white mc-text-dark max-w-xl mt-3">Your office has bosses. Do you have AI?</p>

      {challenge && (
        <div className="mc-dark px-4 py-3 animate-pop max-w-md">
          <p className="font-pixel text-sm sm:text-base text-mcred">⚔ Challenge received</p>
          <p className="font-pixel text-base sm:text-lg text-white">A colleague scored <b className="text-mcyellow">{challenge}/100</b>. Think you can beat them?</p>
        </div>
      )}

      <div className="flex flex-col gap-2.5 w-full max-w-sm sm:max-w-md">
        <button className="mc-btn mc-btn-green text-lg sm:text-xl py-3" onClick={onStart} autoFocus>▶ Choose your fighter</button>
        <div className="mc-dark p-3 text-left">
          <p className="font-pixel text-sm sm:text-base text-white leading-snug">
            Pick a fighter and take on <span className="text-mcaqua">5 office bosses</span> in 10 rounds. Just answer: get it right and your fighter attacks, get it wrong and the boss hits back. 3 right answers unleash an <span className="text-mcyellow">ULTIMATE</span>.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2 font-pixel text-sm text-white text-left">
          {[
            ['❤', '10 hearts', 'Wrong = −2 ♥'],
            ['⏱', '30 sec / question', 'Too slow = hit'],
            ['☕', 'Chai Break', '3 in a row = +1 ♥'],
            ['⚡', 'Ultimate meter', '3 right = super move'],
          ].map(([icon, a, b]) => (
            <li key={a} className="mc-dark px-2.5 py-2 flex gap-2 items-start">
              <span className="text-xl leading-none text-mcred">{icon}</span>
              <span><span className="block text-mcyellow leading-tight">{a}</span><span className="text-mcgray text-[13px]">{b}</span></span>
            </li>
          ))}
        </ul>
      </div>

      {/* The 4 fighters from the character sheet */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3 w-full max-w-2xl">
        {PRESETS.map((f) => {
          const st = STYLES[f.style];
          return (
            <div key={f.id} className="relative aspect-[3/4] overflow-hidden border-[3px] border-black" style={{ boxShadow: `0 0 0 2px ${st.color}, 0 0 14px ${st.color}88` }}>
              <img src={f.art} alt={`${f.name}, ${st.label}`} className={`absolute inset-0 w-full h-full ${artFit(f.art)}`} style={{ background: `radial-gradient(ellipse at 50% 70%, ${st.color}88, #0b0a10 75%)` }} />
              <div className="absolute inset-x-0 bottom-0 p-1 sm:p-1.5" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,.9), transparent)' }}>
                <p className="font-title text-[9px] sm:text-xs text-white uppercase leading-tight">{f.name}</p>
                <p className="font-pixel text-[9px] sm:text-[11px] leading-tight" style={{ color: st.color }}>{st.icon} {st.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fighters vs bosses hanging out on the grass */}
      <div className="relative w-full max-w-3xl h-36 sm:h-44 mt-1">
        <div className="absolute bottom-0 left-[2%] sm:left-[6%] flex items-end gap-1 sm:gap-3">
          {PRESETS.map((f, i) => (
            <div key={f.id} className={`flex flex-col items-center ${i > 0 ? 'hidden' : ''}`}>
              {i === 0 && <div className="mc-bubble tail-l mb-2 text-sm sm:text-base whitespace-nowrap"><Typewriter text="AI can help with that!" /></div>}
              <HeroFigure fighter={f} model={heroModel(f)} height={i === 0 ? 110 : 72} pose="idle" title={f.name} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 right-[2%] sm:right-[6%] flex items-end gap-1.5 sm:gap-4">
          {BOSSES.map((b, i) => (
            <div key={b.id} className="hidden first:block [&:nth-child(-n+3)]:block sm:block" style={{ filter: `drop-shadow(0 0 6px ${b.color})` }}>
              <BossFigure boss={b} height={b.final ? 110 : 80} pose="idle" />
            </div>
          ))}
        </div>
      </div>

      <p className="font-pixel text-xs sm:text-sm text-white/80 mc-text-dark">
        Plays full screen · Keys: 1–4 or A–D to answer · Enter skips · Fights play out by themselves
        {best && <><br /><span className="text-mcyellow">High score: {best.score}/100 · {best.title}</span></>}
      </p>
    </div>
  );
}
