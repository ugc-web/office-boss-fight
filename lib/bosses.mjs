// Static, curated content. No live AI calls.
import { inboxHydra } from './data/inbox.mjs';
import { excelMonster } from './data/excel.mjs';
import { meetingDemon } from './data/meeting.mjs';
import { pptPhantom } from './data/ppt.mjs';
import { deadlineDragon } from './data/dragon.mjs';

export const BOSSES = [inboxHydra, excelMonster, meetingDemon, pptPhantom, deadlineDragon];

export const HERO = {
  name: 'The Intern',
  title: 'AI Archer',
  hitLines: ['Clear instructions win!', 'Checked it twice!', 'AI helps, I decide!', 'Secrets stay secret!', 'Work smarter, not harder!'],
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
  'AI Overlord': 'Inbox zero. Deadlines crushed. The CEO wants to know your AI tricks.',
  'Corporate Survivor': 'You made it to 5 PM. Some bosses are still roaming the office.',
  'Manual Labour Legend': 'You survived on pure grit. Imagine what you could do with AI.',
};

export const TAGLINES = {
  'AI Overlord': 'Your colleagues want your AI tricks.',
  'Corporate Survivor': 'You survived. Barely. Like every Monday.',
  'Manual Labour Legend': 'Still doing it by hand. Respect, honestly.',
};

// Cheat sheet shown on the results screen: what AI can do, in plain words.
export const TOOLKIT = [
  { icon: '✍️', job: 'Write & rewrite', tools: 'Emails, messages, a friendlier tone' },
  { icon: '📝', job: 'Summarise', tools: 'Long emails, documents, meeting notes' },
  { icon: '🌍', job: 'Translate', tools: 'Understand and reply in other languages' },
  { icon: '📊', job: 'Explain numbers', tools: 'Find trends and make simple charts' },
  { icon: '🎨', job: 'Make pictures', tools: 'Describe the picture you want in words' },
  { icon: '🗣️', job: 'Read aloud', tools: 'Turn written text into a natural voice' },
  { icon: '📅', job: 'Plan your day', tools: 'Put messy to-do lists in order' },
  { icon: '🎤', job: 'Practise', tools: 'Rehearse a meeting or an interview' },
];

export const GOLDEN_RULES = [
  'Check its work. AI can sound sure and still be wrong.',
  'Keep secrets out. No passwords, bank details or private customer info.',
  'Be clear. The more detail you give, the better the answer.',
];

export function findQuestion(id) {
  for (const b of BOSSES) {
    for (const q of [b.workflow, ...b.tools]) if (q.id === id) return { boss: b, q };
  }
  return null;
}
