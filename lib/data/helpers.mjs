export const ok = (id, text, explain) => ({ id, text, explain, correct: true });
export const no = (id, text, explain, roast) => ({ id, text, explain, roast });
