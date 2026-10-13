'use client';
import { useEffect } from 'react';
import Arena from './Arena';

const KEYS = ['1', '2', '3', '4'];
const LETTERS = ['A', 'B', 'C', 'D'];

export default function Battle({ boss, state, onAnswer, onNext }) {
  const { round, rounds, score, streak, last, phase, hp } = state;
  const { q } = rounds[round];
  const answered = phase === 'feedback';
  const chosen = answered ? q.options.find((o) => o.id === last.optionId) : null;
  const best = q.options.find((o) => o.correct);
  const isFinalRound = round + 1 >= rounds.length;

  // Keyboard: 1-4 / A-D to answer, Enter/Space to continue.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (!answered) {
        const i = KEYS.indexOf(k) >= 0 ? KEYS.indexOf(k) : LETTERS.indexOf(k);
        if (i >= 0 && q.options[i]) onAnswer(q.options[i]);
      } else if (k === 'ENTER' || k === ' ') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, q, onAnswer, onNext]);

  return (
    <div className="space-y-3">
      {/* Top HUD */}
      <div className="flex items-center justify-between font-pixel text-[8px] sm:text-[10px] gap-2 pr-10">
        <span className="text-cyanx whitespace-nowrap"><span className="hidden sm:inline">ROUND </span><span className="sm:hidden">R</span>{round + 1}/{rounds.length}</span>
        <span className={`px-2 py-1 border-2 border-black whitespace-nowrap ${q.kind === 'tool' ? 'bg-cyanx text-navy' : 'bg-neon text-white'}`}>
          {q.kind === 'tool' ? <>🧰 <span className="hidden sm:inline">AI </span>TOOL<span className="hidden sm:inline"> CHECK</span></> : <>⚙️ WORKFLOW</>}
        </span>
        <span className="text-gold whitespace-nowrap"><span className="hidden sm:inline">SCORE </span>{String(score).padStart(3, '0')}</span>
        <span className={`whitespace-nowrap ${streak >= 2 ? 'text-bad animate-pulse' : 'text-gray-400'}`} title="Correct answers in a row">
          🔥×{streak}
        </span>
      </div>

      <Arena boss={boss} state={state} roundKey={round} />

      {/* Question */}
      <div className="panel p-3 sm:p-4">
        <p className="text-xl sm:text-2xl text-white leading-tight">{q.scenario}</p>
        <p className="font-pixel text-[10px] sm:text-xs text-gold mt-2 leading-relaxed">▸ {q.question}</p>
      </div>

      {/* Options */}
      <div className="grid gap-2" role="group" aria-label="Answer options">
        {q.options.map((o, i) => {
          let state = '';
          if (answered) {
            if (o.correct) state = '!bg-none !bg-green-900/60 ring-2 ring-good';
            else if (o.id === last.optionId) state = '!bg-none !bg-red-900/60 ring-2 ring-bad';
            else state = 'opacity-40';
          }
          return (
            <button key={o.id} disabled={answered} onClick={() => onAnswer(o)} className={`option ${state}`}>
              <span className="keycap">{LETTERS[i]}</span>
              <span className="flex-1">{o.text}</span>
              {answered && o.correct && <span className="font-pixel text-[9px] text-good mt-1">BEST</span>}
              {answered && !o.correct && o.id === last.optionId && <span className="font-pixel text-[9px] text-bad mt-1">YOU</span>}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div className="panel p-3 sm:p-4 space-y-2 animate-pop" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <p className={`font-pixel text-[11px] sm:text-sm ${last.correct ? 'text-good' : 'text-bad'}`}>
              {last.correct ? (last.ko ? `★ ${boss.name.toUpperCase()} DEFEATED! +10` : '✔ DIRECT HIT! +10') : '✖ OUCH! −20 HP'}
            </p>
            {last.escaped && <span className="font-pixel text-[8px] text-bad">BOSS FLED</span>}
          </div>
          <p className="text-lg sm:text-xl text-gray-200">{chosen.explain}</p>
          {!last.correct && (
            <p className="text-lg text-gray-300 border-l-4 border-good pl-2">
              <span className="text-good">Best move:</span> {best.explain}
            </p>
          )}
          {last.chai && (
            <div className="flex items-center gap-3 bg-green-900/40 border-[3px] border-black p-2 animate-pop" style={{ boxShadow: '0 0 0 2px #4ade80' }}>
              <span className="relative text-4xl">
                <span className="absolute -top-4 left-1 text-sm text-white/80 animate-steam" aria-hidden>≋</span>☕
              </span>
              <div>
                <p className="font-pixel text-[10px] sm:text-xs text-good">CHAI BREAK! +10 HP</p>
                <p className="text-base text-gray-300">3 in a row. The office kettle believes in you.</p>
              </div>
            </div>
          )}
          <button className="btn btn-cyan w-full mt-1" onClick={onNext} autoFocus>
            {hp <= 0 ? '☠ CLOCK OUT…' : isFinalRound ? '🏁 SEE RESULTS' : last.ko || last.escaped ? 'NEXT BOSS ▶' : 'NEXT ROUND ▶'}
          </button>
        </div>
      )}
    </div>
  );
}
