// Fight choreography: who attacks after an answer, which move they use, what the announcer says,
// the pre-fight banter for each stage and the words for the finishing move.
// Framework-free so it can be unit-tested with `node --test`.
import { MAX_HP } from './game.mjs';

// Timing for each kind of move (ms). `impact` = when the hit lands; `ms` = whole animation.
export const KINDS = {
  shot: { impact: 520, ms: 1100 },
  dash: { impact: 480, ms: 1100 },
  uppercut: { impact: 500, ms: 1200 },
  slam: { impact: 800, ms: 1250 },
  rain: { impact: 850, ms: 1500 },
  beam: { impact: 620, ms: 1300 },
  summon: { impact: 700, ms: 1400 },
  spin: { impact: 560, ms: 1250 },
  teleport: { impact: 540, ms: 1200 },
};

/**
 * Who attacks and how hard, from the state before (`prev`) and after (`s`) an answer.
 * The winner of the question attacks. `tiers` are the move tiers that fit the moment.
 */
export function attackContext(prev, s) {
  const last = s.last;
  if (last.correct) {
    if (last.ko) return { attacker: 'hero', ctx: 'ko', tiers: [3, 2] };
    if (prev.hp <= MAX_HP * 0.4) return { attacker: 'hero', ctx: 'comeback', tiers: [3, 2] };
    if (s.streak >= 2) return { attacker: 'hero', ctx: 'combo', tiers: [2, 3] };
    return { attacker: 'hero', ctx: 'hit', tiers: [1, 2] };
  }
  if (s.hp <= 0) return { attacker: 'boss', ctx: 'fatal', tiers: [3] };
  if (last.timeout) return { attacker: 'boss', ctx: 'timeout', tiers: [1, 2] };
  if (prev.streak >= 2) return { attacker: 'boss', ctx: 'breaker', tiers: [2, 3] };
  if (s.hp <= MAX_HP * 0.4) return { attacker: 'boss', ctx: 'brutal', tiers: [3, 2] };
  if (last.escaped) return { attacker: 'boss', ctx: 'escape', tiers: [2, 1] };
  return { attacker: 'boss', ctx: 'hit', tiers: [1, 2] };
}

/**
 * Pick a move for the moment. Never the attacker's recent moves or the same kind as the previous
 * attack (from either side). Among the rest, moves of the wanted tiers are more likely, and moves
 * used less this game are more likely, so a run shows off the whole move list instead of a loop.
 */
export function chooseMove(pool, tiers, { recent = [], lastKind = null, uses = {} } = {}, rand = Math.random) {
  let c = pool.filter((m) => !recent.includes(m.name) && m.kind !== lastKind);
  if (!c.length) c = pool.filter((m) => m.kind !== lastKind && m.name !== recent[recent.length - 1]);
  if (!c.length) c = pool;
  const weight = (m) => (m.tier === tiers[0] ? 6 : tiers.includes(m.tier) ? 3 : 1) / (1 + 2 * (uses[m.name] || 0));
  const total = c.reduce((sum, m) => sum + weight(m), 0);
  let r = rand() * total;
  for (const m of c) {
    r -= weight(m);
    if (r <= 0) return m;
  }
  return c[c.length - 1];
}

/** Keeps the move history for one game so attacks never repeat back to back. */
export function createMoveHistory() {
  const recent = { hero: [], boss: [] };
  const uses = {};
  let lastKind = null;
  return {
    pick(attacker, pool, tiers, rand = Math.random) {
      const m = chooseMove(pool, tiers, { recent: recent[attacker], lastKind, uses }, rand);
      recent[attacker] = [...recent[attacker], m.name].slice(-3);
      uses[m.name] = (uses[m.name] || 0) + 1;
      lastKind = m.kind;
      return m;
    },
  };
}

// ---------- Announcer ----------
export const COMMENTARY = {
  hit: ['Clean hit!', 'Right on target!', 'Smart move!', 'That’s how you use AI!', 'Textbook!', 'Great call!'],
  combo: ['{hero} is on fire!', '{n} in a row! Unstoppable!', 'The combo keeps going!', 'Somebody stop {hero}!'],
  comeback: ['What a comeback!', 'Never count {hero} out!', 'Back from the brink!', 'The fight isn’t over!'],
  ko: ['{boss} is DOWN!', 'K.O.! What a finish!', 'Down goes {boss}!', 'Lights out for {boss}!'],
  bossHit: ['Ouch! That one stung!', '{boss} lands a heavy one!', 'A trap, and {hero} walked right in!', 'Big damage!'],
  breaker: ['COMBO BREAKER!', 'The streak is over!', '{boss} shuts it down!'],
  brutal: ['{hero} is on the ropes!', 'One more hit could end it!', 'This is looking grim!', 'Hang in there, {hero}!'],
  timeout: ['Too slow!', 'The clock strikes!', 'Time waits for nobody!'],
  escape: ['{boss} lands a hit and gets away!', 'It slips into the shadows!'],
  fatal: ['{hero} is down!', 'It’s all over!'],
};

export const fill = (text, vars) => text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));

export function commentFor(attacker, ctx, vars, rand = Math.random) {
  const pool = COMMENTARY[attacker === 'boss' && ctx === 'hit' ? 'bossHit' : ctx] || COMMENTARY.hit;
  return fill(pool[Math.floor(rand() * pool.length)], vars);
}

// ---------- Pre-fight ----------
/**
 * Lines played before each stage: announcer, then the boss and the hero trade words.
 * The announcer reacts to how the run is going (first stage, final stage, low health, unbeaten).
 */
export function introScript({ boss, index, total, hp, defeated, heroName }, rand = Math.random) {
  const vars = { hero: heroName, boss: boss.name };
  let hype;
  if (index === 0) hype = 'Welcome to the office! First up: {boss}!';
  else if (boss.final) hype = 'The final boss. Everything comes down to this!';
  else if (hp <= MAX_HP * 0.4) hype = '{hero} is hurt… can they survive {boss}?';
  else if (defeated === index) hype = '{hero} is unbeaten so far! Can {boss} stop them?';
  else if (defeated < index) hype = 'Some bosses got away… {hero} needs a win against {boss}!';
  else hype = '{boss} enters the arena!';
  const banter = boss.banter[Math.floor(rand() * boss.banter.length)];
  return [
    { who: 'announcer', text: fill(hype, vars) },
    { who: 'boss', text: fill(banter.boss, vars) },
    { who: 'hero', text: fill(banter.hero, vars) },
  ];
}

// ---------- Finishing move ----------
export function finaleWords({ victory, hp, score, boss, heroName }) {
  if (!victory) return { big: `${boss.name} wins`, sub: boss.winQuote, cry: 'No mercy!' };
  if (hp === MAX_HP && score === 100) return { big: 'Flawless victory', sub: `Not a single scratch. ${heroName} is untouchable.`, cry: 'Finish it!' };
  if (score >= 71) return { big: 'Unbeatable!', sub: `The office has a new legend: ${heroName}.`, cry: 'Finish it!' };
  if (score >= 41) return { big: 'Victory!', sub: `${heroName} survived the workday. 5 PM, here we come.`, cry: 'Finish it!' };
  return { big: 'Survivor!', sub: `Battered and bruised, but ${heroName} is still standing.`, cry: 'Finish it!' };
}
