// Pure game logic. Framework-free so it can be unit-tested with `node --test`.
//
// Structure: 5 bosses x 2 rounds (1 work-problem question + 1 random AI-basics question) = 10 rounds.
// Each correct answer = 10 points and 50 boss damage, so max score is 100 and 2 hits KO a boss.

export const MAX_HP = 100;
export const BOSS_HP = 100;
export const HIT_DAMAGE = 50;
export const POINTS_PER_HIT = 10;
export const WRONG_DAMAGE = 20;
export const CHAI_HEAL = 10;
export const CHAI_STREAK = 3;

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

/** One workflow question + one random tool question per boss, options shuffled. */
export function buildRounds(bosses, rand = Math.random) {
  const rounds = [];
  bosses.forEach((b, bossIndex) => {
    const tool = b.tools[Math.floor(rand() * b.tools.length)];
    for (const q of [b.workflow, tool]) {
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
    last: { optionId: option.id, correct, chai, ko, escaped },
  };
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
