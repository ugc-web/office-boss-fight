'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Arena from './Arena';
import { Typewriter } from './ui';
import { biomeLabel } from './World';
import { play, announce } from '@/lib/sound';
import { secondsFor, feedbackDelay } from '@/lib/game.mjs';
import { BOSSES, QUESTION_TYPES } from '@/lib/bosses.mjs';
import { STYLES } from '@/lib/fighters.mjs';
import { introScript } from '@/lib/moves.mjs';

const KEYS = ['1', '2', '3', '4'];
const LETTERS = ['A', 'B', 'C', 'D'];
export const WRONG_POPUP_AFTER = 1900; // let the boss's attack land before the answer pop-up opens
const CUE_MS = { ready: 1000, fight: 800, round: 850 };

/** Big centre-screen cue: "ROUND 3 · READY?" then "FIGHT!". */
function Cue({ step, label }) {
  if (!step) return null;
  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center pointer-events-none bg-black/25" aria-live="assertive">
      {step !== 'fight' && label && <p key={`l${label}`} className="font-title text-xl sm:text-3xl text-white uppercase tracking-[0.3em] animate-rise" style={{ textShadow: '3px 3px 0 #000' }}>{label}</p>}
      {step === 'ready' && <p key="ready" className="cue-ready font-title text-6xl sm:text-8xl lg:text-9xl text-mcyellow uppercase" style={{ textShadow: '5px 5px 0 #7a3d00, 0 0 40px #ff0' }}>Ready?</p>}
      {step === 'fight' && <p key="fight" className="cue-fight font-title text-7xl sm:text-9xl lg:text-[11rem] uppercase leading-none" style={{ color: '#ff3b3b', textShadow: '6px 6px 0 #4a0000, 0 0 50px #f00' }}>Fight!</p>}
    </div>
  );
}

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
  const danger = left <= 10;
  return (
    <div className={`w-14 sm:w-20 py-0.5 text-center border-[3px] border-black ${danger ? 'bg-[#5a0000]' : 'bg-black/70'}`} style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.2)' }} aria-label={`${left} seconds left`}>
      <span className={`font-title text-2xl sm:text-4xl leading-none ${danger ? 'text-mcred animate-tick inline-block' : 'text-white'}`} style={{ textShadow: '2px 2px 0 #000' }}>{left}</span>
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

/** Wrong answer: the right answer, shown over the question panel (the fight stays visible above). */
function WrongPopup({ boss, last, chosen, best, ms, label }) {
  return (
    <div className="absolute inset-0 z-40 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/70 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="wrong-title">
      <div className="mc-panel w-full max-w-2xl p-3 sm:p-5 space-y-2.5 animate-pop">
        <p id="wrong-title" className="font-title text-lg sm:text-xl text-[#b3261e] leading-tight">
          {last.timeout ? '⏰ Time’s up! −2 ♥' : '✖ Not quite! −2 ♥'}
          {last.escaped && <span className="block font-pixel text-sm sm:text-base mt-0.5">{boss.name} escaped!</span>}
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {chosen && (
            <div className="border-l-4 border-[#b3261e] pl-2">
              <p className="font-pixel text-sm text-[#666]">You picked</p>
              <p className="font-pixel text-base sm:text-[17px] text-[#2b2b2b] leading-snug">{chosen.text}</p>
              <p className="font-pixel text-sm sm:text-base text-[#555] leading-snug mt-0.5">{chosen.explain}</p>
            </div>
          )}
          <div className={`border-[3px] border-black bg-[#d9f2cf] p-2.5 sm:p-3 ${chosen ? '' : 'sm:col-span-2'}`} style={{ boxShadow: 'inset 3px 3px 0 #8fd17a' }}>
            <p className="font-pixel text-sm text-[#1f7a12]">✔ Right answer</p>
            <p className="font-pixel text-base sm:text-lg text-[#1f1f1f] leading-snug">{best.text}</p>
            <p className="font-pixel text-sm sm:text-base text-[#2b2b2b] leading-snug mt-1">💡 {best.explain}</p>
          </div>
        </div>
        <AutoNext ms={ms} label={label} />
      </div>
    </div>
  );
}

/**
 * Pre-fight: fighters walk in, name plates + VS, the announcer and both fighters talk,
 * then READY? → FIGHT! Tap / Enter moves to the next line; "Skip" jumps to READY.
 */
function useIntro({ active, boss, bossIndex, state, fighter, onFight }) {
  const script = useMemo(
    () => (active ? introScript({ boss, index: bossIndex, total: BOSSES.length, hp: state.hp, defeated: state.defeated, heroName: fighter.name }) : []),
    // A new script only when a new stage starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, bossIndex]
  );
  const [step, setStep] = useState(-1); // -1 plates, 0..n-1 lines, n ready, n+1 fight
  const fightRef = useRef(onFight);
  fightRef.current = onFight;
  useEffect(() => { if (!active) setStep(-1); }, [active]); // ready for the next stage

  const n = script.length;
  useEffect(() => {
    if (!active) return;
    let ms;
    if (step === -1) {
      play('vs');
      [0, 250, 500, 750].forEach((d) => setTimeout(() => play('step'), d));
      ms = 1700;
    } else if (step < n) {
      const line = script[step];
      if (line.who === 'boss') play(`roar_${boss.sprite}`);
      else if (line.who === 'hero') play('select');
      ms = Math.max(2000, Math.min(4000, 1000 + line.text.length * 40));
    } else if (step === n) {
      play('ready');
      announce(boss.final ? 'Final round. Ready?' : `Round ${state.round + 1}. Ready?`);
      ms = CUE_MS.ready + 400;
    } else if (step === n + 1) {
      play('fight');
      announce('Fight!', { pitch: 0.5, rate: 1.05 });
      ms = CUE_MS.fight;
    } else {
      fightRef.current();
      return;
    }
    const id = setTimeout(() => setStep((s) => s + 1), ms);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step, n]);

  const advance = useCallback(() => setStep((s) => (s < n ? s + 1 : s)), [n]);
  const skip = useCallback(() => setStep((s) => (s < n ? n : s)), [n]);
  return { script, step, n, advance, skip };
}

export default function Battle({ boss, bossIndex, fighter, state, fx, onAnswer, onNext, onTimeout, onFight, controls }) {
  const { round, rounds, score, last, phase, hp } = state;
  const { q } = rounds[round];
  const intro = phase === 'intro';
  const answered = phase === 'feedback';
  const chosen = answered ? q.options.find((o) => o.id === last.optionId) : null;
  const best = q.options.find((o) => o.correct);
  const isFinalRound = round + 1 >= rounds.length;
  const type = QUESTION_TYPES[q.type] || QUESTION_TYPES.work;
  const delay = answered ? feedbackDelay(last) : 0;
  const nextLabel = hp <= 0 ? '☠ Final blow…' : isFinalRound ? '🏁 Finishing move…' : last?.ko || last?.escaped ? '▶ Next stage…' : '▶ Next round…';
  const style = STYLES[fighter.style];

  const { script, step, n, advance, skip } = useIntro({ active: intro, boss, bossIndex, state, fighter, onFight });
  const speaker = intro && step >= 0 && step < n ? script[step].who : null;
  const roundLabel = boss.final ? 'Final round' : `Round ${round + 1}`;

  // Between the two questions of a stage: a quick "ROUND 2 … FIGHT!" cue. The clock waits for it.
  const [cue, setCue] = useState(null);
  const prevRound = useRef(round);
  useEffect(() => {
    const was = prevRound.current;
    prevRound.current = round;
    if (phase !== 'playing' || was === round || rounds[was]?.bossIndex !== rounds[round].bossIndex) return;
    setCue('ready');
    play('ready');
    announce(`Round ${round + 1}`);
    const a = setTimeout(() => { setCue('fight'); play('fight'); announce('Fight!', { pitch: 0.5, rate: 1.05 }); }, CUE_MS.round);
    const b = setTimeout(() => setCue(null), CUE_MS.round + CUE_MS.fight);
    return () => { clearTimeout(a); clearTimeout(b); setCue(null); };
  }, [round, phase, rounds]);

  const live = phase === 'playing' && !cue;

  // Topic sound when a new question appears (email ping, phone ring, camera click...).
  useEffect(() => {
    if (!live) return;
    const id = setTimeout(() => play(q.sfx), 250);
    return () => clearTimeout(id);
  }, [live, q.id, q.sfx]);

  // Right answers: bring the explanation into view (it can sit below the options on short screens).
  const cheer = useRef(null);
  useEffect(() => {
    if (answered && last.correct) setTimeout(() => cheer.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 150);
  }, [answered, last]);

  // Wrong answers: the pop-up opens once the boss's attack has landed.
  const [popup, setPopup] = useState(false);
  useEffect(() => {
    setPopup(false);
    if (!answered || last.correct) return;
    const id = setTimeout(() => setPopup(true), WRONG_POPUP_AFTER);
    return () => clearTimeout(id);
  }, [answered, last, round]);

  // Keys: 1-4 / A-D answer. Enter or Space skips waits and intro lines.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (intro) {
        if (k === 'ENTER' || k === ' ') { e.preventDefault(); advance(); }
        else if (k === 'ESCAPE' || k === 'S') skip();
      } else if (live) {
        const i = KEYS.indexOf(k) >= 0 ? KEYS.indexOf(k) : LETTERS.indexOf(k);
        if (i >= 0 && q.options[i]) onAnswer(q.options[i]);
      } else if (answered && (k === 'ENTER' || k === ' ')) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [intro, live, answered, q, onAnswer, onNext, advance, skip]);

  const introCue = intro && step === n ? 'ready' : intro && step === n + 1 ? 'fight' : null;
  const center = (
    <>
      <p className="font-pixel text-[10px] sm:text-xs text-mcaqua mc-text-dark uppercase tracking-wider whitespace-nowrap mb-0.5">
        {intro ? `Stage ${bossIndex + 1}/${BOSSES.length}` : `Round ${round + 1}/${rounds.length}`}
      </p>
      <Timer seconds={secondsFor(boss, q)} running={live} onTimeout={onTimeout} roundKey={round} />
      <p className="font-pixel text-xs sm:text-sm text-mcyellow mc-text-dark mt-0.5 whitespace-nowrap">⭐ {score}</p>
    </>
  );

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-[#0b0a10]">
      <div className="relative shrink-0 h-[44dvh] sm:h-[50dvh] lg:h-[56dvh] [@media(max-height:520px)]:h-[52dvh]">
        <Arena boss={boss} fighter={fighter} state={state} fx={fx} speaker={speaker} walkIn={intro && step === -1} center={center} controls={controls}>
          {intro && step < n && (
            <>
              {/* Name plates */}
              <div className="absolute left-2 sm:left-6 bottom-3 z-20 animate-walkInL">
                <p className="font-title text-lg sm:text-3xl text-white uppercase leading-none" style={{ textShadow: `3px 3px 0 #000, 0 0 16px ${fighter.accent}` }}>{fighter.name}</p>
                <p className="font-pixel text-xs sm:text-base text-white/80 mc-text-dark">{style.icon} {style.label}</p>
              </div>
              <div className="absolute right-2 sm:right-6 bottom-3 z-20 text-right animate-walkInR">
                <p className="font-title text-lg sm:text-3xl uppercase leading-none" style={{ color: boss.color, textShadow: '3px 3px 0 #000' }}>{boss.name}</p>
                <p className="font-pixel text-xs sm:text-base text-white/80 mc-text-dark">{boss.title}</p>
              </div>
              {step === -1 && (
                <div className="absolute inset-x-0 top-[40%] z-[6] flex justify-center pointer-events-none">
                  <span className="font-title text-6xl sm:text-8xl text-mcyellow animate-vs" style={{ animationDelay: '0.9s', textShadow: '4px 4px 0 #3f3f00, 0 0 24px #ff0' }}>VS</span>
                </div>
              )}
            </>
          )}
        </Arena>
      </div>

      {/* Bottom: dialogue box during the intro, the question during the fight */}
      <div className="relative flex-1 min-h-0" style={{ borderTop: `4px solid ${boss.color}`, boxShadow: `0 -6px 24px ${boss.color}55`, background: 'linear-gradient(180deg,#16131f,#0b0a10)' }}>
        {intro ? (
          <div className="h-full overflow-y-auto flex items-center justify-center p-3 sm:p-6 cursor-pointer" onClick={advance}>
            <div className="w-full max-w-3xl">
              {step === -1 || step >= n ? (
                <div className="text-center animate-rise" key="stage">
                  <p className="font-title text-base sm:text-2xl text-mcyellow uppercase tracking-widest mc-text-dark">{boss.final ? '⚠ Final stage ⚠' : `Stage ${bossIndex + 1}`}</p>
                  <p className="font-title text-2xl sm:text-5xl text-white uppercase mt-1" style={{ textShadow: `3px 3px 0 #000, 0 0 20px ${boss.color}` }}>{biomeLabel(boss.biome)}</p>
                </div>
              ) : (
                <div key={step} className="mc-dark p-3 sm:p-5 animate-rise" style={{ boxShadow: `inset 0 0 0 3px ${speaker === 'boss' ? boss.color : speaker === 'hero' ? fighter.accent : '#facc15'}` }}>
                  <p className={`font-title text-sm sm:text-lg uppercase ${speaker === 'boss' ? 'text-right' : ''}`} style={{ color: speaker === 'boss' ? boss.color : speaker === 'hero' ? fighter.accent : '#facc15', textShadow: '2px 2px 0 #000' }}>
                    {speaker === 'boss' ? boss.name : speaker === 'hero' ? fighter.name : '🎙 Announcer'}
                  </p>
                  <p className={`font-pixel text-lg sm:text-2xl lg:text-3xl text-white leading-snug mt-1 ${speaker === 'boss' ? 'text-right' : ''} ${speaker === 'announcer' ? 'text-center uppercase' : ''}`}>
                    “<Typewriter text={script[step].text} speed={24} sound />”
                  </p>
                </div>
              )}
              {step < n && (
                <div className="flex items-center justify-between mt-3 font-pixel text-xs sm:text-sm text-white/60">
                  <span>Tap or press Enter ▸</span>
                  <button className="mc-btn !text-xs sm:!text-sm !px-3 !py-1" onClick={(e) => { e.stopPropagation(); skip(); }}>Skip intro ⏭</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto p-3 sm:p-4 grid gap-3 lg:grid-cols-2 lg:gap-6">
              <div className="min-w-0 animate-rise" key={q.id}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-pixel text-xs sm:text-sm px-2 py-0.5 border-2 border-black whitespace-nowrap" style={{ background: type.bg, color: type.fg }}>
                    {type.icon} {type.label}
                  </span>
                  <span className="font-pixel text-xs sm:text-sm text-mcgray truncate">{biomeLabel(boss.biome)}</span>
                </div>
                <p className="font-pixel text-lg sm:text-xl text-white leading-snug mc-text-dark">{q.scenario}</p>
                {q.doc && <Doc doc={q.doc} />}
                <p className="font-pixel text-base sm:text-lg text-mcyellow mt-2 leading-snug mc-text-dark">▸ {q.question}</p>
              </div>

              <div className="min-w-0 flex flex-col gap-2">
                <div className="grid gap-2" role="group" aria-label="Answer options">
                  {q.options.map((o, i) => {
                    let cls = '';
                    if (answered) cls = o.correct ? 'is-right' : o.id === last.optionId ? 'is-wrong' : 'is-dim';
                    return (
                      <button key={`${q.id}-${o.id}`} disabled={!live} onClick={() => onAnswer(o)} className={`mc-option animate-rise ${cls}`} style={{ animationDelay: `${0.05 + i * 0.06}s` }}>
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
                  <div ref={cheer} className="mc-panel p-3 space-y-1.5 animate-pop" aria-live="polite">
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
                {answered && !last.correct && !popup && (
                  <div className="mc-panel p-3 animate-pop">
                    <p className="font-pixel text-base sm:text-lg text-[#b3261e]">{last.timeout ? '⏰ Time’s up! −2 ♥' : '✖ Ouch! −2 ♥'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {answered && !last.correct && popup && (
          <WrongPopup key={round} boss={boss} last={last} chosen={chosen} best={best} ms={delay - WRONG_POPUP_AFTER} label={nextLabel} />
        )}
      </div>

      <Cue step={introCue || cue} label={introCue ? roundLabel : cue === 'ready' ? `Round ${round + 1}` : null} />
    </div>
  );
}
