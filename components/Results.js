'use client';
import { useState } from 'react';
import { getTitle } from '@/lib/game.mjs';
import { TAGLINES } from '@/lib/bosses.mjs';
import { track } from '@/lib/analytics';

function baseUrl() {
  return typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
}

async function shareOrCopy({ title, text, url }) {
  const full = `${text}\n${url}`;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(full);
    return 'copied';
  } catch {
    window.prompt('Copy this link:', full);
    return 'copied';
  }
}

export default function Results({ state, victory, message, newBest, onReplay }) {
  const { score, hp, defeated, totalBosses } = state;
  const title = getTitle(score);
  const tagline = TAGLINES[title];
  const [toast, setToast] = useState('');

  const flash = (r) => {
    if (r === 'copied') setToast('Link copied to clipboard!');
    else if (r === 'shared') setToast('Shared!');
    setTimeout(() => setToast(''), 2500);
  };

  const onShare = async () => {
    track('share_click', { score, victory });
    const text = `I scored ${score}/100 in Office Boss Fight and earned the title "${title}". Bosses defeated: ${defeated}/${totalBosses}. HP left: ${hp}. "${tagline}"`;
    flash(await shareOrCopy({ title: 'Office Boss Fight', text, url: baseUrl() }));
  };

  const onChallenge = async () => {
    track('challenge_click', { score, victory });
    const url = `${baseUrl()}?challenge=${score}`;
    const text = `Think you're better at AI than me? Beat my Office Boss Fight score of ${score}/100.`;
    flash(await shareOrCopy({ title: 'Office Boss Fight Challenge', text, url }));
  };

  return (
    <div className="space-y-5 text-center">
      <div className="text-6xl sm:text-7xl animate-pop" aria-hidden>
        {victory ? '🏆' : '💀'}
      </div>
      <h2 className={`font-pixel text-lg sm:text-2xl ${victory ? 'text-good' : 'text-bad'}`}>
        {victory ? 'WORKDAY SURVIVED!' : 'GAME OVER'}
      </h2>
      <p className="text-xl sm:text-2xl text-gray-300 italic">“{message}”</p>

      {/* Shareable result card */}
      <div id="result-card" className="pixel-box p-5 space-y-3 mx-auto max-w-sm relative overflow-hidden">
        <p className="font-pixel text-[10px] text-cyanx tracking-widest">OFFICE BOSS FIGHT</p>
        <p className="font-pixel text-base sm:text-xl text-neon leading-relaxed">{title.toUpperCase()}</p>
        <div className="text-2xl space-y-1">
          <p>Score: <b className="text-white">{score}/100</b></p>
          <p>Bosses defeated: <b className="text-white">{defeated}/{totalBosses}</b></p>
          <p>HP remaining: <b className="text-white">{hp}</b></p>
        </div>
        <p className="text-xl text-good">“{tagline}”</p>
        <p className="text-base text-gray-400 break-all">{baseUrl().replace(/^https?:\/\//, '')}</p>
        {newBest && (
          <span className="absolute top-2 right-2 font-pixel text-[8px] bg-bad text-black px-1 rotate-12">NEW BEST</span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3 max-w-xl mx-auto">
        <button className="pixel-btn" onClick={onShare}>📤 Share {victory ? 'Result' : 'Score'}</button>
        {victory && (
          <button className="pixel-btn pixel-btn-alt" onClick={onChallenge}>⚔️ Challenge a Colleague</button>
        )}
        <button className={`pixel-btn pixel-btn-ghost ${victory ? '' : 'sm:col-span-2'}`} onClick={onReplay}>
          🔁 {victory ? 'Play Again' : 'Retry'}
        </button>
      </div>
      <p className="font-pixel text-[10px] text-good h-4" aria-live="polite">{toast}</p>
    </div>
  );
}
