// Static, curated content. No live AI calls.
import { inboxHydra } from './data/inbox.mjs';
import { meetingGolem } from './data/golem.mjs';
import { micromanagerDrone } from './data/drone.mjs';
import { deadlineTrex } from './data/trex.mjs';
import { ceoFinalForm } from './data/ceo.mjs';

// Stage order: easiest to final boss.
export const BOSSES = [inboxHydra, meetingGolem, micromanagerDrone, deadlineTrex, ceoFinalForm];

export const HERO = {
  name: 'The Intern',
  title: 'AI Archer',
  hitLines: ['Clear instructions win!', 'Checked it twice!', 'AI helps, I decide!', 'Secrets stay secret!', 'Work smarter!', 'Bullseye!'],
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
  { icon: '✍️', job: 'Write & fix tone', tools: 'ChatGPT, Claude, Gemini · Grammarly' },
  { icon: '📧', job: 'Catch up on email', tools: 'Copilot in Outlook · Gemini in Gmail' },
  { icon: '🔎', job: 'Research with sources', tools: 'Perplexity' },
  { icon: '📚', job: 'Ask your own documents', tools: 'NotebookLM' },
  { icon: '📊', job: 'Explain numbers', tools: 'Copilot in Excel · ChatGPT (upload a file)' },
  { icon: '🌍', job: 'Translate', tools: 'DeepL · HeyGen for videos' },
  { icon: '🖼️', job: 'Slides & design', tools: 'Gamma · Canva · Midjourney' },
  { icon: '🎙️', job: 'Meetings & calls', tools: 'Otter.ai, Copilot in Teams · Krisp' },
  { icon: '🗣️', job: 'Voices & music', tools: 'ElevenLabs · Suno' },
  { icon: '⚙️', job: 'Automate & build', tools: 'Zapier · Lovable' },
];

export const GOLDEN_RULES = [
  'Check its work. AI can sound sure and still be wrong, even about its own answers.',
  'Keep secrets out. No passwords, bank details or private customer info.',
  'Be clear. Say who it’s for, what you need and what matters.',
  'Know when not to use it. A calculator, a phone call or your own words are sometimes better.',
];

// Question types: each one has its own badge colour in the battle screen.
export const QUESTION_TYPES = {
  work: { icon: '💼', label: 'Work Problem', bg: '#f5a623', fg: '#000' },
  case: { icon: '🕵️', label: 'Case Study', bg: '#a855f7', fg: '#fff' },
  spot: { icon: '🔍', label: 'Spot the Mistake', bg: '#ef4444', fg: '#fff' },
  puzzle: { icon: '🧩', label: 'Brain Teaser', bg: '#22d3ee', fg: '#000' },
  myth: { icon: '❓', label: 'Myth or Fact', bg: '#facc15', fg: '#000' },
  tool: { icon: '🧰', label: 'Pick the Tool', bg: '#3b82f6', fg: '#fff' },
  prompt: { icon: '✍️', label: 'Ask It Right', bg: '#4ade80', fg: '#000' },
  safe: { icon: '🔒', label: 'Stay Safe', bg: '#6b7280', fg: '#fff' },
  // The "spicy" ones: real, named AI tools and wild-but-true office situations. Every stage has at least one.
  aitool: { icon: '🛠️', label: 'Which AI Tool?', bg: '#ec4899', fg: '#fff' },
  crazy: { icon: '🤯', label: 'Crazy Situation', bg: '#f97316', fg: '#000' },
};

export const SPICY_TYPES = ['aitool', 'crazy'];

export const allQuestions = (b) => b.questions;

export function findQuestion(id) {
  for (const b of BOSSES) {
    for (const q of allQuestions(b)) if (q.id === id) return { boss: b, q };
  }
  return null;
}
