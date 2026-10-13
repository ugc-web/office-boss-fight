'use client';
import { BOSSES } from '@/lib/bosses.mjs';
import Mob from './Mob';
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
            Create your own fighter, then take on <span className="text-mcaqua">5 office bosses</span> in 10 rounds. Which AI tool for which job? What do you do when your “CEO” calls asking for money? Win a question and you attack. Get it wrong and the boss hits back.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2 font-pixel text-sm text-white text-left">
          {[
            ['❤', '10 hearts', 'Wrong = −2 ♥'],
            ['⏱', '30 sec / question', 'Too slow = hit'],
            ['☕', 'Chai Break', '3 in a row = +1 ♥'],
            ['🏹', '2 hits per boss', 'Miss one, it escapes'],
          ].map(([icon, a, b]) => (
            <li key={a} className="mc-dark px-2.5 py-2 flex gap-2 items-start">
              <span className="text-xl leading-none text-mcred">{icon}</span>
              <span><span className="block text-mcyellow leading-tight">{a}</span><span className="text-mcgray text-[13px]">{b}</span></span>
            </li>
          ))}
        </ul>
      </div>

      {/* Hero + bosses hanging out on the grass */}
      <div className="relative w-full max-w-3xl h-36 sm:h-44 mt-1">
        <div className="absolute bottom-0 left-[4%] sm:left-[8%] flex flex-col items-center">
          <div className="mc-bubble tail-l mb-2 text-sm sm:text-base whitespace-nowrap"><Typewriter text="AI can help with that!" /></div>
          <Mob name="hero" height={84} pose="idle" />
        </div>
        <div className="absolute bottom-0 right-[2%] sm:right-[6%] flex items-end gap-1.5 sm:gap-4">
          {BOSSES.map((b, i) => (
            <div key={b.id} className="hidden first:block [&:nth-child(-n+3)]:block sm:block" style={{ filter: `drop-shadow(0 0 6px ${b.color})` }}>
              <Mob name={b.sprite} height={b.final ? 84 : 58} pose="idle" style={{ animationDelay: `${-i * 0.4}s` }} title={b.name} />
            </div>
          ))}
        </div>
      </div>

      <p className="font-pixel text-xs sm:text-sm text-white/80 mc-text-dark">
        Plays full screen · Keys: 1–4 or A–D to answer · Enter skips
        {best && <><br /><span className="text-mcyellow">High score: {best.score}/100 · {best.title}</span></>}
      </p>
    </div>
  );
}
