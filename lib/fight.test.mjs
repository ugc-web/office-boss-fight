import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRounds, initialState, startRound, answer, next, unleash, doubleCheck, modelSwap, perkReady, roundSeconds, secondsFor, MAX_HP, WRONG_DAMAGE, BLOCK_DAMAGE, CHAI_HEAL, ULT_HEAL, PERKS } from './game.mjs';
import { BOSSES } from './bosses.mjs';
const SPICY_OF = (q) => ['aitool', 'crazy'].includes(q.type);
import { STYLES, PRESETS, sanitizeFighter, randomLook, NAME_MAX, SKINS } from './fighters.mjs';
import { KINDS, attackContext, chooseMove, createMoveHistory, commentFor, introScript, finaleWords } from './moves.mjs';

const right = { id: 'x', correct: true };
const wrong = { id: 'y' };

test('content: every style and boss has varied moves with known kinds, all 3 tiers, and banter', () => {
  const sets = [...Object.values(STYLES).map((s) => s.moves), ...BOSSES.map((b) => b.moves)];
  for (const moves of sets) {
    assert.ok(moves.length >= 6);
    for (const m of moves) {
      assert.ok(KINDS[m.kind], `unknown kind ${m.kind}`);
      assert.ok(m.hits >= 1 && m.name);
    }
    assert.deepEqual([...new Set(moves.map((m) => m.tier))].sort(), [1, 2, 3]);
    assert.ok(new Set(moves.map((m) => m.kind)).size >= 5, 'at least 5 different kinds of attack');
  }
  for (const b of BOSSES) {
    assert.ok(b.banter.length >= 3 && b.banter.every((x) => x.boss && x.hero), `${b.id} banter`);
    assert.ok(b.winQuote, `${b.id} winQuote`);
    assert.ok(b.moves.every((m) => m.fx), `${b.id} moves need an fx`);
  }
  for (const s of Object.values(STYLES)) assert.ok(s.ultimate && s.fx && s.label);
});

test('the winner of a question attacks, and the moment picks the kind of move', () => {
  let s = startRound(initialState(buildRounds(BOSSES)));
  const hit = answer(s, right);
  assert.deepEqual(attackContext(s, hit), { attacker: 'hero', ctx: 'hit', tiers: [1, 2] });
  const ko = answer(startRound(next(hit)), right);
  assert.equal(attackContext(startRound(next(hit)), ko).ctx, 'ko');
  const miss = answer(s, wrong);
  assert.equal(attackContext(s, miss).attacker, 'boss');
  assert.equal(attackContext(s, answer(s, { id: '__timeout__' })).ctx, 'timeout');
  // breaking a streak
  const onStreak = { ...s, streak: 3 };
  assert.equal(attackContext(onStreak, answer(onStreak, wrong)).ctx, 'breaker');
  // low health: boss goes brutal, the hero's hits become comebacks
  const low = { ...s, hp: 40 };
  assert.equal(attackContext(low, answer(low, wrong)).ctx, 'brutal');
  assert.equal(attackContext(low, answer(low, right)).ctx, 'comeback');
  const dying = { ...s, hp: 20 };
  assert.equal(attackContext(dying, answer(dying, wrong)).ctx, 'fatal');
});

test('moves never repeat back to back: never the same move twice for an attacker, never the same kind twice in a row', () => {
  for (let run = 0; run < 300; run++) {
    const h = createMoveHistory();
    const prev = { hero: null, boss: null };
    let lastKind = null;
    for (let i = 0; i < 10; i++) {
      const who = Math.random() < 0.6 ? 'hero' : 'boss';
      const pool = who === 'hero' ? STYLES[Object.keys(STYLES)[run % 4]].moves : BOSSES[i >> 1].moves;
      const m = h.pick(who, pool, [[1, 2], [2, 3], [3, 2], [3]][i % 4]);
      assert.notEqual(m.kind, lastKind, 'same kind of attack twice in a row');
      assert.notEqual(m.name, prev[who], 'same move twice in a row');
      lastKind = m.kind;
      prev[who] = m.name;
    }
  }
});

test('chooseMove prefers the requested tiers, and a perfect run shows off most of the move list', () => {
  const pool = STYLES.archer.moves;
  let special = 0;
  for (let i = 0; i < 1000; i++) if (chooseMove(pool, [3]).tier === 3) special++;
  assert.ok(special > 600, `specials only picked ${special}/1000 times`);
  const m = chooseMove(pool, [3], { recent: pool.filter((x) => x.tier === 3).map((x) => x.name) });
  assert.notEqual(m.tier, 3, 'falls back when every special was just used');
  // 10 correct answers in a row (combo / KO tiers): on average at least 5 of the 6 moves appear.
  let seen = 0;
  for (let run = 0; run < 200; run++) {
    const h = createMoveHistory();
    const names = new Set();
    for (let i = 0; i < 10; i++) names.add(h.pick('hero', pool, i % 2 ? [3, 2] : [2, 3]).name);
    seen += names.size;
  }
  assert.ok(seen / 200 >= 5, `only ${seen / 200} different moves per perfect run`);
});

test('commentary and pre-fight script fill in names and react to the run', () => {
  const vars = { hero: 'Asha', boss: 'Inbox Hydra', n: 3 };
  for (const ctx of ['hit', 'combo', 'comeback', 'ko']) assert.doesNotMatch(commentFor('hero', ctx, vars), /\{|\}/);
  for (const ctx of ['hit', 'breaker', 'brutal', 'timeout', 'escape', 'fatal']) assert.doesNotMatch(commentFor('boss', ctx, vars), /\{|\}/);
  const first = introScript({ boss: BOSSES[0], index: 0, total: 5, hp: MAX_HP, defeated: 0, heroName: 'Asha' });
  assert.deepEqual(first.map((l) => l.who), ['announcer', 'boss', 'hero']);
  assert.match(first[0].text, /Inbox Hydra/);
  assert.match(introScript({ boss: BOSSES[4], index: 4, total: 5, hp: MAX_HP, defeated: 4, heroName: 'Asha' })[0].text, /final boss/i);
  assert.match(introScript({ boss: BOSSES[2], index: 2, total: 5, hp: 20, defeated: 2, heroName: 'Asha' })[0].text, /Asha is hurt/);
});

test('finishing move words: flawless, unbeatable, or the boss wins', () => {
  const base = { boss: BOSSES[4], heroName: 'Asha' };
  assert.equal(finaleWords({ ...base, victory: true, hp: 100, score: 100 }).big, 'Flawless victory');
  assert.equal(finaleWords({ ...base, victory: true, hp: 60, score: 80 }).big, 'Unbeatable!');
  assert.equal(finaleWords({ ...base, victory: true, hp: 20, score: 50 }).big, 'Victory!');
  const lose = finaleWords({ ...base, victory: false, hp: 0, score: 30 });
  assert.match(lose.big, /CEO Final Form wins/i);
  assert.equal(lose.sub, BOSSES[4].winQuote);
});

test('fighters: presets are valid, bad saved data is cleaned up', () => {
  for (const { art, portrait, ...p } of PRESETS) {
    assert.deepEqual({ ...sanitizeFighter(p), preset: true }, p);
    assert.ok(art && portrait, `${p.id} needs art from the character sheet`);
  }
  const f = sanitizeFighter({ name: '   A   very long fighter name indeed ', style: 'hacker', skin: 'red' });
  assert.ok(f.name.length <= NAME_MAX);
  assert.equal(f.style, 'archer');
  assert.ok(SKINS.includes(f.skin));
  assert.equal(sanitizeFighter({ name: '' }, 'Fighter 2').name, 'Fighter 2');
  for (let i = 0; i < 50; i++) {
    const look = { id: 'z', name: 'R', ...randomLook() };
    assert.deepEqual(sanitizeFighter(look), look, 'random looks are always valid');
  }
});

test('block: a timed block halves the damage, but not when time ran out', () => {
  const s = startRound(initialState(buildRounds(BOSSES)));
  assert.equal(answer(s, wrong, { blocked: true }).hp, MAX_HP - BLOCK_DAMAGE);
  assert.equal(answer(s, wrong, { blocked: true }).last.blocked, true);
  assert.equal(answer(s, wrong).hp, MAX_HP - WRONG_DAMAGE);
  assert.equal(answer(s, { id: '__timeout__' }, { blocked: true }).hp, MAX_HP - WRONG_DAMAGE);
});

test('ultimate: 3 right answers fill the meter; unleashing heals and empties it', () => {
  let s = { ...startRound(initialState(buildRounds(BOSSES))), hp: 50 };
  s = next(answer(s, right));
  s = next(answer(startRound(s), right));
  assert.ok(s.meter < 100);
  assert.equal(unleash(answer(startRound(s), wrong)).meter, s.meter, 'wrong answers do not fill or use it');
  s = answer(startRound(s), right);
  assert.equal(s.meter, 100);
  const u = unleash(s);
  assert.equal(u.meter, 0);
  assert.equal(u.hp, Math.min(MAX_HP, s.hp + ULT_HEAL));
  assert.equal(u.last.ultimate, true);
  assert.equal(unleash(u), u, 'cannot unleash twice');
});

test('perks: every style has one, and each works as described', () => {
  for (const k of Object.keys(STYLES)) assert.equal(STYLES[k].perk.id, PERKS[k]);
  // Double-Check: removes one wrong answer, once per stage
  let a = startRound(initialState(buildRounds(BOSSES), 'archer'));
  assert.ok(perkReady(a));
  a = doubleCheck(a);
  assert.equal(a.removed.length, 1);
  assert.ok(!a.rounds[0].q.options.find((o) => o.id === a.removed[0]).correct);
  assert.equal(doubleCheck(a), a, 'only once per stage');
  a = startRound(next(answer(a, right)));
  assert.equal(a.removed.length, 0);
  assert.ok(!perkReady(a), 'same stage: still used');
  a = startRound(next(answer(a, right)));
  assert.ok(perkReady(a), 'new stage: ready again');
  // Model Swap: swaps the question once per game, same boss, keeps spicy-ness, no repeats
  let m = startRound(initialState(buildRounds(BOSSES), 'mage'));
  const before = m.rounds[0].q;
  m = modelSwap(m, BOSSES);
  assert.notEqual(m.rounds[0].q.id, before.id);
  assert.equal(m.rounds[0].bossIndex, 0);
  assert.equal(SPICY_OF(m.rounds[0].q), SPICY_OF(before));
  assert.notEqual(m.rounds[0].q.type, m.rounds[1].q.type);
  assert.equal(modelSwap(m, BOSSES), m, 'only once per game');
  // Chai Power: chai heals double
  const chai = (style) => {
    let c = { ...startRound(initialState(buildRounds(BOSSES), style)), hp: 50 };
    c = next(answer(c, right));
    c = next(answer(startRound(c), right));
    return answer(startRound(c), right).hp;
  };
  assert.equal(chai('brawler'), 50 + CHAI_HEAL * 2);
  assert.equal(chai('archer'), 50 + CHAI_HEAL);
  // Laser Focus and Timer Roar change the clock
  const q = BOSSES[0].questions[0];
  assert.equal(roundSeconds(BOSSES[0], q, 'blade'), secondsFor(BOSSES[0], q) + 5);
  assert.equal(roundSeconds(BOSSES[3], q, 'archer', 'timecut'), secondsFor(BOSSES[3], q) - 8);
});

test('bosses: every boss has art, a portrait and a round-2 special', () => {
  const effects = new Set();
  for (const b of BOSSES) {
    assert.ok(b.art && b.portrait, `${b.id} art`);
    assert.ok(b.special?.name && b.special.text, `${b.id} special`);
    effects.add(b.special.effect);
  }
  assert.deepEqual([...effects].sort(), ['drones', 'flood', 'freeze', 'shuffle', 'timecut']);
  assert.equal(BOSSES.filter((b) => b.final).length, 1);
  assert.ok(BOSSES[4].final);
});

test('choose your attack: suggestions are different moves and do not use up the history', () => {
  const h = createMoveHistory();
  const [a1, a2] = h.suggest('hero', STYLES.blade.moves, [1, 2], 2);
  assert.notEqual(a1.name, a2.name);
  assert.notEqual(a1.kind, a2.kind);
  h.commit('hero', a2);
  const next2 = h.suggest('hero', STYLES.blade.moves, [1, 2], 2);
  assert.ok(next2.every((m) => m.name !== a2.name && m.kind !== a2.kind));
});
