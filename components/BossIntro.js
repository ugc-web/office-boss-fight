'use client';
import { useEffect, useRef, useState } from 'react';
import Mob from './Mob';
import World, { biomeLabel } from './World';
import { Typewriter } from './ui';
import { play } from '@/lib/sound';
import { INTRO_MS } from '@/lib/game.mjs';

/** VS card: hero and boss walk in from opposite sides of the boss's biome, boss roars. */
export default function BossIntro({ boss, index, total, onFight }) {
  useEffect(() => {
    const steps = [0, 250, 500, 750].map((ms) => setTimeout(() => play('step'), ms));
    const roar = setTimeout(() => play(`roar_${boss.sprite}`), 1100);
    return () => { steps.forEach(clearTimeout); clearTimeout(roar); };
  }, [boss.sprite]);

  // The fight starts by itself after the intro; the button only lets you skip the wait.
  // (A ref keeps the countdown from restarting when the parent re-renders.)
  const fightRef = useRef(onFight);
  fightRef.current = onFight;
  const [left, setLeft] = useState(Math.ceil(INTRO_MS / 1000));
  useEffect(() => {
    const go = setTimeout(() => fightRef.current(), INTRO_MS);
    const end = Date.now() + INTRO_MS;
    const id = setInterval(() => setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000))), 200);
    return () => { clearTimeout(go); clearInterval(id); };
  }, [boss.id]);

  return (
    <div className="relative overflow-hidden border-[3px] border-black min-h-[34rem] sm:min-h-[36rem] flex flex-col crt-vignette">
      <World biome={boss.biome} block={44} npc={false} />
      <div className="relative z-10 p-4 sm:p-6 flex-1 flex flex-col">
        <p className="font-title text-center text-sm sm:text-lg text-mcyellow mc-text-dark tracking-widest px-10">
          {boss.final ? '⚠ Final boss ⚠' : `Stage ${index + 1} / ${total}`}
        </p>
        <p className="font-pixel text-center text-sm sm:text-base text-white/90 mc-text-dark">{biomeLabel(boss.biome)}</p>

        <div className="mt-3 mc-dark p-3 sm:p-4 max-w-xl mx-auto w-full animate-pop" style={{ animationDelay: '1.1s' }}>
          <p className="font-title text-lg sm:text-2xl leading-tight" style={{ color: boss.color, textShadow: '2px 2px 0 #000' }}>{boss.name}</p>
          <p className="font-pixel text-sm text-mcgray">{boss.title}</p>
          <p className="font-pixel text-base sm:text-lg text-white mt-2 leading-snug">“<Typewriter text={boss.intro} sound />”</p>
        </div>

        <div className="flex-1 min-h-[9rem]" />

        <button className="mc-btn mc-btn-green w-full max-w-sm mx-auto text-lg sm:text-xl animate-rise relative z-10" style={{ animationDelay: '1.3s' }} onClick={onFight} autoFocus>
          ⚔ Fight! <span className="text-base opacity-80">({left})</span>
        </button>
      </div>

      {/* fighters on the ground line (28%) */}
      <div className="absolute bottom-[28%] left-[10%] sm:left-[18%] z-[5] animate-walkInL"><Mob name="hero" height={96} pose="walk" /></div>
      <div className="absolute bottom-[28%] right-[8%] sm:right-[18%] z-[5] animate-walkInR" style={{ filter: `drop-shadow(0 0 12px ${boss.color})` }}>
        <Mob name={boss.sprite} height={boss.final ? 150 : 128} pose="idle" />
      </div>
      <div className="absolute inset-x-0 bottom-[34%] z-[6] flex justify-center pointer-events-none">
        <span className="font-title text-5xl sm:text-7xl text-mcyellow animate-vs" style={{ animationDelay: '0.9s', textShadow: '4px 4px 0 #3f3f00, 0 0 24px #ff0' }}>VS</span>
      </div>
    </div>
  );
}
