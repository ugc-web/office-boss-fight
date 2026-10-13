'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BOSSES, GAME_OVER_MESSAGES } from '@/lib/bosses.mjs';
import { initialState, answer, next, shuffle, getTitle } from '@/lib/game.mjs';
import { track, getBest, saveBest } from '@/lib/analytics';
import { play, getMuted, setMuted } from '@/lib/sound';
import Landing from './Landing';
import Battle from './Battle';
import Results from './Results';

const VICTORY_MESSAGES = {
  'AI Overlord': 'Inbox zero. Deadlines crushed. Your manager wants to know your secret.',
  'Corporate Survivor': 'You made it to 5 PM. Some bosses are still roaming the office.',
  'Manual Labour Legend': 'You survived on pure grit. Imagine what you could do with AI.',
};

export default function Game() {
  const params = useSearchParams();
  const challengeRaw = params.get('challenge');
  const challenge = challengeRaw && /^\d{1,3}$/.test(challengeRaw) && +challengeRaw <= 100 ? challengeRaw : null;

  const [screen, setScreen] = useState('landing');
  const [state, setState] = useState(() => initialState(BOSSES.length));
  const [options, setOptions] = useState([]); // shuffled options per boss
  const [runs, setRuns] = useState(0);
  const [best, setBest] = useState(null);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [goMsg, setGoMsg] = useState(GAME_OVER_MESSAGES[0]);

  useEffect(() => {
    setBest(getBest());
    setMutedState(getMuted());
    if (challenge) track('challenge_link_open', { challenge: +challenge });
  }, [challenge]);

  const start = () => {
    play('click');
    track('game_start', { run: runs + 1, challenge: challenge ? +challenge : undefined });
    if (runs > 0) track('replay', { run: runs + 1 });
    setRuns((r) => r + 1);
    setOptions(BOSSES.map((b) => shuffle(b.options)));
    setState(initialState(BOSSES.length));
    setNewBest(false);
    setScreen('game');
    window.scrollTo({ top: 0 });
  };

  const onAnswer = (opt) => {
    const boss = BOSSES[state.level];
    const s = answer(state, boss.id, opt);
    setState(s);
    track('answer', { boss: boss.id, level: state.level + 1, correct: s.last.correct, option: opt.id });
    play(s.last.correct ? 'hit' : 'hurt');
    if (s.last.chai) setTimeout(() => play('heal'), 350);
  };

  const onNext = () => {
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
      play('click');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMute = () => {
    setMuted(!muted);
    setMutedState(!muted);
  };

  const boss = BOSSES[Math.min(state.level, BOSSES.length - 1)];
  const bossOptions = useMemo(() => options[state.level] || boss.options, [options, state.level, boss]);

  return (
    // Arcade cabinet frame on desktop, edge-to-edge compact on mobile
    <div className="w-full max-w-2xl">
      <div className="sm:rounded-t-3xl sm:bg-gradient-to-b sm:from-neon sm:to-indigo-900 sm:p-3 sm:pb-0 sm:border-4 sm:border-black">
        <div className="hidden sm:flex justify-center py-2 font-pixel text-xs text-white tracking-[0.3em]" aria-hidden>
          ★ OFFICE BOSS FIGHT ★
        </div>
        <div className="relative bg-navy border-4 border-black p-4 sm:p-6 shadow-[inset_0_0_40px_rgba(34,211,238,0.15)]">
          <button
            onClick={toggleMute}
            className="absolute top-2 right-2 text-xl z-10 bg-black/40 border-2 border-black px-2"
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {screen === 'landing' && <Landing onStart={start} best={best} challenge={challenge} />}
          {screen === 'game' && (
            <Battle boss={boss} options={bossOptions} state={state} onAnswer={onAnswer} onNext={onNext} />
          )}
          {screen === 'results' && (
            <Results
              state={state}
              victory={state.phase === 'victory'}
              message={state.phase === 'victory' ? VICTORY_MESSAGES[getTitle(state.score)] : goMsg}
              newBest={newBest}
              onReplay={start}
            />
          )}
        </div>
      </div>
      <div className="hidden sm:block h-6 bg-indigo-900 border-4 border-t-0 border-black" aria-hidden />
    </div>
  );
}
