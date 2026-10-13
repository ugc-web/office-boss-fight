import { BOSSES } from '@/lib/bosses.mjs';

export default function Landing({ onStart, best, challenge }) {
  return (
    <div className="text-center space-y-6">
      <p className="font-pixel text-[10px] sm:text-xs text-cyanx tracking-widest">OFFICE BOSS FIGHT</p>
      <h1 className="font-pixel text-xl sm:text-3xl leading-relaxed text-white">
        Your Office Has Bosses.
        <br />
        <span className="text-neon">Do You Have AI?</span>
      </h1>
      <p className="text-2xl text-gray-300">
        Five workplace nightmares. Five boss fights. Use AI to survive the workday.
      </p>

      {challenge && (
        <div className="pixel-box p-3 text-bad font-pixel text-[10px] sm:text-xs leading-relaxed animate-pop">
          ⚔️ A colleague scored {challenge}/100. Think you can beat them?
        </div>
      )}

      <div className="flex justify-center gap-3 text-4xl sm:text-5xl" aria-hidden>
        {BOSSES.map((b, i) => (
          <span key={b.id} className="animate-bob" style={{ animationDelay: `${i * 0.15}s` }}>
            {b.sprite}
          </span>
        ))}
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-lg sm:text-xl">
        {[
          ['❤️', '100 HP to start'],
          ['👾', '5 office bosses'],
          ['☕', 'Chai Break healing'],
          ['⏱️', '2–4 minutes'],
          ['🏆', 'Share your score'],
        ].map(([icon, t]) => (
          <li key={t} className="bg-black/40 border-2 border-black p-2">
            <div className="text-2xl">{icon}</div>
            {t}
          </li>
        ))}
      </ul>

      <details className="text-left text-lg bg-black/30 border-2 border-black p-3">
        <summary className="font-pixel text-[10px] sm:text-xs cursor-pointer text-cyanx">HOW TO PLAY</summary>
        <ul className="mt-2 space-y-1 list-disc pl-5">
          <li>Each boss brings a workplace problem. Pick the best AI-powered answer.</li>
          <li>Correct: the boss is defeated and you get +20 points.</li>
          <li>Wrong: you lose 20 HP and get roasted. You only get one try per boss.</li>
          <li>3 correct answers in a row: Chai Break, +10 HP.</li>
          <li>Reach 0 HP and you’re fired. Beat all 5 bosses and you win.</li>
        </ul>
      </details>

      <button className="pixel-btn text-sm sm:text-base px-8 py-4 animate-pulse" onClick={onStart} autoFocus>
        ▶ Start Boss Fight
      </button>

      {best && (
        <p className="font-pixel text-[10px] text-gray-400">
          YOUR BEST: {best.score}/100 · {best.title}
        </p>
      )}
    </div>
  );
}
