'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Mob from './Mob';
import World from './World';
import { Confetti, Particles } from './ui';
import { useLayout, useSize } from './Arena';
import { STYLES } from '@/lib/fighters.mjs';
import { finaleWords } from '@/lib/moves.mjs';
import { getTitle } from '@/lib/game.mjs';
import { heroModel } from '@/lib/mobs';
import { play, announce, duck } from '@/lib/sound';

// Timeline of the finishing move (ms from the start).
const T = { rush: 1200, launch: 3300, crash: 4550, word: 4900, extra: 6400, auto: 12000 };
const HIT_SFX = { arrow: 'hit', slash: 'slash', fist: 'punch', orb: 'zap' };

/**
 * End of the game: the winner's finishing move. A long combo, a launch, a crash, then a big word
 * ("UNBEATABLE!", "FLAWLESS VICTORY", or "<BOSS> WINS") that stays on screen so the win sinks in.
 */
export default function Finale({ victory, boss, fighter, state, onDone }) {
  const ref = useRef(null);
  const { w, h } = useSize(ref);
  const L = useLayout(w, h, boss);
  const model = useMemo(() => heroModel(fighter), [fighter]);
  const style = STYLES[fighter.style];
  const words = finaleWords({ victory, hp: state.hp, score: state.score, boss, heroName: fighter.name });
  const ultimate = victory ? style.ultimate : boss.moves.find((m) => m.tier === 3)?.name || 'Final Blow';
  const color = victory ? fighter.accent : boss.color;
  const glow = victory ? '#facc15' : '#ef4444';
  const totalHits = victory ? 18 + Math.round(state.score / 10) : 15;

  const [phase, setPhase] = useState('cry'); // cry | rush | launch | crash | word | extra
  const [hits, setHits] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const ids = [];
    const at = (ms, fn) => ids.push(setTimeout(fn, ms));
    duck(9000);
    play('vs');
    announce(words.cry, { pitch: 0.5 });
    at(T.rush, () => { setPhase('rush'); play('blink'); });
    const step = (T.launch - T.rush - 200) / totalHits;
    for (let i = 1; i <= totalHits; i++) {
      at(T.rush + 200 + i * step, () => {
        setHits(i);
        play(i % 3 === 0 ? 'punch' : victory ? HIT_SFX[style.fx] : 'slash');
      });
    }
    at(T.launch, () => { setPhase('launch'); play('crit'); play('swoosh'); });
    at(T.crash, () => { setPhase('crash'); play('slam'); play(victory ? 'ko' : 'hurt'); });
    at(T.word, () => {
      setPhase('word');
      play('finisher');
      announce(words.big.replace(/!/g, ''), { pitch: 0.45, rate: 0.85 });
    });
    at(T.word + 1600, () => play(victory ? 'win' : 'lose'));
    at(T.extra, () => setPhase('extra'));
    at(T.auto, () => doneRef.current());
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ready = phase === 'word' || phase === 'extra';
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && phase === 'extra') { e.preventDefault(); onDone(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onDone]);

  const heroAtk = victory;
  const rushing = phase === 'rush';
  const after = phase === 'launch' || phase === 'crash' || ready;
  // The attacker teleports next to the defender for the combo, then steps back to watch them fly.
  const heroX = heroAtk && rushing ? L.foe.x - L.hero.w * 0.7 : L.hero.x;
  const foeX = !heroAtk && rushing ? L.hero.x + L.hero.w * 0.4 : L.foe.x;
  const atkPose = rushing ? 'attack' : ready ? 'cheer' : phase === 'launch' ? 'attack' : 'idle';
  const defPose = rushing ? 'hurt' : phase === 'crash' || ready ? 'ko' : phase === 'launch' ? 'hurt' : 'idle';
  const def = heroAtk ? { x: L.foe.x + L.foe.w / 2, h: L.foe.h, w: L.foe.w } : { x: L.hero.x + L.hero.w / 2, h: L.hero.h, w: L.hero.w };
  const rank = getTitle(state.score);
  // Defender: juggled by the combo, then launched into the sky and left where it lands.
  const defClass = rushing ? 'def-combo' : after ? 'fin-launch' : '';
  const defKey = rushing ? 'r' : after ? 'l' : 'i';

  return (
    <div
      ref={ref}
      className={`fixed inset-0 z-20 overflow-hidden bg-black select-none ${phase === 'crash' ? 'shake-hard' : ''} ${ready ? 'cursor-pointer' : ''}`}
      onClick={() => phase === 'extra' && onDone()}
    >
      <div className={`absolute inset-0 transition-[filter] duration-700 ${phase === 'cry' || rushing ? 'brightness-[.45] saturate-[.6]' : ''}`}>
        <World biome={boss.biome} block={Math.round(Math.max(32, Math.min(64, h * 0.08)))} npc={false} />
      </div>
      {(rushing || phase === 'launch') && <div className="absolute -inset-[50%] speedlines pointer-events-none" />}

      {/* Fighters */}
      <div className="absolute z-[5]" style={{ left: heroX, bottom: L.ground, transition: 'left .18s steps(3)' }}>
        <div key={`h-${heroAtk ? 'a' : defKey}`} className={heroAtk ? '' : defClass} style={{ '--dir': -1, '--hits': 30 }}>
          <Mob name="hero" model={model} variant={fighter.style} height={L.heroH} pose={heroAtk ? atkPose : defPose} />
        </div>
      </div>
      <div className="absolute z-[5]" style={{ left: foeX, bottom: L.ground, transition: 'left .18s steps(3)', filter: `drop-shadow(0 0 12px ${boss.color})` }}>
        <div key={`b-${heroAtk ? defKey : 'a'}`} className={heroAtk ? defClass : ''} style={{ '--dir': 1, '--hits': 30 }}>
          <Mob name={boss.sprite} height={L.bossH} pose={heroAtk ? defPose : atkPose} />
        </div>
      </div>

      {/* Combo sparks: one burst per hit */}
      {rushing && hits > 0 && (
        <>
          <Particles key={`p${hits}`} className="z-[9]" style={{ left: def.x + ((hits * 23) % 50) - 25, bottom: L.ground + def.h * (0.3 + ((hits * 13) % 50) / 100) }} colors={['#fff', glow, color]} count={10} size={6} />
          <div key={`s${hits}`} className="absolute z-[9] h-[6px] fx-slashmark" style={{ left: def.x - def.w * 0.7, bottom: L.ground + def.h * (0.25 + ((hits * 17) % 60) / 100), width: def.w * 1.4, background: '#fff', boxShadow: `0 0 12px ${color}`, '--rot': `${(hits * 47) % 120 - 60}deg` }} />
        </>
      )}
      {phase === 'launch' && <div className="absolute inset-0 z-[40] bg-white white-flash pointer-events-none" />}
      {phase === 'crash' && <div className="absolute z-[6] h-10 fx-ring rounded-[50%]" style={{ left: def.x, bottom: L.ground - 18, width: def.w * 4, border: '6px solid #fff', boxShadow: `0 0 30px ${glow}` }} />}

      {/* Letterbox */}
      <div className="absolute top-0 inset-x-0 h-[9%] bg-black z-[30] letterbox origin-top" />
      <div className="absolute bottom-0 inset-x-0 h-[9%] bg-black z-[30] letterbox origin-bottom" />

      {phase === 'cry' && (
        <div className="absolute inset-0 z-[35] flex items-center justify-center pointer-events-none">
          <p className="cue-fight font-title text-6xl sm:text-8xl lg:text-9xl uppercase text-center leading-none" style={{ color: glow, textShadow: '6px 6px 0 #000', animationDuration: '1.1s' }}>{words.cry}</p>
        </div>
      )}

      {/* Ultimate name + hit counter */}
      {(rushing || phase === 'launch') && (
        <div className={`absolute z-[35] top-[12%] ${heroAtk ? 'left-3 sm:left-8' : 'right-3 sm:right-8 text-right'}`}>
          <div className={`callout ${heroAtk ? '' : 'callout-r'} px-3 sm:px-4 py-1.5 border-[3px] border-black inline-block`} style={{ background: color, boxShadow: '5px 5px 0 #000', animationDuration: '3.4s' }}>
            <p className="font-pixel text-[10px] sm:text-sm uppercase tracking-widest text-black/80 leading-none">⚡ Ultimate</p>
            <p className="font-title text-lg sm:text-3xl text-white uppercase leading-tight" style={{ textShadow: '2px 2px 0 #000' }}>{ultimate}</p>
          </div>
          {hits > 0 && (
            <p key={hits} className="combo-count font-title text-5xl sm:text-7xl text-mcyellow mt-2 leading-none" style={{ textShadow: '4px 4px 0 #000, 0 0 20px #f80' }}>
              {hits}<span className="text-xl sm:text-3xl"> hits</span>
            </p>
          )}
        </div>
      )}

      {/* The big word, held on screen */}
      {ready && (
        <div className="absolute inset-0 z-[36] flex flex-col items-center justify-center text-center px-4 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,.55), transparent 70%)' }}>
          <p className="bigword font-title uppercase leading-[0.9] text-6xl sm:text-8xl lg:text-[9rem]" style={{ color: victory ? '#fde047' : '#ff3b3b', '--glow': glow, textShadow: `6px 6px 0 ${victory ? '#7a3d00' : '#3f0000'}` }}>
            {words.big}
          </p>
          <p className="font-pixel text-lg sm:text-2xl lg:text-3xl text-white mt-4 max-w-3xl animate-rise mc-text-dark" style={{ animationDelay: '0.9s' }}>“{words.sub}”</p>
          {phase === 'extra' && (
            <div className="mt-6 flex flex-col items-center gap-3 animate-rise pointer-events-auto">
              <p className="font-title text-base sm:text-2xl text-mcaqua uppercase mc-text-dark">
                {victory ? `Rank: ${rank}` : `Score ${state.score}/100`} · {state.defeated}/5 bosses
              </p>
              <button className="mc-btn mc-btn-green text-lg sm:text-xl px-8" onClick={onDone} autoFocus>See results ▶</button>
            </div>
          )}
        </div>
      )}
      {ready && victory && <Confetti count={60} />}
      {ready && !victory && (
        <div className="absolute inset-0 z-[34] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(120,0,0,.55))' }} />
      )}
    </div>
  );
}
