// Static, curated content. No live AI calls.
import { inboxHydra } from './data/inbox.mjs';
import { excelMonster } from './data/excel.mjs';
import { meetingDemon } from './data/meeting.mjs';
import { pptPhantom } from './data/ppt.mjs';
import { deadlineDragon } from './data/dragon.mjs';

export const BOSSES = [inboxHydra, excelMonster, meetingDemon, pptPhantom, deadlineDragon];

export const HERO = {
  name: 'The Intern',
  title: 'Prompt Archer',
  hitLines: ['Prompt engineered!', 'Context is king!', 'Human in the loop!', 'Verified. Shipped.', 'Approved tools only!'],
  hurtLines: ['My KPIs!', 'Not the performance review!', 'I need a chai…', 'Is it Friday yet?'],
};

export const GAME_OVER_MESSAGES = [
  'HR has requested a meeting. Unfortunately, the meeting has no agenda.',
  'Your laptop has been reassigned to the intern’s intern.',
  'You’ve been promoted to Senior Manual Data Entry Specialist.',
  'Your out-of-office reply is now permanent.',
  'Security has escorted you out. They used AI to find the exit faster.',
];

export const VICTORY_MESSAGES = {
  'AI Overlord': 'Inbox zero. Deadlines crushed. The CEO wants to know your prompts.',
  'Corporate Survivor': 'You made it to 5 PM. Some bosses are still roaming the office.',
  'Manual Labour Legend': 'You survived on pure grit. Imagine what you could do with AI.',
};

export const TAGLINES = {
  'AI Overlord': 'Your colleagues fear your prompts.',
  'Corporate Survivor': 'You survived. Barely. Like every Monday.',
  'Manual Labour Legend': 'Still doing it by hand. Respect, honestly.',
};

// Cheat sheet shown on the results screen.
export const TOOLKIT = [
  { icon: '💬', job: 'Writing & tone', tools: 'ChatGPT · Claude · Copilot · Gemini' },
  { icon: '🎨', job: 'Images', tools: 'Midjourney · DALL·E · Adobe Firefly · Imagen' },
  { icon: '🎬', job: 'Video', tools: 'Runway · Veo · Sora · Pika' },
  { icon: '🎙️', job: 'Voice', tools: 'ElevenLabs' },
  { icon: '🎵', job: 'Music', tools: 'Suno · Udio' },
  { icon: '🔎', job: 'Research + sources', tools: 'Perplexity · ChatGPT search · Gemini' },
  { icon: '📊', job: 'Data & formulas', tools: 'Copilot in Excel · Gemini in Sheets · ChatGPT' },
  { icon: '🗓️', job: 'Meetings', tools: 'Otter · Fireflies · Zoom AI · Teams Copilot' },
  { icon: '🖥️', job: 'Slides', tools: 'Gamma · Copilot in PowerPoint · Canva' },
  { icon: '👨‍💻', job: 'Code', tools: 'GitHub Copilot · Cursor · Claude' },
];

export function findQuestion(id) {
  for (const b of BOSSES) {
    for (const q of [b.workflow, ...b.tools]) if (q.id === id) return { boss: b, q };
  }
  return null;
}
