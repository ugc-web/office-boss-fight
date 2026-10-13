'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BOSSES, GAME_OVER_MESSAGES, VICTORY_MESSAGES } from '@/lib/bosses.mjs';
import { buildRounds, initialState, startRound, answer, next, timeout, getTitle, bossIndexOf, feedbackDelay } from '@/lib/game.mjs';
import { STYLES, PRESETS } from '@/lib/fighters.mjs';
import { KINDS, attackContext, commentFor, createMoveHistory } from '@/lib/moves.mjs';
import { track, getBest, saveBest } from '@/lib/analytics';
import { play, announce, getMuted, setMuted, startMusic, stopMusic, duck } from '@/lib/sound';
import { canFullscreen, enterFullscreen, exitFullscreen, isFullscreen, onFullscreenChange } from '@/lib/fullscreen';
import Landing from './Landing';
import FighterSelect from './FighterSelect';
import Battle from './Battle';
import Finale from './Finale';
import Results from './Results';
import { Screen } from './Extras';

const WINDUP_SFX = { shot: 'swoosh', dash: 'swoosh', uppercut: 'swoosh', slam: 'swoosh', spin: 'swoosh', rain: 'magic', beam: 'beam', summon: 'rumble', teleport: 'blink' };
const HIT_SFX = { arrow: 'hit', slash: 'slash', fist: 'punch', orb: 'zap' };

/** Sound design for one attack, timed to the animation in Arena.js. */
function playAttack(move, attacker, last, boss, style) {
  const k = KINDS[move.kind];
  const at = (ms, name) => setTimeout(() => play(name), ms);
  const heroFx = STYLES[style].fx;
  duck(k.ms + 800);
  if (attacker === 'boss') play(last.timeout ? 'timeout' : `roar_${boss.sprite}`);
  at(attacker === 'boss' ? 250 : 0, move.kind === 'shot' && heroFx === 'arrow' && attacker === 'hero' ? 'bowDraw' : WINDUP_SFX[move.kind]);
  if (move.kind === 'shot') at(k.impact - 380, attacker === 'hero' && heroFx === 'arrow' ? 'arrow' : 'swoosh');
  if (move.kind === 'slam') at(k.impact, 'slam');
  const hit = attacker === 'hero' ? HIT_SFX[heroFx] : 'punch';
  for (let i = 0; i < Math.min(move.hits, 6); i++) at(k.impact + i * 90, hit);
  if (attacker === 'hero') {
    if (move.tier === 3) at(k.impact + 60, 'crit');
    at(k.impact + 260, 'xp');
    if (last.ko) {
      at(k.impact + 120, 'ko');
      setTimeout(() => announce('K.O.!', { pitch: 0.5 }), k.impact + 300);
      at(k.impact + 1100, 'levelup');
    }
    if (last.chai) at(k.impact + 1300, 'heal');
  } else {
    at(k.impact + 60, 'hurt');
  }
}

/** Sound and full-screen buttons. */
function SystemButtons({ muted, onMute, full, onFull, className = '' }) {
  return (
    <div className={`flex gap-1.5 ${className}`}>
      {onFull && (
        <button onClick={onFull} className="mc-btn !px-2.5 !py-1 text-base" aria-label={full ? 'Exit full screen' : 'Full screen'} title={full ? 'Exit full screen' : 'Full screen'}>
          {full ? '🗗' : '⛶'}
        </button>
      )}
      <button onClick={onMute} className="mc-btn !px-2.5 !py-1 text-base" aria-label={muted ? 'Turn sound on' : 'Turn sound off'} title={muted ? 'Sound off' : 'Sound on'}>
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

export default function Game() {
  const params = useSearchParams();
  const raw = params.get('challenge');
  const challenge = raw && /^\d{1,3}$/.test(raw) && +raw <= 100 ? raw : null;

  const [screen, setScreen] = useState('landing'); // landing | select | game | finale | results
  const [state, setState] = useState(null);
  const [fighter, setFighter] = useState(PRESETS[0]);
  const [fx, setFx] = useState(null); // the attack playing after an answer
  const [runs, setRuns] = useState(0);
  const [best, setBest] = useState(null);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [full, setFull] = useState(false);
  const [fsOk, setFsOk] = useState(false);
  const [goMsg, setGoMsg] = useState(GAME_OVER_MESSAGES[0]);
  const locked = useRef(false); // blocks double input during animations
  const moves = useRef(createMoveHistory());

  useEffect(() => {
    setBest(getBest());
    setMutedState(getMuted());
    setFsOk(canFullscreen());
    if (challenge) track('challenge_link_open', { challenge: +challenge });
    return onFullscreenChange(() => setFull(isFullscreen()));
  }, [challenge]);

  // Background music follows the screen and the current boss.
  const boss = state ? BOSSES[bossIndexOf(state)] : null;
  const musicKey = screen === 'game' && boss ? boss.sprite : screen === 'landing' || screen === 'select' ? 'menu' : null;
  const started = useRef(false);
  useEffect(() => {
    if (!started.current) return; // browsers only allow audio after the first tap
    if (musicKey) startMusic(musicKey);
    else stopMusic();
  }, [musicKey]);
  useEffect(() => () => stopMusic(), []);

  // Landing -> fighter select. Goes full screen (needs the click).
  const toSelect = () => {
    started.current = true;
    enterFullscreen();
    play('select');
    startMusic('menu');
    setScreen('select');
  };

  const start = (f) => {
    setFighter(f);
    track('game_start', { run: runs + 1, challenge: challenge ? +challenge : undefined, style: f.style, custom: !f.preset });
    if (runs > 0) track('replay', { run: runs + 1 });
    setRuns((r) => r + 1);
    moves.current = createMoveHistory();
    setFx(null);
    setState(initialState(buildRounds(BOSSES)));
    setNewBest(false);
    setScreen('game');
    startMusic(BOSSES[0].sprite);
  };

  const fight = useCallback(() => setState((s) => startRound(s)), []);

  const resolve = useCallback(
    (s, prev) => {
      const { q, bossIndex } = prev.rounds[prev.round];
      const b = BOSSES[bossIndex];
      // Whoever won the question attacks, with a move that fits the moment and never repeats back to back.
      const atk = attackContext(prev, s);
      const pool = atk.attacker === 'hero' ? STYLES[fighter.style].moves : b.moves;
      const move = moves.current.pick(atk.attacker, pool, atk.tiers);
      const comment = commentFor(atk.attacker, atk.ctx, { hero: fighter.name, boss: b.name, n: s.streak });
      setFx({ key: `${prev.round}-${move.name}`, attacker: atk.attacker, move, ctx: atk.ctx, comment });
      setState(s);
      track('answer', { boss: b.id, question: q.id, type: q.type, round: prev.round + 1, correct: s.last.correct, timeout: s.last.timeout, move: move.name });
      playAttack(move, atk.attacker, s.last, b, fighter.style);
    },
    [fighter]
  );

  const onAnswer = useCallback(
    (opt) => {
      if (locked.current || state?.phase !== 'playing') return;
      locked.current = true;
      setTimeout(() => (locked.current = false), 600);
      resolve(answer(state, opt), state);
    },
    [state, resolve]
  );

  const onTimeout = useCallback(() => {
    if (state?.phase !== 'playing') return;
    resolve(timeout(state), state);
  }, [state, resolve]);

  const onNext = useCallback(() => {
    if (locked.current || state?.phase !== 'feedback') return;
    const s = next(state);
    setState(s);
    setFx(null);
    if (s.phase === 'victory' || s.phase === 'gameover') {
      const victory = s.phase === 'victory';
      const result = { score: s.score, hp: s.hp, defeated: s.defeated, title: getTitle(s.score) };
      const isBest = saveBest(result);
      setNewBest(isBest);
      if (isBest) setBest(result);
      setGoMsg(GAME_OVER_MESSAGES[Math.floor(Math.random() * GAME_OVER_MESSAGES.length)]);
      track(victory ? 'game_complete' : 'game_over', { ...result, missed: s.missed.join(','), style: fighter.style });
      setScreen('finale'); // the winner's finishing move, then the results
    } else if (s.phase === 'intro') {
      play('vs');
    }
  }, [state, fighter]);

  // No "Next" button: after the feedback has been shown, move on by itself.
  // Right answers move on quickly; wrong answers wait longer so the right answer can be read.
  const advance = useRef(onNext);
  advance.current = onNext;
  const phase = state?.phase;
  const lastResult = state?.last;
  useEffect(() => {
    if (screen !== 'game' || phase !== 'feedback') return;
    const id = setTimeout(() => advance.current(), feedbackDelay(lastResult));
    return () => clearTimeout(id);
  }, [screen, phase, lastResult]);

  const toggleMute = () => {
    setMuted(!muted);
    setMutedState(!muted);
    if (muted && musicKey) { started.current = true; startMusic(musicKey); }
  };
  const toggleFull = () => (isFullscreen() ? exitFullscreen() : enterFullscreen());
  const buttons = (cls) => <SystemButtons muted={muted} onMute={toggleMute} full={full} onFull={fsOk ? toggleFull : null} className={cls} />;

  const victory = state?.phase === 'victory';

  return (
    <Screen biome={screen === 'landing' ? 'menu' : boss?.biome || 'menu'} dim={screen !== 'landing'}>
      {screen !== 'game' && screen !== 'finale' && buttons('fixed top-2 right-2 sm:top-4 sm:right-4 z-[80]')}

      {screen === 'landing' && <Landing onStart={toSelect} best={best} challenge={challenge} />}
      {screen === 'select' && <FighterSelect current={fighter} onPick={start} onBack={() => setScreen(state ? 'results' : 'landing')} />}
      {screen === 'game' && state && (state.phase === 'intro' || state.phase === 'playing' || state.phase === 'feedback') && (
        <Battle
          boss={boss}
          bossIndex={bossIndexOf(state)}
          fighter={fighter}
          state={state}
          fx={fx}
          onAnswer={onAnswer}
          onNext={onNext}
          onTimeout={onTimeout}
          onFight={fight}
          controls={buttons('')}
        />
      )}
      {screen === 'finale' && state && (
        <Finale victory={victory} boss={boss} fighter={fighter} state={state} onDone={() => setScreen('results')} />
      )}
      {screen === 'results' && state && (
        <Results
          state={state}
          fighter={fighter}
          victory={victory}
          newBest={newBest}
          onReplay={() => setScreen('select')}
          message={victory ? VICTORY_MESSAGES[getTitle(state.score)] : goMsg}
        />
      )}
    </Screen>
  );
}
