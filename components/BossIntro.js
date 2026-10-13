'use client';
import Sprite from './Sprite';
import { Typewriter } from './ui';

/** Street Fighter-style VS card shown before each boss. */
export default function BossIntro({ boss, index, total, onFight }) {
  return (
    <div className="relative crt overflow-hidden border-[3px] border-black" style={{ boxShadow: '0 0 0 3px #2e3470' }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(115deg, #1e3a8a 0 48%, #000 48% 52%, ${boss.color}55 52%)` }} />
      <div className="relative z-10 p-4 sm:p-6 min-h-[22rem] flex flex-col">
        <p className="font-pixel text-[10px] text-gold text-center tracking-[0.3em]">
          {boss.final ? '⚠ FINAL BOSS ⚠' : `STAGE ${index + 1} / ${total}`}
        </p>
        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 my-4">
          <div className="text-center animate-slideL">
            <Sprite name="hero" size={84} className="mx-auto" />
            <p className="font-pixel text-[9px] sm:text-[10px] text-cyanx mt-2">THE INTERN</p>
            <p className="text-base text-gray-300">Prompt Archer</p>
          </div>
          <span className="font-pixel text-4xl sm:text-5xl text-gold text-glow animate-vs" style={{ animationDelay: '0.4s' }}>VS</span>
          <div className="text-center animate-slideR">
            <Sprite name={boss.sprite} size={boss.final ? 130 : 110} className="mx-auto" style={{ filter: `drop-shadow(0 0 12px ${boss.color})` }} />
            <p className="font-pixel text-[9px] sm:text-[10px] mt-2" style={{ color: boss.color }}>{boss.name.toUpperCase()}</p>
            <p className="text-base text-gray-300">{boss.title}</p>
          </div>
        </div>
        <div className="bubble text-lg sm:text-xl animate-pop" style={{ animationDelay: '0.7s' }}>
          <b>{boss.name}:</b> “<Typewriter text={boss.intro} sound />”
        </div>
        <button className="btn btn-gold mt-5 w-full text-sm" onClick={onFight} autoFocus>
          ⚔ FIGHT!
        </button>
      </div>
    </div>
  );
}
