import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, answer, next, getTitle, MAX_HP } from './game.mjs';
import { BOSSES } from './bosses.mjs';

const right = { id: 'a', correct: true };
const wrong = { id: 'b' };

function play(choices) {
  let s = initialState(5);
  for (const c of choices) {
    if (s.phase !== 'playing') break;
    s = answer(s, BOSSES[s.level].id, c ? right : wrong);
    s = next(s);
  }
  return s;
}

test('data: 5 bosses, 4 options each, exactly one correct', () => {
  assert.equal(BOSSES.length, 5);
  for (const b of BOSSES) {
    assert.equal(b.options.length, 4);
    assert.equal(b.options.filter((o) => o.correct).length, 1);
    for (const o of b.options) {
      assert.ok(o.explain);
      if (!o.correct) assert.ok(o.roast);
    }
  }
});

test('perfect run: 100 score, HP capped at 100, victory', () => {
  const s = play([1, 1, 1, 1, 1]);
  assert.equal(s.phase, 'victory');
  assert.equal(s.score, 100);
  assert.equal(s.hp, MAX_HP);
  assert.equal(s.defeated, 5);
  assert.equal(getTitle(s.score), 'AI Overlord');
});

test('chai break heals 10 after 3 correct in a row', () => {
  let s = initialState(5);
  s = next(answer(s, 'x', wrong)); // 80
  for (let i = 0; i < 2; i++) s = next(answer(s, 'x', right));
  s = answer(s, 'x', right);
  assert.equal(s.last.chai, true);
  assert.equal(s.hp, 90);
});

test('wrong answer resets streak and costs 20 HP', () => {
  let s = initialState(5);
  s = next(answer(s, 'x', right));
  s = next(answer(s, 'x', right));
  s = answer(s, 'x', wrong);
  assert.equal(s.streak, 0);
  assert.equal(s.hp, 80);
  assert.equal(s.missed.length, 1);
});

test('all wrong: survives 4 hits, game over on 5th', () => {
  const s = play([0, 0, 0, 0, 0]);
  assert.equal(s.phase, 'gameover');
  assert.equal(s.hp, 0);
  assert.equal(s.score, 0);
  assert.equal(getTitle(0), 'Manual Labour Legend');
});

test('titles thresholds', () => {
  assert.equal(getTitle(40), 'Manual Labour Legend');
  assert.equal(getTitle(60), 'Corporate Survivor');
  assert.equal(getTitle(80), 'AI Overlord');
});
