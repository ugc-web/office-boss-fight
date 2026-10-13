import { BOSSES } from '@/lib/bosses.mjs';
import Sprite from './Sprite';
import { Typewriter } from './ui';

export default function Landing({ onStart, best, challenge }) {
  return (
    <div className="text-center space-y-5 sm:space-y-6 py-2">
      <div className="space-y-3">
        <p className="font-pixel text-[9px] sm:text-[10px] text-gold tracking-[0.3em] animate-blink">INSERT COIN · PRESS START</p>
        <h1 className="font-pixel leading-tight">
          <span className="block text-3xl sm:text-5xl text-white text-outline">OFFICE</span>
          <span className="block text-3xl sm:text-5xl text-neon text-glow">BOSS FIGHT</span>
        </h1>
        <p className="font-pixel text-[10px] sm:text-xs text-cyanx leading-relaxed">
          Your Office Has Bosses. Do You Have AI?
        </p>
      </div>

      {challenge && (
        <div className="panel p-3 animate-pop">
          <p className="font-pixel text-[10px] sm:text-xs text-bad leading-relaxed">⚔️ CHALLENGE RECEIVED</p>
          <p className="text-xl">A colleague scored <b className="text-gold">{challenge}/100</b>. Think you can beat them?</p>
        </div>
      )}

      {/* Hero vs bosses lineup */}
      <div className="panel p-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 sm:gap-2">
          <div className="flex flex-col items-center shrink-0">
            <div className="bubble bubble-l text-base mb-3 max-w-[10rem]">
              <Typewriter text="AI can help with that!" />
            </div>
            <Sprite name="hero" size={64} className="animate-bob" title="The Intern, AI Archer" />
            <p className="font-pixel text-[8px] text-cyanx mt-2">THE INTERN</p>
          </div>
          <span className="font-pixel text-2xl sm:text-3xl text-gold text-glow animate-vs self-center">VS</span>
          <div className="grid grid-cols-5 gap-1 sm:gap-2 items-end">
            {BOSSES.map((b, i) => (
              <div key={b.id} className="flex flex-col items-center" style={{ animationDelay: `${i * 0.1}s` }}>
                <Sprite name={b.sprite} size={i === 4 ? 56 : 40} className="animate-breathe" style={{ animationDelay: `${i * 0.25}s`, filter: `drop-shadow(0 0 6px ${b.color})` }} title={b.name} />
              </div>
            ))}
          </div>
        </div>
        <p className="text-lg sm:text-xl text-gray-300 mt-4">
          Five office nightmares. Ten easy questions. Fire <span className="text-cyanx">AI arrows</span> by picking the smartest way to use AI. No tech skills needed.
        </p>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-lg">
        {[
          ['❤️', '100 HP', 'Wrong = −20'],
          ['🏹', '2 hits per boss', 'Work problem + AI basics'],
          ['☕', 'Chai Break', '3 in a row = +10 HP'],
          ['⏱️', '3 minutes', 'Share your title'],
        ].map(([icon, a, b]) => (
          <li key={a} className="panel p-2">
            <div className="text-2xl">{icon}</div>
            <div className="font-pixel text-[9px] text-white mt-1">{a}</div>
            <div className="text-base text-gray-400">{b}</div>
          </li>
        ))}
      </ul>

      <button className="btn btn-gold text-sm sm:text-base px-10 py-4 animate-glow" onClick={onStart} autoFocus>
        ▶ Start Boss Fight
      </button>

      <p className="font-pixel text-[8px] text-gray-500 leading-relaxed">
        KEYS: 1–4 OR A–D TO ANSWER · ENTER TO CONTINUE
        {best && <><br /><span className="text-gold">HIGH SCORE: {best.score}/100 · {best.title.toUpperCase()}</span></>}
      </p>
    </div>
  );
}
