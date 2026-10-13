'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BOSSES, GAME_OVER_MESSAGES, VICTORY_MESSAGES } from '@/lib/bosses.mjs';
import { buildRounds, initialState, startRound, answer, next, timeout, getTitle, bossIndexOf, feedbackDelay } from '@/lib/game.mjs';
import { track, getBest, saveBest } from '@/lib/analytics';
import { play, getMuted, setMuted, startMusic, stopMusic, duck } from '@/lib/sound';
import Landing from './Landing';
import Battle from './Battle';
import BossIntro from './BossIntro';
import Results from './Results';
import { Screen } from './Extras';

export default function Game() {
  const params = useSearchParams();
  const raw = params.get('challenge');
  const challenge = raw && /^\d{1,3}$/.test(raw) && +raw <= 100 ? raw : null;

  const [screen, setScreen] = useState('landing');
  const [state, setState] = useState(null);
  const [runs, setRuns] = useState(0);
  const [best, setBest] = useState(null);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [goMsg, setGoMsg] = useState(GAME_OVER_MESSAGES[0]);
  const [entering, setEntering] = useState(false); // fighters walking in at the start of a boss
  const locked = useRef(false); // blocks double input during animations

  useEffect(() => {
    setBest(getBest());
    setMutedState(getMuted());
    if (challenge) track('challenge_link_open', { challenge: +challenge });
  }, [challenge]);

  // Background music follows the screen and the current boss.
  const boss = state ? BOSSES[bossIndexOf(state)] : null;
  const musicKey = screen === 'game' && boss ? boss.sprite : screen === 'landing' ? 'menu' : null;
  const started = useRef(false);
  useEffect(() => {
    if (!started.current) return; // browsers only allow audio after the first tap
    if (musicKey) startMusic(musicKey);
    else stopMusic();
  }, [musicKey]);
  useEffect(() => () => stopMusic(), []);

  const start = () => {
    started.current = true;
    track('game_start', { run: runs + 1, challenge: challenge ? +challenge : undefined });
    if (runs > 0) track('replay', { run: runs + 1 });
    setRuns((r) => r + 1);
    setState(initialState(buildRounds(BOSSES)));
    setNewBest(false);
    setScreen('game');
    play('vs');
    startMusic(BOSSES[0].sprite);
    window.scrollTo({ top: 0 });
  };

  const fight = () => {
    play('select');
    setState((s) => startRound(s));
    setEntering(true);
    setTimeout(() => setEntering(false), 1100);
    window.scrollTo({ top: 0 });
  };

  const resolve = useCallback(
    (s, prev) => {
      const { q, bossIndex } = prev.rounds[prev.round];
      const b = BOSSES[bossIndex];
      setState(s);
      track('answer', { boss: b.id, question: q.id, type: q.type, round: prev.round + 1, correct: s.last.correct, timeout: s.last.timeout });
      duck(1600);
      if (s.last.correct) {
        play('bowDraw');
        setTimeout(() => play('arrow'), 220);
        setTimeout(() => play(s.last.ko ? 'ko' : 'hit'), 440);
        setTimeout(() => play('xp'), 700);
        if (s.last.ko) setTimeout(() => play('levelup'), 1300);
      } else {
        play(s.last.timeout ? 'timeout' : `roar_${b.sprite}`);
        setTimeout(() => play('hurt'), 450);
      }
      if (s.last.chai) setTimeout(() => play('heal'), 1500);
    },
    []
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
    if (s.phase === 'victory' || s.phase === 'gameover') {
      const victory = s.phase === 'victory';
      const result = { score: s.score, hp: s.hp, defeated: s.defeated, title: getTitle(s.score) };
      const isBest = saveBest(result);
      setNewBest(isBest);
      if (isBest) setBest(result);
      setGoMsg(GAME_OVER_MESSAGES[Math.floor(Math.random() * GAME_OVER_MESSAGES.length)]);
      track(victory ? 'game_complete' : 'game_over', { ...result, missed: s.missed.join(',') });
      play(victory ? 'win' : 'lose');
      setScreen('results');
    } else {
      play(s.phase === 'intro' ? 'vs' : 'click');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state]);

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

  const inBattle = screen === 'game' && (state?.phase === 'playing' || state?.phase === 'feedback');
  const biome = screen === 'game' && boss ? boss.biome : 'menu';

  return (
    <Screen biome={biome} dim={screen !== 'landing'}>
      <button
        onClick={toggleMute}
        className="mc-btn absolute top-2 right-2 sm:top-4 sm:right-4 z-50 !px-2.5 !py-1.5 text-lg"
        aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
        title={muted ? 'Sound off' : 'Sound on'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      {screen === 'landing' && <Landing onStart={start} best={best} challenge={challenge} />}
      {screen === 'game' && state?.phase === 'intro' && (
        <div className="max-w-4xl mx-auto">
          <BossIntro key={bossIndexOf(state)} boss={boss} index={bossIndexOf(state)} total={BOSSES.length} onFight={fight} />
        </div>
      )}
      {inBattle && <Battle boss={boss} state={state} onAnswer={onAnswer} onNext={onNext} onTimeout={onTimeout} entering={entering} />}
      {screen === 'results' && (
        <Results
          state={state}
          victory={state.phase === 'victory'}
          newBest={newBest}
          onReplay={start}
          message={state.phase === 'victory' ? VICTORY_MESSAGES[getTitle(state.score)] : goMsg}
        />
      )}
    </Screen>
  );
}
