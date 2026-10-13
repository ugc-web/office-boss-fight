'use client';
import { useState } from 'react';
import { getTitle, roundsFaced } from '@/lib/game.mjs';
import { TAGLINES } from '@/lib/bosses.mjs';
import { track } from '@/lib/analytics';
import Sprite from './Sprite';
import { Confetti } from './ui';
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

export default function Results({ state, victory, message, newBest, onReplay }) {
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
    <div className="space-y-5 relative">
      {victory && <Confetti />}
      <div className="text-center space-y-2">
        <h2 className={`font-pixel text-2xl sm:text-4xl text-glow animate-vs ${victory ? 'text-gold' : 'text-red-500'}`}>
          {victory ? 'YOU WIN!' : 'GAME OVER'}
        </h2>
        <p className="text-xl sm:text-2xl text-gray-300 italic">“{message}”</p>
      </div>

      <div className="panel p-5 mx-auto max-w-md overflow-hidden" style={{ boxShadow: '0 0 0 3px #a855f7, 0 0 40px rgba(168,85,247,.45), 6px 6px 0 3px #000' }}>
        {newBest && <span className="absolute top-3 -right-8 rotate-45 bg-gold text-navy font-pixel text-[8px] px-8 py-1 border-y-2 border-black">NEW BEST</span>}
        <p className="font-pixel text-[9px] text-cyanx tracking-[0.3em] text-center">🏹 OFFICE BOSS FIGHT</p>
        <div className="flex items-center gap-4 mt-4">
          <Sprite name="hero" size={64} className={victory ? 'animate-bob' : 'grayscale opacity-60 rotate-90'} />
          <div>
            <p className="text-base text-gray-400">Rank earned</p>
            <p className="font-pixel text-base sm:text-xl text-neon text-glow leading-relaxed">{title.toUpperCase()}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          {[
            ['SCORE', score, '/100', 'text-gold'],
            ['BOSSES', defeated, '/5', 'text-cyanx'],
            ['HP LEFT', hp, '', hp ? 'text-good' : 'text-red-500'],
          ].map(([l, v, s, c]) => (
            <div key={l} className="bg-black/40 border-2 border-black p-2">
              <p className="font-pixel text-[8px] text-gray-400">{l}</p>
              <p className={`font-pixel text-lg sm:text-xl mt-1 ${c}`}>{v}<span className="text-[9px] text-gray-500">{s}</span></p>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-lg text-gray-300 mt-3">
          <span>🎯 Accuracy {accuracy}%</span>
          <span>🔥 Best streak {bestStreak}</span>
        </div>
        <p className="text-xl text-good text-center mt-3">“{TAGLINES[title]}”</p>
        <p className="text-sm text-gray-500 text-center break-all">{baseUrl().replace(/^https?:\/\//, '')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 max-w-xl mx-auto">
        <button className="btn" onClick={onShare}>📤 Share {victory ? 'Result' : 'Score'}</button>
        <button className="btn btn-cyan" onClick={onChallenge}>⚔️ Challenge</button>
        <button className="btn btn-gold" onClick={onReplay}>🔁 {victory ? 'Play Again' : 'Retry'}</button>
      </div>
      <p className="font-pixel text-[10px] text-good h-4 text-center" aria-live="polite">{toast}</p>

      <StudyNotes missed={missed} open={!victory} />
      <Toolkit />
    </div>
  );
}
