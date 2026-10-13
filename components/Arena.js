'use client';
import Sprite from './Sprite';
import { SegBar, OfficeBackdrop, Typewriter } from './ui';
import { HERO } from '@/lib/bosses.mjs';
import { BOSS_HP } from '@/lib/game.mjs';

const pick = (arr, seed) => arr[seed % arr.length];

/** Battle stage: hero (left) vs boss (right), projectiles, damage numbers, speech bubbles. */
export default function Arena({ boss, state, roundKey }) {
  const { hp, bossHp, last, phase, round } = state;
  const answered = phase === 'feedback';
  const correct = answered && last.correct;
  const wrong = answered && !last.correct;

  const heroAnim = correct ? 'animate-draw' : wrong ? 'animate-recoil' : 'animate-bob';
  const bossAnim = !answered ? 'animate-breathe' : correct ? (last.ko ? 'animate-ko' : 'animate-hit') : 'animate-lunge';

  let bossLine = pick(boss.taunts, round);
  if (correct) bossLine = last.ko ? boss.defeat : pick(boss.hurt, round);
  if (wrong) bossLine = state.rounds[round].q.options.find((o) => o.id === last.optionId)?.roast;
  const heroLine = correct ? pick(HERO.hitLines, round) : wrong ? pick(HERO.hurtLines, round) : null;

  return (
    <div
      key={roundKey}
      className={`relative crt overflow-hidden border-[3px] border-black h-64 sm:h-72 ${wrong ? 'animate-shake' : ''}`}
      style={{ boxShadow: '0 0 0 3px #2e3470' }}
    >
      <OfficeBackdrop tint={boss.color} danger={boss.final} />

      <div className="absolute top-2 inset-x-2 grid grid-cols-2 gap-3 z-10">
        <SegBar label={HERO.name.toUpperCase()} value={hp} color="#4ade80" right={`${hp} HP`} />
        <SegBar label={boss.name.toUpperCase()} value={bossHp} max={BOSS_HP} color={boss.color} right={bossHp ? `${bossHp}%` : 'K.O.'} align="right" />
      </div>

      {bossLine && (
        <div className="absolute right-2 top-[3.75rem] z-10 max-w-[60%] sm:max-w-[52%]">
          <div key={`${roundKey}-${phase}`} className="bubble bubble-r text-base sm:text-lg animate-pop">
            <Typewriter text={bossLine} speed={wrong ? 18 : 26} />
          </div>
        </div>
      )}

      {heroLine && (
        <div className="absolute left-2 top-[3.75rem] z-10 max-w-[36%]">
          <div className="bubble bubble-l text-base animate-pop" style={{ animationDelay: '0.35s' }}>{heroLine}</div>
        </div>
      )}

      <div className="absolute bottom-3 sm:bottom-4 left-[6%] sm:left-[10%] z-[5]">
        <Sprite name="hero" size={68} className={heroAnim} title={`${HERO.name}, ${HERO.title}`} />
        <div className="mx-auto mt-1 h-2 w-14 rounded-full bg-black/40" />
      </div>
      <div className="absolute bottom-3 sm:bottom-4 right-[5%] sm:right-[9%] z-[5]">
        <Sprite name={boss.sprite} size={boss.final ? 128 : 110} className={bossAnim} style={{ filter: `drop-shadow(0 0 10px ${boss.color})` }} title={boss.name} />
        <div className="mx-auto mt-1 h-2 w-24 rounded-full bg-black/40" />
      </div>

      {correct && (
        <div className="absolute bottom-[34%] z-[6] animate-arrow" style={{ left: '20%' }} aria-hidden>
          <div className="flex items-center">
            <div className="h-[3px] w-10 sm:w-14 bg-cyanx shadow-[0_0_8px_#22d3ee]" />
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-cyanx" />
          </div>
        </div>
      )}
      {wrong && (
        <div className="absolute bottom-[34%] z-[6] animate-projectile text-2xl font-pixel text-red-500 text-outline" style={{ right: '20%' }} aria-hidden>
          {boss.projectile}
        </div>
      )}

      {answered && (
        <>
          <div className={`absolute inset-0 z-[7] pointer-events-none opacity-0 animate-flash ${correct ? 'bg-white' : 'bg-red-600'}`} style={{ animationDelay: '0.4s' }} />
          {!last.ko && (
            <div
              className={`absolute z-20 font-pixel text-xl sm:text-2xl opacity-0 animate-floatUp text-outline ${correct ? 'right-[18%] text-gold' : 'left-[12%] text-red-500'}`}
              style={{ bottom: '40%', animationDelay: '0.42s' }}
              aria-hidden
            >
              {correct ? '-50' : '-20'}
            </div>
          )}
        </>
      )}

      {/* Banners sit in the lower half so they never cover the speech bubbles */}
      {answered && last.ko && (
        <div className="absolute inset-x-0 bottom-[14%] z-20 flex justify-center pointer-events-none">
          <span className="font-pixel text-3xl sm:text-5xl text-gold text-glow animate-vs" style={{ animationDelay: '0.7s' }}>K.O.!</span>
        </div>
      )}
      {answered && last.escaped && (
        <div className="absolute inset-x-0 bottom-[16%] z-20 flex justify-center pointer-events-none">
          <span className="font-pixel text-sm sm:text-xl text-bad text-outline animate-vs bg-black/70 px-3 py-2 border-2 border-black" style={{ animationDelay: '0.8s' }}>BOSS ESCAPED!</span>
        </div>
      )}
    </div>
  );
}
