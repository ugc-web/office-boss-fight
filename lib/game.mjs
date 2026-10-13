// Pure game logic. Kept framework-free so it can be unit-tested with `node --test`.

export const MAX_HP = 100;
export const POINTS_PER_BOSS = 20;
export const WRONG_DAMAGE = 20;
export const CHAI_HEAL = 10;
export const CHAI_STREAK = 3;

export function getTitle(score) {
  if (score >= 71) return 'AI Overlord';
  if (score >= 41) return 'Corporate Survivor';
  return 'Manual Labour Legend';
}

export function initialState(totalBosses) {
  return {
    phase: 'playing', // 'playing' | 'feedback' | 'victory' | 'gameover'
    totalBosses,
    level: 0, // index of current boss
    hp: MAX_HP,
    score: 0,
    streak: 0,
    defeated: 0,
    missed: [], // boss ids answered incorrectly
    last: null, // { optionId, correct, chai }
  };
}

/**
 * Apply an answer. MVP rule: one attempt per boss (no retries).
 * A wrong answer leaves that boss undefeated and moves on, unless HP reaches 0.
 */
export function answer(state, bossId, option) {
  if (state.phase !== 'playing') return state;
  const correct = !!option.correct;
  let { hp, score, streak, defeated, missed } = state;
  let chai = false;

  if (correct) {
    score += POINTS_PER_BOSS;
    defeated += 1;
    streak += 1;
    if (streak > 0 && streak % CHAI_STREAK === 0) {
      chai = true;
      hp = Math.min(MAX_HP, hp + CHAI_HEAL);
    }
  } else {
    hp = Math.max(0, hp - WRONG_DAMAGE);
    streak = 0;
    missed = [...missed, bossId];
  }

  return {
    ...state,
    phase: 'feedback',
    hp, score, streak, defeated, missed,
    last: { optionId: option.id, correct, chai },
  };
}

/** Move on from the feedback screen to the next boss, victory, or game over. */
export function next(state) {
  if (state.phase !== 'feedback') return state;
  if (state.hp <= 0) return { ...state, phase: 'gameover' };
  const level = state.level + 1;
  if (level >= state.totalBosses) return { ...state, phase: 'victory', level: state.totalBosses };
  return { ...state, phase: 'playing', level, last: null };
}

export function shuffle(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
