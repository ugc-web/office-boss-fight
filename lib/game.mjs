// Pure game logic. Framework-free so it can be unit-tested with `node --test`.
//
// Structure: 5 bosses x 2 rounds = 10 rounds. Each boss has a pool of questions of different types
// (work problem, case study, spot the mistake, brain teaser, myth or fact, pick the tool...).
// The 2 rounds of a boss always have different types, and the game spreads types out so every run feels different.
// Each round has a timer; running out of time counts as a wrong answer.
// There is no "Next" button: after feedback the game moves on by itself (see feedbackDelay).
// Each correct answer = 10 points and 50 boss damage, so max score is 100 and 2 hits KO a boss.

export const MAX_HP = 100;
export const BOSS_HP = 100;
export const HIT_DAMAGE = 50;
export const POINTS_PER_HIT = 10;
export const WRONG_DAMAGE = 20;
export const CHAI_HEAL = 10;
export const CHAI_STREAK = 3;
export const ROUND_SECONDS = 30;
export const FINAL_BOSS_SECONDS = 25;
export const READING_BONUS_SECONDS = 10; // questions with a document to read (case study, spot the mistake...)
export const ROUNDS_PER_BOSS = 2;
// How long feedback stays on screen before the game moves on by itself.
export const FEEDBACK_MS = { right: 2200, ko: 3200, wrong: 7000 };
export const INTRO_MS = 4500; // boss intro auto-starts the fight
export const TIMEOUT_ID = '__timeout__';

export function getTitle(score) {
  if (score >= 71) return 'AI Overlord';
  if (score >= 41) return 'Corporate Survivor';
  return 'Manual Labour Legend';
}

export function shuffle(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * ROUNDS_PER_BOSS questions per boss, each of a different type, options shuffled.
 * Types already used earlier in the game are picked less, so one run mixes many kinds of questions.
 */
export function buildRounds(bosses, rand = Math.random) {
  const used = {};
  const rounds = [];
  bosses.forEach((b, bossIndex) => {
    const picked = [];
    for (let k = 0; k < ROUNDS_PER_BOSS; k++) {
      const pool = shuffle(b.questions.filter((q) => !picked.some((p) => p.type === q.type)), rand);
      pool.sort((x, y) => (used[x.type] || 0) - (used[y.type] || 0)); // stable: ties keep the random order
      const q = pool[0];
      picked.push(q);
      used[q.type] = (used[q.type] || 0) + 1;
      rounds.push({ bossIndex, q: { ...q, options: shuffle(q.options, rand) } });
    }
  });
  return rounds;
}

export function initialState(rounds) {
  return {
    phase: 'intro', // 'intro' | 'playing' | 'feedback' | 'victory' | 'gameover'
    rounds,
    round: 0,
    hp: MAX_HP,
    score: 0,
    streak: 0,
    bestStreak: 0,
    bossHp: BOSS_HP,
    defeated: 0,
    correct: 0,
    missed: [], // question ids
    last: null,
  };
}

export const bossIndexOf = (s) => s.rounds[Math.min(s.round, s.rounds.length - 1)].bossIndex;

function isLastRoundOfBoss(s) {
  const nextRound = s.rounds[s.round + 1];
  return !nextRound || nextRound.bossIndex !== s.rounds[s.round].bossIndex;
}

export function startRound(s) {
  return s.phase === 'intro' ? { ...s, phase: 'playing' } : s;
}

/** MVP rule: one attempt per question, no retries. */
export function answer(s, option) {
  if (s.phase !== 'playing') return s;
  const q = s.rounds[s.round].q;
  const correct = !!option.correct;
  let { hp, score, streak, bestStreak, bossHp, defeated, missed } = s;
  let chai = false;
  let ko = false;

  if (correct) {
    score += POINTS_PER_HIT;
    bossHp = Math.max(0, bossHp - HIT_DAMAGE);
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    if (streak % CHAI_STREAK === 0) {
      chai = true;
      hp = Math.min(MAX_HP, hp + CHAI_HEAL);
    }
    if (bossHp === 0) {
      ko = true;
      defeated += 1;
    }
  } else {
    hp = Math.max(0, hp - WRONG_DAMAGE);
    streak = 0;
    missed = [...missed, q.id];
  }

  const escaped = !ko && bossHp > 0 && isLastRoundOfBoss(s);
  return {
    ...s,
    phase: 'feedback',
    hp, score, streak, bestStreak, bossHp, defeated, missed,
    correct: s.correct + (correct ? 1 : 0),
    last: { optionId: option.id, correct, chai, ko, escaped, timeout: option.id === TIMEOUT_ID },
  };
}

/** The clock ran out: counts as a wrong answer. */
export function timeout(s) {
  return answer(s, { id: TIMEOUT_ID });
}

/** Time limit for a question. Questions with something to read first get extra time. */
export const secondsFor = (boss, q) => (boss?.final ? FINAL_BOSS_SECONDS : ROUND_SECONDS) + (q?.doc ? READING_BONUS_SECONDS : 0);

/** How long to show feedback before moving on automatically: wrong answers stay longer so you can read the right one. */
export function feedbackDelay(last) {
  if (!last) return 0;
  if (!last.correct) return FEEDBACK_MS.wrong;
  return last.ko || last.chai ? FEEDBACK_MS.ko : FEEDBACK_MS.right;
}

/** Advance after feedback: next round, next boss intro, victory, or game over. */
export function next(s) {
  if (s.phase !== 'feedback') return s;
  if (s.hp <= 0) return { ...s, phase: 'gameover' };
  const round = s.round + 1;
  if (round >= s.rounds.length) return { ...s, phase: 'victory', round };
  const newBoss = s.rounds[round].bossIndex !== s.rounds[s.round].bossIndex;
  return {
    ...s,
    round,
    phase: newBoss ? 'intro' : 'playing',
    bossHp: newBoss ? BOSS_HP : s.bossHp,
    last: null,
  };
}

/** Number of rounds the player actually answered. */
export function roundsFaced(s) {
  if (s.phase === 'victory') return s.rounds.length;
  return s.round + (s.phase === 'feedback' || s.phase === 'gameover' ? 1 : 0);
}
