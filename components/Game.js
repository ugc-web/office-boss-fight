'use client';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BOSSES, GAME_OVER_MESSAGES, VICTORY_MESSAGES } from '@/lib/bosses.mjs';
import { buildRounds, initialState, startRound, answer, next, getTitle, bossIndexOf } from '@/lib/game.mjs';
import { track, getBest, saveBest } from '@/lib/analytics';
import { play, getMuted, setMuted } from '@/lib/sound';
import Landing from './Landing';
import Battle from './Battle';
import BossIntro from './BossIntro';
import Results from './Results';
import { Cabinet } from './Extras';

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
  const [locked, setLocked] = useState(false); // blocks double input during animations

  useEffect(() => {
    setBest(getBest());
    setMutedState(getMuted());
    if (challenge) track('challenge_link_open', { challenge: +challenge });
  }, [challenge]);

  const start = () => {
    track('game_start', { run: runs + 1, challenge: challenge ? +challenge : undefined });
    if (runs > 0) track('replay', { run: runs + 1 });
    setRuns((r) => r + 1);
    setState(initialState(buildRounds(BOSSES)));
    setNewBest(false);
    setScreen('game');
    play('vs');
    window.scrollTo({ top: 0 });
  };

  const fight = () => {
    play('select');
    setState((s) => startRound(s));
  };

  const onAnswer = useCallback(
    (opt) => {
      if (locked || state?.phase !== 'playing') return;
      setLocked(true);
      setTimeout(() => setLocked(false), 450);
      const { q, bossIndex } = state.rounds[state.round];
      const s = answer(state, opt);
      setState(s);
      track('answer', { boss: BOSSES[bossIndex].id, question: q.id, kind: q.kind, round: state.round + 1, correct: s.last.correct });
      play('arrow');
      play(s.last.correct ? (s.last.ko ? 'ko' : 'hit') : 'hurt');
      if (s.last.chai) setTimeout(() => play('heal'), 900);
    },
    [state, locked]
  );

  const onNext = useCallback(() => {
    if (locked || state?.phase !== 'feedback') return;
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
  }, [state, locked]);

  const toggleMute = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  const boss = state ? BOSSES[bossIndexOf(state)] : null;
  const inBattle = screen === 'game' && (state?.phase === 'playing' || state?.phase === 'feedback');

  return (
    <div className="w-full max-w-2xl">
      <Cabinet>
        <button
          onClick={toggleMute}
          className="absolute top-2 right-2 z-40 text-lg bg-black/60 border-2 border-black px-1.5 py-1 leading-none"
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {screen === 'landing' && <Landing onStart={start} best={best} challenge={challenge} />}
        {screen === 'game' && state?.phase === 'intro' && (
          <BossIntro key={bossIndexOf(state)} boss={boss} index={bossIndexOf(state)} total={BOSSES.length} onFight={fight} />
        )}
        {inBattle && <Battle boss={boss} state={state} onAnswer={onAnswer} onNext={onNext} />}
        {screen === 'results' && (
          <Results
            state={state}
            victory={state.phase === 'victory'}
            newBest={newBest}
            onReplay={start}
            message={state.phase === 'victory' ? VICTORY_MESSAGES[getTitle(state.score)] : goMsg}
          />
        )}
      </Cabinet>
    </div>
  );
}
