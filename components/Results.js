'use client';
import { useMemo, useState } from 'react';
import { getTitle, roundsFaced } from '@/lib/game.mjs';
import { TAGLINES } from '@/lib/bosses.mjs';
import { track } from '@/lib/analytics';
import Mob from './Mob';
import { heroModel } from '@/lib/mobs';
import { Confetti, Hearts } from './ui';
import { StudyNotes, Toolkit } from './Extras';

const baseUrl = () => (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');

async function shareOrCopy({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
  } catch {
    window.prompt('Copy this:', `${text}\n${url}`);
  }
  return 'copied';
}

export default function Results({ state, fighter, victory, message, newBest, onReplay }) {
  const model = useMemo(() => heroModel(fighter), [fighter]);
  const { score, hp, defeated, bestStreak, correct, missed } = state;
  const title = getTitle(score);
  const faced = roundsFaced(state);
  const accuracy = faced ? Math.round((correct / faced) * 100) : 0;
  const [toast, setToast] = useState('');

  const flash = (r) => {
    if (r === 'cancelled') return;
    setToast(r === 'shared' ? 'Shared!' : 'Copied to clipboard!');
    setTimeout(() => setToast(''), 2500);
  };
  const onShare = async () => {
    track('share_click', { score, victory });
    const text = `🏹 OFFICE BOSS FIGHT\n${title.toUpperCase()}\nScore: ${score}/100 · Bosses: ${defeated}/5 · HP: ${hp}\n“${TAGLINES[title]}”`;
    flash(await shareOrCopy({ title: 'Office Boss Fight', text, url: baseUrl() }));
  };
  const onChallenge = async () => {
    track('challenge_click', { score, victory });
    const text = `Think you're better at AI than me? Beat my Office Boss Fight score of ${score}/100. ⚔️`;
    flash(await shareOrCopy({ title: 'Office Boss Fight Challenge', text, url: `${baseUrl()}?challenge=${score}` }));
  };

  return (
    <div className="relative z-10 space-y-5 max-w-3xl mx-auto py-2 pt-12 sm:pt-4">
      {victory && <Confetti />}
      <div className="text-center space-y-2">
        <h2 className={`font-title text-4xl sm:text-6xl animate-vs ${victory ? 'text-mcyellow' : 'text-[#ff5555]'}`} style={{ textShadow: victory ? '4px 4px 0 #3f3f00' : '4px 4px 0 #3f0000' }}>
          {victory ? 'You win!' : 'You died!'}
        </h2>
        <p className="font-pixel text-base sm:text-xl text-white mc-text-dark max-w-xl mx-auto">“{message}”</p>
        {!victory && <p className="font-pixel text-sm sm:text-base text-white/80 mc-text-dark">Score: <span className="text-mcyellow">{score}</span></p>}
      </div>

      <div className="mc-panel p-4 sm:p-5 mx-auto max-w-md overflow-hidden">
        {newBest && <span className="absolute top-3 -right-9 rotate-45 bg-mcyellow text-black font-pixel text-xs px-9 py-0.5 border-y-2 border-black">NEW BEST</span>}
        <p className="font-title text-sm text-[#3f3f3f] tracking-widest text-center">🏹 Office Boss Fight</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="mc-slot p-2 shrink-0"><Mob name="hero" model={model} variant={fighter.style} height={72} pose={victory ? 'cheer' : 'idle'} title={fighter.name} /></div>
          <div className="min-w-0">
            <p className="font-pixel text-sm text-[#555]">{fighter.name} · rank earned</p>
            <p className="font-title text-xl sm:text-2xl leading-tight text-[#5b2a86]">{title}</p>
            <div className="mt-1"><Hearts hp={hp} size={13} /></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          {[
            ['Score', score, '/100'],
            ['Bosses', defeated, '/5'],
            ['Accuracy', accuracy, '%'],
          ].map(([l, v, s]) => (
            <div key={l} className="mc-slot p-2">
              <p className="font-pixel text-xs text-white mc-text">{l}</p>
              <p className="font-title text-xl sm:text-2xl text-mcyellow mc-text-dark">{v}<span className="text-xs text-white">{s}</span></p>
            </div>
          ))}
        </div>
        <p className="font-pixel text-base text-[#2b2b2b] text-center mt-3">🔥 Best streak {bestStreak} · “{TAGLINES[title]}”</p>
        <p className="font-pixel text-xs text-[#555] text-center break-all mt-1">{baseUrl().replace(/^https?:\/\//, '')}</p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3 max-w-xl mx-auto">
        <button className="mc-btn mc-btn-green" onClick={onReplay}>{victory ? '🔁 Play again' : '☠ Rematch'}</button>
        <button className="mc-btn" onClick={onShare}>📤 Share</button>
        <button className="mc-btn" onClick={onChallenge}>⚔ Challenge</button>
      </div>
      <p className="font-pixel text-sm text-mcgreen h-4 text-center mc-text-dark" aria-live="polite">{toast}</p>

      <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
        <StudyNotes missed={missed} open={!victory} />
        <Toolkit />
      </div>
    </div>
  );
}
