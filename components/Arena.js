'use client';
import { useEffect, useState } from 'react';
import Mob from './Mob';
import World from './World';
import { BossBar, Hearts, Typewriter, Particles } from './ui';
import { HERO } from '@/lib/bosses.mjs';
import { BOSS_HP } from '@/lib/game.mjs';

const pick = (arr, seed) => arr[seed % arr.length];

/** Battle stage: hero (left) vs boss (right) standing in the boss's biome. */
export default function Arena({ boss, state, entering }) {
  const { hp, bossHp, last, phase, round } = state;
  const answered = phase === 'feedback';
  const correct = answered && last.correct;
  const wrong = answered && !last.correct;

  // Pose timeline: hero attacks -> boss gets hurt / KO. Boss attacks -> hero gets hurt.
  const [t, setT] = useState(0);
  // Character size follows the screen: small phones, tablets, desktop.
  const [vw, setVw] = useState('md');
  useEffect(() => {
    const on = () => setVw(window.innerWidth >= 1024 ? 'lg' : window.innerWidth < 640 ? 'sm' : 'md');
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const wide = vw === 'lg';
  const scale = wide ? 1.35 : vw === 'sm' ? 0.8 : 1;
  useEffect(() => {
    setT(0);
    if (!answered) return;
    const a = setTimeout(() => setT(1), 420);
    const b = setTimeout(() => setT(2), 1300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [answered, round]);

  let heroPose = entering ? 'walk' : 'idle';
  let bossPose = entering ? 'walk' : 'idle';
  if (correct) {
    heroPose = t === 0 ? 'attack' : last.ko ? 'cheer' : 'idle';
    bossPose = t === 0 ? 'idle' : last.ko ? 'ko' : t === 1 ? 'hurt' : 'idle';
  } else if (wrong) {
    bossPose = t === 0 ? 'attack' : 'idle';
    heroPose = t === 1 ? 'hurt' : 'idle';
  }

  let bossLine = pick(boss.taunts, round);
  if (correct) bossLine = last.ko ? boss.defeat : pick(boss.hurt, round);
  if (wrong) bossLine = last.timeout ? 'Too slow! The clock is MY friend.' : state.rounds[round].q.options.find((o) => o.id === last.optionId)?.roast;
  const heroLine = correct ? pick(HERO.hitLines, round) : wrong ? pick(HERO.hurtLines, round) : null;

  return (
    <div className={`relative overflow-hidden border-[3px] border-black h-[18rem] sm:h-[19rem] lg:h-[27rem] crt-vignette ${wrong && t >= 1 ? 'animate-shake' : ''}`}>
      <World biome={boss.biome} block={wide ? 44 : 36} />

      {/* Boss bar on top, like the Ender Dragon */}
      <div className="absolute top-2 inset-x-0 z-10 flex justify-center px-3">
        <div className="w-[70%] sm:w-[60%]">
          <BossBar name={boss.name} value={bossHp} max={BOSS_HP} color={boss.color} />
        </div>
      </div>

      {bossLine && (
        <div className="absolute right-2 top-12 sm:top-16 z-20 max-w-[58%] sm:max-w-[55%]">
          <div key={`${round}-${phase}`} className="mc-bubble tail-r animate-pop" style={{ animationDelay: wrong ? '0.3s' : '0s' }}>
            <Typewriter text={bossLine} speed={wrong ? 18 : 26} />
          </div>
        </div>
      )}
      {heroLine && (
        <div className="absolute left-2 top-14 sm:top-16 z-20 max-w-[38%]">
          <div className="mc-bubble tail-l animate-pop" style={{ animationDelay: '0.9s' }}>{heroLine}</div>
        </div>
      )}

      {/* Fighters stand on the grass line (ground = 28% of the height) */}
      <div className={`absolute bottom-[28%] left-[8%] sm:left-[12%] z-[5] ${entering ? 'animate-walkInL' : ''}`}>
        <Mob name="hero" height={84 * scale} pose={heroPose} title={`${HERO.name}, ${HERO.title}`} />
      </div>
      <div className={`absolute bottom-[28%] right-[6%] sm:right-[12%] z-[5] ${entering ? 'animate-walkInR' : ''}`} style={{ filter: `drop-shadow(0 0 10px ${boss.color}88)` }}>
        <Mob name={boss.sprite} height={(boss.final ? 128 : 108) * scale} pose={bossPose} title={boss.name} />
      </div>

      {/* Arrow */}
      {correct && t === 0 && (
        <div className="absolute z-[6] animate-arrowFly" style={{ bottom: '44%', '--from': '22%', '--to': '68%', animationDelay: '0.22s', opacity: 0 }} aria-hidden>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-white" style={{ clipPath: 'polygon(0 0,100% 50%,0 100%)', transform: 'scaleX(-1)' }} />
            <div className="h-[3px] w-10 sm:w-14 bg-[#8b5e34]" />
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-[#cfd8dc]" />
          </div>
        </div>
      )}
      {/* Boss projectile */}
      {wrong && t === 0 && (
        <div className="absolute z-[6] animate-bossShot text-2xl sm:text-3xl font-pixel text-mcred mc-text-dark" style={{ bottom: '44%', '--from': '22%', '--to': '68%', animationDelay: '0.15s', opacity: 0 }} aria-hidden>
          {last.timeout ? '⏰' : boss.projectile}
        </div>
      )}

      {/* Hit effects */}
      {correct && t >= 1 && (
        <>
          <Particles className="right-[20%] bottom-[48%] z-[7]" colors={['#fff', '#d1d5db', '#facc15']} count={14} size={6} />
          {last.ko && <Particles className="right-[20%] bottom-[38%] z-[7]" colors={['#e5e7eb', '#9ca3af', '#f3f4f6']} count={18} size={12} spread={60} delay={0.5} />}
          <span className="absolute right-[18%] bottom-[56%] z-20 font-pixel text-2xl sm:text-3xl text-mcyellow mc-text-dark opacity-0 animate-floatUp">{last.ko ? 'CRIT!' : '-50'}</span>
          <Particles className="left-[50%] bottom-[30%] z-[7]" colors={['#80ff20', '#c8ff8a', '#facc15']} count={8} size={7} spread={50} delay={0.25} />
        </>
      )}
      {wrong && t >= 1 && (
        <>
          <div className="absolute inset-0 z-[8] pointer-events-none bg-red-600 opacity-0 animate-flash" />
          <Particles className="left-[18%] bottom-[48%] z-[7]" colors={['#b91c1c', '#ef4444']} count={10} size={6} />
          <span className="absolute left-[14%] bottom-[56%] z-20 font-pixel text-2xl sm:text-3xl text-mcred mc-text-dark opacity-0 animate-floatUp">-2♥</span>
        </>
      )}

      {answered && last.ko && t >= 1 && (
        <div className="absolute inset-x-0 bottom-[15%] z-20 flex justify-center pointer-events-none">
          <span className="font-title text-3xl sm:text-5xl text-mcyellow mc-text-dark animate-vs" style={{ animationDelay: '0.5s' }}>K.O.!</span>
        </div>
      )}
      {answered && last.escaped && t >= 1 && (
        <div className="absolute inset-x-0 bottom-[15%] z-20 flex justify-center pointer-events-none">
          <span className="font-pixel text-base sm:text-xl text-mcred mc-dark px-3 py-1.5 animate-vs" style={{ animationDelay: '0.6s' }}>BOSS ESCAPED!</span>
        </div>
      )}

      {/* Player hearts, like the hotbar HUD */}
      <div className="absolute bottom-2 left-2 z-10 bg-black/35 px-1.5 py-1">
        <Hearts hp={hp} size={14} />
      </div>
    </div>
  );
}
