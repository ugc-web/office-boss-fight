'use client';
import { useEffect, useState } from 'react';
import Arena from './Arena';
import { play } from '@/lib/sound';
import { secondsFor, feedbackDelay } from '@/lib/game.mjs';
import { QUESTION_TYPES } from '@/lib/bosses.mjs';
import { biomeLabel } from './World';

const KEYS = ['1', '2', '3', '4'];
const LETTERS = ['A', 'B', 'C', 'D'];
const WRONG_POPUP_AFTER = 1100; // let the boss's attack land before the pop-up covers the screen

function Timer({ seconds, running, onTimeout, roundKey }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => setLeft(seconds), [roundKey, seconds]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((l) => {
        const n = l - 1;
        if (n <= 10 && n > 0) play(n % 2 ? 'tick' : 'tock');
        if (n <= 0) { clearInterval(id); onTimeout(); }
        return Math.max(0, n);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onTimeout, roundKey]);
  const pct = (left / seconds) * 100;
  const danger = left <= 10;
  return (
    <div className="flex items-center gap-2" aria-label={`${left} seconds left`}>
      <span className={`font-pixel text-sm w-10 text-right ${danger ? 'text-mcred animate-tick' : 'text-white'} mc-text-dark`}>⏱{left}</span>
      <div className="mc-xp flex-1"><i style={{ width: `${pct}%`, background: danger ? '#ff5555' : undefined, transition: 'width 1s linear' }} /></div>
    </div>
  );
}

/** Draining bar that shows when the game will move on by itself. No button to click. */
function AutoNext({ ms, label }) {
  const [go, setGo] = useState(false);
  const [left, setLeft] = useState(Math.ceil(ms / 1000));
  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)));
    const end = Date.now() + ms;
    const id = setInterval(() => setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000))), 200);
    return () => { cancelAnimationFrame(r); clearInterval(id); };
  }, [ms]);
  return (
    <div className="pt-1" aria-hidden>
      <p className="font-pixel text-xs sm:text-sm text-[#555] flex justify-between">
        <span>{label}</span>
        <span>{left}s</span>
      </p>
      <div className="mc-xp mt-0.5">
        <i style={{ width: go ? '0%' : '100%', transition: `width ${ms}ms linear`, background: '#3c8527' }} />
      </div>
    </div>
  );
}

/** Material some questions come with: clues, an email to compare, steps to put in order... */
function Doc({ doc }) {
  return (
    <div className="mt-2.5 bg-[#f4eccb] text-[#2b2b2b] border-[3px] border-black p-2.5 sm:p-3" style={{ boxShadow: 'inset -3px -3px 0 #c9bd8c' }}>
      <p className="font-title text-xs sm:text-sm text-[#7a5b16] mb-1">{doc.label}</p>
      <ul className="space-y-1">
        {doc.lines.map((l) => (
          <li key={l} className="font-pixel text-[15px] sm:text-base leading-snug">{l}</li>
        ))}
      </ul>
    </div>
  );
}

/** Wrong answer: pop-up with the right answer. The game continues by itself. */
function WrongPopup({ boss, last, chosen, best, ms, label }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 bg-black/60" role="dialog" aria-modal="true" aria-labelledby="wrong-title">
      <div className="mc-panel w-full max-w-lg p-4 sm:p-5 space-y-2.5 animate-pop max-h-[90dvh] overflow-y-auto">
        <p id="wrong-title" className="font-title text-lg sm:text-xl text-[#b3261e] leading-tight">
          {last.timeout ? '⏰ Time’s up! −2 ♥' : '✖ Not quite! −2 ♥'}
          {last.escaped && <span className="block font-pixel text-sm sm:text-base mt-0.5">{boss.name} escaped!</span>}
        </p>
        {chosen && (
          <div className="border-l-4 border-[#b3261e] pl-2">
            <p className="font-pixel text-sm text-[#666]">You picked</p>
            <p className="font-pixel text-base sm:text-[17px] text-[#2b2b2b] leading-snug">{chosen.text}</p>
            <p className="font-pixel text-sm sm:text-base text-[#555] leading-snug mt-0.5">{chosen.explain}</p>
          </div>
        )}
        <div className="border-[3px] border-black bg-[#d9f2cf] p-2.5 sm:p-3" style={{ boxShadow: 'inset 3px 3px 0 #8fd17a' }}>
          <p className="font-pixel text-sm text-[#1f7a12]">✔ Right answer</p>
          <p className="font-pixel text-base sm:text-lg text-[#1f1f1f] leading-snug">{best.text}</p>
          <p className="font-pixel text-sm sm:text-base text-[#2b2b2b] leading-snug mt-1">💡 {best.explain}</p>
        </div>
        <AutoNext ms={ms} label={label} />
      </div>
    </div>
  );
}

export default function Battle({ boss, state, onAnswer, onNext, onTimeout, entering }) {
  const { round, rounds, score, streak, last, phase, hp } = state;
  const { q } = rounds[round];
  const answered = phase === 'feedback';
  const chosen = answered ? q.options.find((o) => o.id === last.optionId) : null;
  const best = q.options.find((o) => o.correct);
  const isFinalRound = round + 1 >= rounds.length;
  const type = QUESTION_TYPES[q.type] || QUESTION_TYPES.work;
  const delay = answered ? feedbackDelay(last) : 0;
  const nextLabel = hp <= 0 ? '☠ Respawning…' : isFinalRound ? '🏁 Results coming…' : last?.ko || last?.escaped ? '▶ Next boss coming…' : '▶ Next question coming…';

  // Wrong answers: the pop-up opens once the boss's attack has landed.
  const [popup, setPopup] = useState(false);
  useEffect(() => {
    setPopup(false);
    if (!answered || last.correct) return;
    const id = setTimeout(() => setPopup(true), WRONG_POPUP_AFTER);
    return () => clearTimeout(id);
  }, [answered, last, round]);

  // Topic sound when a new question appears (email ping, phone ring, camera click...).
  useEffect(() => {
    const id = setTimeout(() => play(q.sfx), entering ? 1100 : 250);
    return () => clearTimeout(id);
  }, [q.id, q.sfx, entering]);

  // 1-4 / A-D answer. Enter or Space skips the wait after feedback (optional; it moves on by itself anyway).
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
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-5 lg:items-start">
      {/* LEFT (desktop) / TOP (mobile): the fight */}
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between gap-2 font-pixel text-sm sm:text-base mc-text-dark pr-12">
          <span className="text-mcaqua whitespace-nowrap">Round {round + 1}/{rounds.length}</span>
          <span className="hidden sm:inline text-mcgray truncate">{biomeLabel(boss.biome)}</span>
          <span className="text-mcyellow whitespace-nowrap">⭐ {score}</span>
          <span className={`whitespace-nowrap ${streak >= 2 ? 'text-mcgold animate-tick' : 'text-mcgray'}`} title="Correct answers in a row">🔥×{streak}</span>
        </div>
        <div><Arena boss={boss} state={state} entering={entering} /></div>
      </div>

      {/* RIGHT (desktop) / BOTTOM (mobile): the question */}
      <div className="flex flex-col gap-2.5 min-w-0 lg:mt-[2.15rem]">
        <div className="mc-dark p-3 sm:p-4 animate-rise" key={q.id}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-pixel text-xs sm:text-sm px-2 py-0.5 border-2 border-black whitespace-nowrap" style={{ background: type.bg, color: type.fg }}>
              {type.icon} {type.label}
            </span>
            <div className="w-36 sm:w-48">
              <Timer seconds={secondsFor(boss, q)} running={!answered && !entering} onTimeout={onTimeout} roundKey={round} />
            </div>
          </div>
          <p className="font-pixel text-lg sm:text-xl text-white leading-snug mc-text-dark">{q.scenario}</p>
          {q.doc && <Doc doc={q.doc} />}
          <p className="font-pixel text-base sm:text-lg text-mcyellow mt-2 leading-snug mc-text-dark">▸ {q.question}</p>
        </div>

        <div className="grid gap-2" role="group" aria-label="Answer options">
          {q.options.map((o, i) => {
            let cls = '';
            if (answered) cls = o.correct ? 'is-right' : o.id === last.optionId ? 'is-wrong' : 'is-dim';
            return (
              <button key={o.id} disabled={answered || entering} onClick={() => onAnswer(o)} className={`mc-option animate-rise ${cls}`} style={{ animationDelay: `${0.05 + i * 0.06}s` }}>
                <span className="mc-key">{LETTERS[i]}</span>
                <span className="flex-1 pt-0.5">{o.text}</span>
                {answered && o.correct && <span className="font-pixel text-xs text-mcgreen pt-1">✔ BEST</span>}
                {answered && !o.correct && o.id === last.optionId && <span className="font-pixel text-xs text-mcred pt-1">YOU</span>}
              </button>
            );
          })}
        </div>

        {/* Right answer: short cheer, then the game moves on by itself. */}
        {answered && last.correct && (
          <div className="mc-panel p-3 sm:p-4 space-y-1.5 animate-pop" aria-live="polite">
            <p className="font-pixel text-base sm:text-lg text-[#1f7a12]">{last.ko ? `★ ${boss.name} defeated! +10` : '✔ Direct hit! +10'}</p>
            {chosen && <p className="font-pixel text-base sm:text-[17px] text-[#2b2b2b] leading-snug">{chosen.explain}</p>}
            {last.chai && (
              <div className="flex items-center gap-3 mc-slot p-2 animate-pop">
                <span className="text-3xl animate-bob">☕</span>
                <div>
                  <p className="font-pixel text-sm sm:text-base text-[#0f4d07]">Chai Break! +1 ♥</p>
                  <p className="font-pixel text-sm text-[#1f1f1f]">3 in a row. The office kettle believes in you.</p>
                </div>
              </div>
            )}
            <AutoNext key={round} ms={delay} label={nextLabel} />
          </div>
        )}
        {/* Wrong answer, while the boss attacks (before the pop-up opens). */}
        {answered && !last.correct && !popup && (
          <div className="mc-panel p-3 sm:p-4 animate-pop">
            <p className="font-pixel text-base sm:text-lg text-[#b3261e]">{last.timeout ? '⏰ Time’s up! −2 ♥' : '✖ Ouch! −2 ♥'}</p>
          </div>
        )}
      </div>

      {answered && !last.correct && popup && (
        <WrongPopup key={round} boss={boss} last={last} chosen={chosen} best={best} ms={delay - WRONG_POPUP_AFTER} label={nextLabel} />
      )}
    </div>
  );
}
