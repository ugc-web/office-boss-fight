import { HpBar } from './Bars';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function Battle({ boss, options, state, onAnswer, onNext }) {
  const { level, totalBosses, hp, score, streak, last, phase } = state;
  const answered = phase === 'feedback';
  const chosen = answered ? options.find((o) => o.id === last.optionId) : null;
  const correctOpt = options.find((o) => o.correct);
  const bossHp = answered && last.correct ? 0 : 100;
  const isLast = level + 1 >= totalBosses;

  const bossAnim = !answered ? 'animate-bob' : last.correct ? 'animate-hit' : 'animate-lunge';

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* HUD */}
      <div className="flex justify-between items-center font-pixel text-[10px] sm:text-xs">
        <span className="text-cyanx">
          LEVEL {level + 1}/{totalBosses}
          {boss.final && <span className="text-bad"> · FINAL BOSS</span>}
        </span>
        <span>SCORE {score}</span>
        <span className="text-good" title="Correct answers in a row">🔥 {streak}</span>
      </div>

      {/* Arena */}
      <div
        className={`relative scanlines border-4 border-black p-3 sm:p-4 overflow-hidden ${
          answered && !last.correct ? 'animate-shake' : ''
        }`}
        style={{ background: `linear-gradient(180deg, #1e1b4b 0%, #1e1b4b 60%, #3b2f2f 60%, #2a2020 100%)` }}
      >
        {/* office décor */}
        <div className="absolute top-2 left-3 text-xl opacity-60" aria-hidden>🪴</div>
        <div className="absolute top-2 right-3 text-xl opacity-60" aria-hidden>🕐</div>
        <div className="absolute bottom-1 left-3 text-xl opacity-70" aria-hidden>🖥️</div>

        <HpBar label={boss.name.toUpperCase()} value={bossHp} color={boss.color} right={bossHp ? 'HP' : 'KO!'} />
        <div className="flex justify-center py-2 sm:py-4">
          <span
            key={`${level}-${phase}`}
            className={`text-6xl sm:text-8xl inline-block ${bossAnim} ${answered && last.correct ? 'opacity-40 grayscale' : ''}`}
            style={{ filter: `drop-shadow(0 0 12px ${boss.color})` }}
            role="img"
            aria-label={boss.name}
          >
            {boss.sprite}
          </span>
          {answered && (
            <span className="absolute top-1/3 left-1/2 -translate-x-1/2 font-pixel text-lg sm:text-2xl animate-pop"
              style={{ color: last.correct ? '#4ade80' : '#f97316', textShadow: '3px 3px 0 #000' }}>
              {last.correct ? '-100 HP!' : '-20 HP!'}
            </span>
          )}
        </div>
        <HpBar label="YOU" value={hp} color={hp > 40 ? '#4ade80' : '#f97316'} />
      </div>

      {/* Question */}
      <div className="pixel-box p-3 sm:p-4">
        <p className="text-xl sm:text-2xl text-white leading-tight">{boss.scenario}</p>
        <p className="font-pixel text-[10px] sm:text-xs text-cyanx mt-2 leading-relaxed">{boss.question}</p>
      </div>

      {/* Options */}
      <div className="grid gap-2" role="group" aria-label="Answer options">
        {options.map((o, i) => {
          let cls = 'bg-panel hover:bg-neon/30 hover:border-neon';
          if (answered) {
            if (o.correct) cls = 'bg-good/20 border-good';
            else if (o.id === last.optionId) cls = 'bg-bad/20 border-bad';
            else cls = 'bg-panel opacity-50';
          }
          return (
            <button
              key={o.id}
              disabled={answered}
              onClick={() => onAnswer(o)}
              className={`text-left text-lg sm:text-xl leading-snug border-4 border-black px-3 py-2 flex gap-3 items-start transition-colors focus-visible:outline focus-visible:outline-cyanx ${cls}`}
            >
              <span className="font-pixel text-xs mt-1 text-cyanx shrink-0">{LETTERS[i]}</span>
              <span>{o.text}</span>
              {answered && o.correct && <span className="ml-auto" aria-label="correct">✅</span>}
              {answered && !o.correct && o.id === last.optionId && <span className="ml-auto" aria-label="your answer">❌</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div className="pixel-box p-3 sm:p-4 space-y-2 animate-pop" aria-live="polite">
          <p className={`font-pixel text-xs sm:text-sm ${last.correct ? 'text-good' : 'text-bad'}`}>
            {last.correct ? `✔ CORRECT! ${boss.name} defeated. +20` : '✖ OUCH! −20 HP'}
          </p>
          {!last.correct && <p className="text-xl text-bad italic">“{chosen.roast}”</p>}
          <p className="text-lg sm:text-xl text-gray-200">{chosen.explain}</p>
          {!last.correct && (
            <p className="text-lg text-gray-300">
              <span className="text-good">Best move:</span> {correctOpt.explain}
            </p>
          )}
          {last.chai && (
            <div className="flex items-center gap-3 bg-good/10 border-2 border-good p-2 animate-pop">
              <span className="relative text-4xl">
                <span className="absolute -top-4 left-2 text-base animate-steam" aria-hidden>〰️</span>☕
              </span>
              <span className="font-pixel text-[10px] sm:text-xs text-good leading-relaxed">
                CHAI BREAK! 3 IN A ROW · +10 HP
              </span>
            </div>
          )}
          <button className="pixel-btn pixel-btn-alt w-full mt-2" onClick={onNext} autoFocus>
            {hp <= 0 ? 'Clock Out…' : isLast ? 'See Results ▶' : 'Next Boss ▶'}
          </button>
        </div>
      )}
    </div>
  );
}
