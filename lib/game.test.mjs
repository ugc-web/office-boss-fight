import test from 'node:test';
import assert from 'node:assert/strict';
import { SPICY, buildRounds, initialState, startRound, answer, next, timeout, getTitle, secondsFor, feedbackDelay, FEEDBACK_MS, MAX_HP } from './game.mjs';
import { BOSSES, QUESTION_TYPES, findQuestion, allQuestions } from './bosses.mjs';

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
    assert.ok(b.questions.length >= 10, `${b.id} needs a big question pool`);
    assert.ok(b.biome, `${b.id} needs a biome`);
    for (const q of allQuestions(b)) {
      assert.ok(q.sfx, `${q.id} needs a topic sound`);
      assert.ok(QUESTION_TYPES[q.type], `${q.id} has unknown type "${q.type}"`);
      if (q.doc) assert.ok(q.doc.label && q.doc.lines.length >= 1 && q.doc.lines.every((l) => l.length <= 160), `${q.id} doc`);
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
    for (const q of allQuestions(b)) {
      for (const text of [q.scenario, q.question, ...(q.doc?.lines || []), ...q.options.flatMap((o) => [o.text, o.explain])]) {
        assert.doesNotMatch(text, JARGON, `${q.id}: "${text}"`);
      }
      for (const o of q.options) assert.ok(o.text.length <= 130, `${q.id}/${o.id} answer too long (${o.text.length})`);
    }
  }
});

test('no give-away: the right answer is not usually the longest one', () => {
  const qs = BOSSES.flatMap(allQuestions);
  let longest = 0;
  for (const q of qs) {
    const len = q.options.map((o) => o.text.length);
    const right = q.options.find((o) => o.correct).text.length;
    const avgWrong = (len.reduce((a, b) => a + b, 0) - right) / 3;
    if (right === Math.max(...len)) longest++;
    assert.ok(right / avgWrong <= 1.25, `${q.id}: right answer is much longer than the wrong ones (${(right / avgWrong).toFixed(2)}x)`);
  }
  // Random chance is 25%. Keep it at or below 30% so length is never a reliable hint.
  assert.ok(longest / qs.length <= 0.3, `right answer is the longest in ${longest}/${qs.length} questions`);
});

test('no give-away: right answer position is random after shuffling', () => {
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < 400; i++) for (const r of buildRounds(BOSSES)) counts[r.q.options.findIndex((o) => o.correct)]++;
  for (const c of counts) assert.ok(c > 800 && c < 1200, `positions skewed: ${counts}`);
});

test('variety: every boss mixes at least 6 question types, including case studies, spot-the-mistake, brain teasers and myths', () => {
  for (const b of BOSSES) {
    const types = new Set(b.questions.map((q) => q.type));
    assert.ok(types.size >= 6, `${b.id} has only ${types.size} types`);
    for (const t of ['work', 'case', 'spot', 'puzzle', 'myth', 'tool']) {
      assert.ok(BOSSES.some((x) => x.questions.some((q) => q.type === t)), `no ${t} questions`);
    }
  }
});

test('buildRounds: 10 rounds, 2 per boss, the 2 questions of a boss are different types, many types per game', () => {
  for (let i = 0; i < 200; i++) {
    const r = buildRounds(BOSSES);
    assert.equal(r.length, 10);
    for (let b = 0; b < 5; b++) {
      assert.equal(r[b * 2].bossIndex, b);
      assert.equal(r[b * 2 + 1].bossIndex, b);
      assert.notEqual(r[b * 2].q.type, r[b * 2 + 1].q.type);
    }
    const types = new Set(r.map((x) => x.q.type));
    assert.ok(types.size >= 6, `only ${types.size} question types in one game`);
  }
});

test('spicy questions: every boss has named-tool and crazy-situation questions, and every stage plays one', () => {
  for (const b of BOSSES) {
    assert.ok(b.questions.filter((q) => q.type === 'aitool').length >= 3, `${b.id} needs 3+ "Which AI Tool?" questions`);
    assert.ok(b.questions.filter((q) => q.type === 'crazy').length >= 2, `${b.id} needs 2+ "Crazy Situation" questions`);
  }
  const slots = [0, 0];
  for (let i = 0; i < 300; i++) {
    const r = buildRounds(BOSSES);
    for (let b = 0; b < 5; b++) {
      const pair = [r[b * 2], r[b * 2 + 1]];
      assert.ok(pair.some((x) => SPICY.includes(x.q.type)), 'every stage has a spicy question');
      pair.forEach((x, k) => SPICY.includes(x.q.type) && slots[k]++);
    }
  }
  assert.ok(slots[0] > 400 && slots[1] > 400, `spicy questions should show up in both rounds of a stage: ${slots}`);
});

test('buildRounds: games are different, and every question gets played over time', () => {
  const seen = new Set();
  const games = new Set();
  for (let i = 0; i < 600; i++) {
    const r = buildRounds(BOSSES);
    r.forEach((x) => seen.add(x.q.id));
    games.add(r.map((x) => x.q.id).join());
  }
  assert.equal(seen.size, BOSSES.flatMap(allQuestions).length);
  assert.ok(games.size > 500);
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

test('timer: running out of time counts as a wrong answer', () => {
  const s = timeout(startRound(initialState(buildRounds(BOSSES))));
  assert.equal(s.phase, 'feedback');
  assert.equal(s.last.correct, false);
  assert.equal(s.last.timeout, true);
  assert.equal(s.hp, MAX_HP - 20);
  assert.equal(s.streak, 0);
  assert.equal(secondsFor(BOSSES[0]), 30);
  assert.equal(secondsFor(BOSSES[4]), 25);
  // Questions with something to read (a case study, an email to compare) get 10 extra seconds.
  assert.equal(secondsFor(BOSSES[0], { doc: { lines: [] } }), 40);
  assert.equal(secondsFor(BOSSES[4], {}), 25);
});

test('auto-advance: no Next button, right answers move on fast, wrong answers stay long enough to read', () => {
  let s = startRound(initialState(buildRounds(BOSSES)));
  const hit = answer(s, right);
  assert.equal(feedbackDelay(hit.last), FEEDBACK_MS.right);
  const ko = answer(startRound(next(hit)), right);
  assert.equal(ko.last.ko, true);
  assert.equal(feedbackDelay(ko.last), FEEDBACK_MS.ko);
  const miss = answer(s, wrong);
  assert.equal(feedbackDelay(miss.last), FEEDBACK_MS.wrong);
  assert.equal(feedbackDelay(timeout(s).last), FEEDBACK_MS.wrong);
  assert.ok(FEEDBACK_MS.right <= 3000, 'right answers should not make people wait');
  assert.ok(FEEDBACK_MS.wrong >= 5000 && FEEDBACK_MS.wrong <= 9000, 'wrong answers: a few seconds to read the right one');
  assert.equal(feedbackDelay(null), 0);
});

test('title thresholds', () => {
  assert.equal(getTitle(40), 'Manual Labour Legend');
  assert.equal(getTitle(41), 'Corporate Survivor');
  assert.equal(getTitle(70), 'Corporate Survivor');
  assert.equal(getTitle(71), 'AI Overlord');
});
