import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRounds, initialState, startRound, answer, next, getTitle, MAX_HP } from './game.mjs';
import { BOSSES, findQuestion } from './bosses.mjs';

const right = { id: 'x', correct: true };
const wrong = { id: 'y' };

function play(pattern) {
  let s = initialState(buildRounds(BOSSES));
  for (const c of pattern) {
    s = startRound(s);
    if (s.phase !== 'playing') break;
    s = next(answer(s, c ? right : wrong));
  }
  return s;
}

test('content: every question has 4 options, exactly 1 correct, explanations + roasts, unique ids', () => {
  const ids = new Set();
  for (const b of BOSSES) {
    assert.ok(b.tools.length >= 2, `${b.id} needs a tool pool`);
    for (const q of [b.workflow, ...b.tools]) {
      assert.ok(!ids.has(q.id), `duplicate ${q.id}`);
      ids.add(q.id);
      assert.equal(q.options.length, 4, q.id);
      assert.equal(q.options.filter((o) => o.correct).length, 1, q.id);
      for (const o of q.options) {
        assert.ok(o.text && o.explain, q.id);
        if (!o.correct) assert.ok(o.roast, `${q.id}/${o.id} roast`);
      }
    }
  }
  assert.ok(findQuestion('ppt-tool-image'));
});

test('content is beginner-friendly: no jargon, short answers', () => {
  const JARGON = /\b(XLOOKUP|VLOOKUP|CSV|script|syntax|formula|citation|workflow|API|prompt engineering|hallucinat|LLM|transcri|pivot|HTML|React|Python|commercial rights|licen[cs]e)\b/i;
  for (const b of BOSSES) {
    for (const q of [b.workflow, ...b.tools]) {
      for (const text of [q.scenario, q.question, ...q.options.flatMap((o) => [o.text, o.explain])]) {
        assert.doesNotMatch(text, JARGON, `${q.id}: "${text}"`);
      }
      for (const o of q.options) assert.ok(o.text.length <= 130, `${q.id}/${o.id} answer too long (${o.text.length})`);
    }
  }
});

test('buildRounds: 10 rounds, 2 per boss (workflow then tool)', () => {
  const r = buildRounds(BOSSES);
  assert.equal(r.length, 10);
  for (let i = 0; i < 5; i++) {
    assert.equal(r[i * 2].q.kind, 'workflow');
    assert.equal(r[i * 2 + 1].q.kind, 'tool');
    assert.equal(r[i * 2].bossIndex, i);
  }
});

test('perfect run: 100/100, 5 KOs, HP capped at 100, victory', () => {
  const s = play(Array(10).fill(1));
  assert.equal(s.phase, 'victory');
  assert.equal(s.score, 100);
  assert.equal(s.defeated, 5);
  assert.equal(s.hp, MAX_HP);
  assert.equal(s.bestStreak, 10);
  assert.equal(getTitle(s.score), 'AI Overlord');
});

test('two hits KO a boss; a miss lets the boss escape', () => {
  let s = startRound(initialState(buildRounds(BOSSES)));
  s = answer(s, right);
  assert.equal(s.bossHp, 50);
  assert.equal(s.last.ko, false);
  s = startRound(next(s));
  s = answer(s, right);
  assert.equal(s.last.ko, true);
  assert.equal(s.defeated, 1);
  s = next(s);
  assert.equal(s.phase, 'intro');
  assert.equal(s.bossHp, 100);
  s = answer(startRound(s), right);
  s = answer(startRound(next(s)), wrong);
  assert.equal(s.last.escaped, true);
  assert.equal(s.defeated, 1);
});

test('chai break: +10 HP on every 3rd consecutive correct', () => {
  const s0 = startRound(initialState(buildRounds(BOSSES)));
  let s = next(answer(s0, wrong)); // 80 HP
  s = next(answer(startRound(s), right));
  s = next(answer(startRound(s), right));
  s = answer(startRound(s), right);
  assert.equal(s.last.chai, true);
  assert.equal(s.hp, 90);
});

test('5 wrong answers = game over with 0 HP and partial score kept', () => {
  const s = play([1, 0, 0, 0, 0, 0]);
  assert.equal(s.phase, 'gameover');
  assert.equal(s.hp, 0);
  assert.equal(s.score, 10);
  assert.equal(s.missed.length, 5);
});

test('title thresholds', () => {
  assert.equal(getTitle(40), 'Manual Labour Legend');
  assert.equal(getTitle(41), 'Corporate Survivor');
  assert.equal(getTitle(70), 'Corporate Survivor');
  assert.equal(getTitle(71), 'AI Overlord');
});
