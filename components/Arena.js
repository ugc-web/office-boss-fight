'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Mob from './Mob';
import World from './World';
import { Hearts, Particles, Typewriter } from './ui';
import { HERO } from '@/lib/bosses.mjs';
import { BOSS_HP, MAX_HP } from '@/lib/game.mjs';
import { STYLES } from '@/lib/fighters.mjs';
import { KINDS } from '@/lib/moves.mjs';
import { MOBS, heroModel } from '@/lib/mobs';
import { HeroFigure, BossFigure, spriteSet, spriteWidth, artFit, actionArt } from './Sprite';

const pick = (arr, seed) => arr[seed % arr.length];
const GROUND = 0.28; // the World's ground line, as a share of the stage height

/** Watches an element's size. */
export function useSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/** Fighter and boss sizes and positions for a stage of w x h px. */
export function useLayout(w, h, boss, fighter) {
  return useMemo(() => {
    const heroSet = fighter?.preset ? spriteSet(fighter.id) : null;
    const bossSet = spriteSet(boss.sprite);
    const ground = h * GROUND;
    let hero, foe, heroH, bossH;
    if (heroSet || bossSet) {
      // Realistic sprites stand taller than the block models
      heroH = Math.max(110, Math.min(480, h * 0.54));
      bossH = heroH * (boss.final ? 1.12 : 1.06);
    } else {
      heroH = Math.max(64, Math.min(200, h * 0.34));
      bossH = heroH * (boss.final ? 1.45 : 1.22);
    }
    if (heroSet) hero = { w: spriteWidth(heroSet, heroH), h: heroH };
    else {
      const hu = Math.max(1, Math.round(heroH / 32));
      hero = { w: 16 * hu, h: 32 * hu };
    }
    if (bossSet) {
      // wide bosses (Hydra, Drone, T-Rex) are capped to ~42% of the stage width
      const ratio = bossSet.ready.w / bossSet.ready.h;
      bossH = Math.min(bossH, (w * 0.42) / ratio);
      foe = { w: spriteWidth(bossSet, bossH), h: bossH };
    }
    else {
      const bm = MOBS[boss.sprite];
      const bu = Math.max(1, Math.round(bossH / bm.h));
      foe = { w: bm.w * bu, h: bm.h * bu };
    }
    hero.x = w * 0.07;
    foe.x = w - w * 0.07 - foe.w;
    return {
      w, h, heroH, bossH, ground, hero, foe,
      reachHero: Math.max(20, foe.x - hero.x - hero.w * 0.55),
      reachBoss: Math.max(20, foe.x - hero.x - hero.w * 0.5),
    };
  }, [w, h, boss, fighter]);
}

/** Square portrait from the character sheet (or an icon for custom fighters). */
export function Portrait({ src, icon, color, flip, size = 'w-9 h-9 sm:w-12 sm:h-12' }) {
  return (
    <div className={`${size} shrink-0 border-[3px] border-black overflow-hidden flex items-center justify-center`} style={{ background: `linear-gradient(180deg, ${color}55, #0b0a10)`, boxShadow: `0 0 0 2px ${color}, 0 0 12px ${color}88` }}>
      {src ? <img src={src} alt="" className="w-full h-full object-cover pixelated" style={{ transform: flip ? 'scaleX(-1)' : undefined }} /> : <span className="text-lg sm:text-2xl">{icon}</span>}
    </div>
  );
}

/** Full-width "super move" cut-in: the character's art from the sheet slams across the screen with the move name. */
export function CutIn({ art, fallback, name, label, color, side = 'left', ms = 1100 }) {
  return (
    <div className="absolute inset-0 z-[40] pointer-events-none overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-black/60 cutin-fade" style={{ animationDuration: `${ms}ms` }} />
      <div className="absolute -inset-[50%] speedlines opacity-60" />
      <div className={`absolute inset-x-0 top-[18%] h-[52%] cutin-band ${side === 'right' ? 'cutin-r' : ''}`} style={{ animationDuration: `${ms}ms`, background: `linear-gradient(90deg, ${color}, ${color}22 70%, transparent)`, borderTop: '4px solid #fff', borderBottom: '4px solid #fff' }}>
        <div className={`absolute inset-y-0 ${side === 'right' ? 'right-0' : 'left-0'} w-[62%] sm:w-[48%] overflow-hidden`}>
          {art ? <img src={art} alt="" className={`w-full h-full ${artFit(art)}`} style={{ transform: side === 'right' ? 'scaleX(-1)' : undefined }} /> : <div className="w-full h-full flex items-end justify-center">{fallback}</div>}
        </div>
        <div className={`absolute inset-y-0 flex flex-col justify-center px-3 sm:px-8 ${side === 'right' ? 'left-0 items-start' : 'right-0 items-end text-right'} w-[55%]`}>
          <p className="font-pixel text-xs sm:text-lg uppercase tracking-[0.25em] text-white/90" style={{ textShadow: '2px 2px 0 #000' }}>{label}</p>
          <p className="font-title text-2xl sm:text-5xl lg:text-6xl uppercase leading-[0.95] text-white" style={{ textShadow: `4px 4px 0 #000, 0 0 24px ${color}` }}>{name}</p>
        </div>
      </div>
    </div>
  );
}

/** Tekken-style health bar with a red damage trail and the name plate. */
export function FighterBar({ name, sub, value, max, fill, flip, portrait, children }) {
  const pct = `${Math.max(0, (value / max) * 100)}%`;
  return (
    <div className={`flex-1 min-w-0 flex items-start gap-1.5 sm:gap-2.5 ${flip ? 'flex-row-reverse text-right' : ''}`}>
      {portrait}
      <div className="flex-1 min-w-0">
      <div className={`fg-bar ${flip ? 'flip' : ''} ${value <= max * 0.3 && value > 0 ? 'low' : ''}`} role="meter" aria-label={`${name} health`} aria-valuenow={value} aria-valuemax={max}>
        <i className="trail" style={{ width: pct }} />
        <i className="fill" style={{ width: pct, background: fill }} />
      </div>
      <div className={`mt-1 flex items-center gap-2 ${flip ? 'flex-row-reverse' : ''}`}>
        <p className="font-title text-[11px] sm:text-sm lg:text-base text-white mc-text-dark uppercase truncate leading-none">{name}</p>
        {sub && <span className="hidden sm:inline font-pixel text-xs text-white/70 mc-text-dark truncate">{sub}</span>}
      </div>
      {children}
      </div>
    </div>
  );
}

/** Ultimate meter: fills with right answers, glows when ready. */
export function UltMeter({ value, color }) {
  const ready = value >= 100;
  return (
    <div className="mt-1 flex items-center gap-1.5" aria-label={`Ultimate meter ${value}%`}>
      <span className={`font-title text-[9px] sm:text-[11px] leading-none ${ready ? 'text-mcyellow animate-tick' : 'text-white/70'}`}>{ready ? 'ULT READY' : 'ULT'}</span>
      <div className="flex gap-[2px] flex-1 max-w-[9rem]">
        {[0, 1, 2].map((i) => (
          <i key={i} className="block h-2 sm:h-2.5 flex-1 border border-black" style={{ background: value >= (i + 1) * 33 ? (ready ? '#fde047' : color) : '#1a1a2a', boxShadow: ready ? '0 0 8px #fde047' : undefined }} />
        ))}
      </div>
    </div>
  );
}

/** What a projectile looks like: hero styles have their own, bosses throw their emoji / text. */
function Projectile({ fx, color, flip }) {
  if (fx === 'arrow') {
    return (
      <div className="flex items-center" style={{ transform: flip ? 'scaleX(-1)' : undefined, filter: `drop-shadow(0 0 6px ${color})` }}>
        <div className="w-2.5 h-2.5 bg-white" style={{ clipPath: 'polygon(0 0,100% 50%,0 100%)', transform: 'scaleX(-1)' }} />
        <div className="h-[4px] w-12 sm:w-16 bg-[#8b5e34]" />
        <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[11px] border-l-[#e2e8f0]" />
      </div>
    );
  }
  if (fx === 'slash') {
    return <div className="w-8 h-14 sm:w-10 sm:h-16 rounded-[50%]" style={{ borderRight: '7px solid #fff', transform: flip ? 'scaleX(-1)' : undefined, filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 3px #fff)` }} />;
  }
  if (fx === 'fist' || fx === 'orb') {
    const core = fx === 'fist' ? '#facc15' : color;
    return <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" style={{ background: `radial-gradient(circle, #fff 0 25%, ${core} 45%, transparent 72%)`, boxShadow: `0 0 22px ${core}` }} />;
  }
  return (
    <span className="block font-pixel text-2xl sm:text-4xl leading-none text-mcred whitespace-nowrap" style={{ textShadow: `2px 2px 0 #000, 0 0 12px ${color}` }}>
      {fx}
    </span>
  );
}

/** All the moving parts of one attack: projectiles, beams, sparks, slash marks, shockwaves. */
function AttackFx({ fx, L, color, heroFx }) {
  const { move, attacker } = fx;
  const k = KINDS[move.kind];
  const hero = attacker === 'hero';
  const look = hero ? heroFx : move.fx;
  const n = Math.min(move.hits, 8);
  const ult = move.kind === 'ultimate';
  const is = (kind) => move.kind === kind || (ult && (kind === 'beam' || kind === 'rain' || kind === 'slam'));
  const from = hero ? L.hero.x + L.hero.w * 0.9 : L.foe.x + L.foe.w * 0.1;
  const to = hero ? L.foe.x + L.foe.w * 0.4 : L.hero.x + L.hero.w * 0.6;
  const def = hero ? { x: L.foe.x + L.foe.w / 2, w: L.foe.w, h: L.foe.h } : { x: L.hero.x + L.hero.w / 2, w: L.hero.w, h: L.hero.h };
  const midY = L.ground + (hero ? L.hero.h : L.foe.h) * 0.5;
  const els = [];

  if (move.kind === 'shot') {
    for (let i = 0; i < n; i++) {
      const delay = Math.max(40, k.impact - 420 - (n - 1 - i) * 110);
      els.push(
        <div key={`p${i}`} className="absolute z-[7] proj-fly opacity-0" style={{ bottom: midY + (i % 3) * 14 - 14, '--from': `${from}px`, '--to': `${to}px`, '--t': '.42s', animationDelay: `${delay}ms` }}>
          <Projectile fx={look} color={color} flip={!hero} />
        </div>
      );
    }
  }
  if (is('rain')) {
    for (let i = 0; i < Math.max(n, 5); i++) {
      const x = def.x + ((i * 37) % 100 - 50) / 100 * def.w * 1.4;
      els.push(
        <div key={`r${i}`} className="absolute top-0 z-[7] proj-fall opacity-0" style={{ left: x, '--land': `calc(${L.h - L.ground - def.h * 0.4}px)`, '--rot': hero && look === 'arrow' ? '90deg' : `${(i * 47) % 60 - 30}deg`, animationDelay: `${k.impact - 500 + (i - 2) * 70}ms` }}>
          <Projectile fx={look} color={color} />
        </div>
      );
    }
  }
  if (move.kind === 'summon') {
    for (let i = 0; i < Math.max(n, 4); i++) {
      const x = def.x + ((i * 53) % 100 - 50) / 100 * def.w * 1.2;
      els.push(
        <div key={`s${i}`} className="absolute z-[7] proj-erupt opacity-0" style={{ left: x, bottom: L.ground, animationDelay: `${k.impact - 200 + i * 90}ms` }}>
          <Projectile fx={look} color={color} />
        </div>
      );
    }
    els.push(<div key="crack" className="absolute z-[6] h-6 fx-ring opacity-0 rounded-[50%]" style={{ left: def.x, bottom: L.ground - 12, width: def.w * 2, border: `4px solid ${color}`, animationDelay: `${k.impact - 250}ms` }} />);
  }
  if (is('beam')) {
    const left = Math.min(from, to);
    els.push(
      <div key="beam" className="absolute z-[7] fx-beam opacity-0" style={{ left, width: Math.abs(to - from), bottom: midY - 10, height: 22, transformOrigin: hero ? 'left center' : 'right center', animationDelay: `${k.impact - 220}ms`, background: `linear-gradient(180deg, transparent, ${color} 25%, #fff 45% 55%, ${color} 75%, transparent)`, boxShadow: `0 0 24px ${color}, 0 0 48px ${color}` }} />
    );
  }
  if (is('slam')) {
    els.push(<div key="ring" className="absolute z-[6] h-8 fx-ring opacity-0 rounded-[50%]" style={{ left: def.x, bottom: L.ground - 14, width: def.w * 3, border: '5px solid #fff', boxShadow: `0 0 20px ${color}`, animationDelay: `${k.impact}ms` }} />);
  }
  // Slash marks for blades and close-range hits
  if ((hero && heroFx === 'slash') || ['dash', 'spin', 'teleport', 'uppercut', 'ultimate'].includes(move.kind)) {
    for (let i = 0; i < Math.min(n, 5); i++) {
      els.push(
        <div key={`m${i}`} className="absolute z-[8] h-[5px] fx-slashmark opacity-0" style={{ left: def.x - def.w * 0.6, bottom: L.ground + def.h * (0.3 + ((i * 29) % 50) / 100), width: def.w * 1.2, background: '#fff', boxShadow: `0 0 10px ${color}`, '--rot': `${i % 2 ? 35 : -35}deg`, animationDelay: `${k.impact + i * 90}ms` }} />
      );
    }
  }
  // Impact sparks, one burst per hit
  for (let i = 0; i < Math.min(n, 6); i++) {
    els.push(
      <Particles key={`h${i}`} className="z-[9]" style={{ left: def.x + ((i * 31) % 40) - 20, bottom: L.ground + def.h * 0.55 + ((i * 17) % 30) - 15 }} colors={hero ? ['#fff', '#facc15', color] : ['#fff', '#ef4444', color]} count={i === 0 ? 14 : 8} size={i === 0 ? 7 : 5} delay={(k.impact + i * 90) / 1000} />
    );
  }
  return <>{els}</>;
}

/**
 * The stage: hero (left) vs boss (right) in the boss's biome, with the HUD on top.
 * `fx` is the current attack (see Game.js), `speaker` highlights who is talking in the intro.
 */
export default function Arena({ boss, fighter, state, fx, hold, speaker, walkIn, center, controls, children }) {
  const { last, phase, round, streak } = state;
  const answered = phase === 'feedback' && !!fx;
  const ref = useRef(null);
  const { w, h } = useSize(ref);
  const L = useLayout(w, h, boss, fighter);
  const model = useMemo(() => heroModel(fighter), [fighter]);
  const style = STYLES[fighter.style];
  const heroColor = style.color;

  // Attack timeline: 0 = wind-up, 1 = impact, 2 = settled.
  const [t, setT] = useState(0);
  const [hitN, setHitN] = useState(0);
  useEffect(() => {
    setT(0);
    setHitN(0);
    if (!answered) return;
    const k = KINDS[fx.move.kind];
    const ids = [setTimeout(() => setT(1), k.impact), setTimeout(() => setT(2), k.impact + 950)];
    for (let i = 1; i <= Math.min(fx.move.hits, 99); i++) ids.push(setTimeout(() => setHitN(i), k.impact + (i - 1) * (fx.move.ultimate ? 60 : 90)));
    return () => ids.forEach(clearTimeout);
  }, [answered, fx]);

  // Bars show the numbers from before the answer until the hit lands (and while the attack cards are up).
  const before = answered && t < 1 ? fx.prev : phase === 'feedback' && !fx ? hold : null;
  const hp = before ? before.hp : state.hp;
  const bossHp = before ? before.bossHp : state.bossHp;
  const meter = (before ? before.meter : state.meter) || 0;
  const heroAtk = answered && fx.attacker === 'hero';
  const bossAtk = answered && fx.attacker === 'boss';
  const kind = answered ? fx.move.kind : null;
  const cast = kind === 'rain' || kind === 'summon';
  const ko = heroAtk && last.ko;
  const fatal = bossAtk && hp <= 0;

  let heroPose = walkIn ? 'walk' : 'idle';
  let bossPose = walkIn ? 'walk' : 'idle';
  if (heroAtk) {
    heroPose = t === 0 ? (cast ? 'cast' : 'attack') : t === 1 ? 'attack' : ko ? 'cheer' : 'idle';
    bossPose = t === 0 ? 'idle' : ko ? 'ko' : t === 1 ? 'hurt' : 'idle';
  } else if (bossAtk) {
    bossPose = t === 0 ? (cast ? 'cast' : 'attack') : t === 1 ? 'attack' : fatal ? 'cheer' : 'idle';
    heroPose = t === 0 ? 'idle' : fatal ? 'ko' : t === 1 ? 'hurt' : 'idle';
  }

  const reaction = (k, hits) => (k === 'uppercut' || k === 'ultimate' ? 'def-launch' : k === 'slam' ? 'def-crush' : hits > 2 ? 'def-combo' : 'def-hurt');
  const blocked = bossAtk && last.blocked;
  const heroWrap = heroAtk && t < 2 ? `atk-${kind === 'ultimate' ? 'ult' : kind}` : bossAtk && t >= 1 ? (blocked ? 'def-hurt' : reaction(kind, fx.move.hits)) : '';
  const bossWrap = bossAtk && t < 2 ? `atk-${kind}` : heroAtk && t >= 1 ? reaction(kind, fx.move.hits) : '';

  // Speech bubbles
  const q = state.rounds[round].q;
  let bossLine = phase === 'playing' ? pick(boss.taunts, round) : null;
  let heroLine = null;
  if (answered && t >= 2) { // after the announcer has had its moment
    if (heroAtk) {
      bossLine = last.ko ? boss.defeat : pick(boss.hurt, round);
      heroLine = pick(HERO.hitLines, round + fighter.name.length);
    } else {
      bossLine = last.timeout ? 'Too slow! The clock is MY friend.' : q.options.find((o) => o.id === last.optionId)?.roast;
      heroLine = pick(HERO.hurtLines, round);
    }
  }
  const bubbleBottom = (charH) => Math.min(L.ground + charH + 10, h - 150);
  const tierLabel = answered ? (fx.move.ultimate ? '⚡ Ultimate' : fx.move.tier === 3 ? 'Special move' : fx.move.hits > 1 ? `${fx.move.hits}-hit combo` : 'Heavy hit') : '';
  const shake = answered && t === 1 && (kind === 'slam' || fx.move.tier === 3 || ko) ? 'shake-hard' : answered && t === 1 ? 'animate-shake' : '';

  return (
    <div ref={ref} className={`relative h-full w-full overflow-hidden crt-vignette ${shake}`}>
      <div className={`absolute inset-0 ${ko && t >= 1 ? 'zoom-punch' : ''}`}>
        <World biome={boss.biome} block={Math.round(Math.max(28, Math.min(56, h * 0.09)))} npc={!answered} />
      </div>

      {/* HUD */}
      <div className="absolute top-0 inset-x-0 z-30 px-2 sm:px-5 pt-2 sm:pt-3 flex items-start gap-2 sm:gap-5" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.55), transparent)' }}>
        <FighterBar name={fighter.name} sub={`${style.icon} ${style.label}`} value={hp} max={MAX_HP} fill="linear-gradient(180deg,#fef08a,#facc15 45%,#f59e0b)" portrait={<Portrait src={fighter.portrait} icon={style.icon} color={style.color} />}>
          <div className="mt-1 hidden sm:block"><Hearts hp={hp} size={12} /></div>
          <UltMeter value={meter} color={style.color} />
        </FighterBar>
        <div className="shrink-0 flex flex-col items-center -mt-0.5">
          {center}
          {controls && <div className="mt-1 scale-75 sm:scale-90 origin-top">{controls}</div>}
        </div>
        <FighterBar flip name={boss.name} sub={boss.title} value={bossHp} max={BOSS_HP} fill={`linear-gradient(180deg,#fff8, ${boss.color} 40%)`} portrait={<Portrait src={boss.portrait} color={boss.color} />}>
          {streak >= 2 && <p className="mt-1 font-pixel text-xs sm:text-sm text-mcgold mc-text-dark animate-tick">🔥 {streak} streak</p>}
        </FighterBar>
      </div>

      {/* Hero */}
      <div className={`absolute z-[5] ${walkIn ? 'animate-walkInL' : ''}`} style={{ left: L.hero.x, bottom: L.ground }}>
        <div key={`h${fx?.key}`} className={`${heroWrap} ${speaker === 'hero' ? 'talking' : ''}`} style={{ '--dir': heroAtk ? 1 : -1, '--reach': `${L.reachHero}px`, '--glow': heroColor, '--hits': Math.ceil((fx?.move.hits || 2) / 1.2) }}>
          <HeroFigure fighter={fighter} model={model} height={L.heroH} pose={heroPose} title={`${fighter.name}, ${style.label}`} />
        </div>
      </div>
      {/* Boss */}
      <div className={`absolute z-[5] ${walkIn ? 'animate-walkInR' : ''}`} style={{ left: L.foe.x, bottom: L.ground, filter: `drop-shadow(0 0 10px ${boss.color}88)` }}>
        <div key={`b${fx?.key}`} className={`${bossWrap} ${speaker === 'boss' ? 'talking' : ''}`} style={{ '--dir': bossAtk ? -1 : 1, '--reach': `${L.reachBoss}px`, '--glow': boss.color, '--hits': Math.ceil((fx?.move.hits || 2) / 1.2) }}>
          <BossFigure boss={boss} height={L.bossH} pose={bossPose} />
        </div>
      </div>

      {answered && w > 0 && <AttackFx key={fx.key} fx={fx} L={L} color={heroAtk ? (fx.move.ultimate ? style.color : heroColor) : boss.color} heroFx={style.fx} />}
      {answered && fx.move.ultimate && t === 0 && (
        <CutIn art={actionArt(fighter.art)} fallback={<Mob name="hero" model={model} variant={fighter.style} height={Math.min(220, h * 0.5)} pose="attack" />} name={fx.move.name} label="⚡ Ultimate" color={style.color} />
      )}
      {blocked && t >= 1 && (
        <>
          <div className="absolute z-[9] rounded-full block-shield pointer-events-none" style={{ left: L.hero.x + L.hero.w * 0.6, bottom: L.ground + L.hero.h * 0.1, width: L.hero.h * 0.5, height: L.hero.h * 0.85, border: `5px solid ${style.color}`, boxShadow: `0 0 24px ${style.color}, inset 0 0 18px ${style.color}` }} />
          <span className="absolute z-[26] font-title text-2xl sm:text-4xl text-white animate-vs" style={{ left: L.hero.x, bottom: L.ground + L.hero.h + 12, textShadow: `3px 3px 0 #000, 0 0 16px ${style.color}` }}>BLOCKED!</span>
        </>
      )}

      {/* Move name, sliding in from the attacker's side */}
      {answered && (
        <div key={`c${fx.key}`} className={`absolute z-[25] top-[64px] sm:top-[84px] ${heroAtk ? 'left-2 sm:left-5 callout' : 'right-2 sm:right-5 callout callout-r'}`}>
          <div className="px-3 py-1 border-[3px] border-black" style={{ background: heroAtk ? heroColor : boss.color, boxShadow: '4px 4px 0 #000' }}>
            <p className="font-pixel text-[10px] sm:text-xs uppercase tracking-widest text-black/80 leading-none">{tierLabel}</p>
            <p className="font-title text-sm sm:text-xl text-white uppercase leading-tight" style={{ textShadow: '2px 2px 0 #000' }}>{fx.move.name}</p>
          </div>
          {fx.move.hits > 1 && hitN > 0 && (
            <p key={hitN} className={`combo-count font-title text-2xl sm:text-4xl text-mcyellow mt-1 ${heroAtk ? '' : 'text-right'}`} style={{ textShadow: '3px 3px 0 #000' }}>
              {hitN} <span className="text-sm sm:text-lg">hits</span>
            </p>
          )}
        </div>
      )}

      {/* Announcer */}
      {answered && t >= 1 && fx.comment && (
        <div className="absolute inset-x-0 top-[38%] z-[26] flex justify-center pointer-events-none px-4">
          <p key={`a${fx.key}`} className="announce-pop font-title text-2xl sm:text-4xl lg:text-5xl text-center uppercase leading-none" style={{ color: heroAtk ? '#fde047' : '#ff5555', textShadow: '3px 3px 0 #000, 0 0 20px rgba(0,0,0,.6)', animationDelay: '0.15s' }}>
            {fx.comment}
          </p>
        </div>
      )}

      {bossLine && h > 0 && (
        <div className="absolute z-20 right-2 sm:right-[6%] max-w-[55%] sm:max-w-[38%]" style={{ bottom: bubbleBottom(L.foe.h) }}>
          <div key={`${round}-${phase}-${t >= 1}`} className="mc-bubble tail-r animate-pop text-sm sm:text-lg">
            <Typewriter text={bossLine} speed={20} />
          </div>
        </div>
      )}
      {heroLine && h > 0 && (
        <div className="absolute z-20 left-2 sm:left-[6%] max-w-[40%] sm:max-w-[30%]" style={{ bottom: bubbleBottom(L.hero.h) }}>
          <div className="mc-bubble tail-l animate-pop text-sm sm:text-lg" style={{ animationDelay: '0.5s' }}>{heroLine}</div>
        </div>
      )}

      {answered && t === 1 && (heroAtk ? fx.move.tier === 3 : true) && (
        <div className={`absolute inset-0 z-[8] pointer-events-none opacity-0 animate-flash ${heroAtk ? 'bg-white' : 'bg-red-600'}`} />
      )}
      {answered && last.ko && t >= 1 && (
        <div className="absolute inset-x-0 bottom-[12%] z-20 flex justify-center pointer-events-none">
          <span className="font-title text-5xl sm:text-7xl text-mcyellow animate-vs" style={{ animationDelay: '0.4s', textShadow: '4px 4px 0 #7a1d00, 0 0 30px #ff0' }}>K.O.!</span>
        </div>
      )}
      {answered && last.escaped && t >= 1 && (
        <div className="absolute inset-x-0 bottom-[12%] z-20 flex justify-center pointer-events-none">
          <span className="font-pixel text-base sm:text-xl text-mcred mc-dark px-3 py-1.5 animate-vs" style={{ animationDelay: '0.6s' }}>BOSS ESCAPED!</span>
        </div>
      )}

      {children}
    </div>
  );
}
