# Office Boss Fight

Fight office villains using the right AI tools. Survive the workday. Become the AI Overlord.

Built with Next.js 14 (App Router), React 18, and Tailwind CSS. There is no backend, no login, and no API keys.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # game-logic + fight unit tests (node --test)
npm run build
```

Deploy: push to GitHub and import the repo in Vercel (no config needed). You can set `NEXT_PUBLIC_SITE_URL` for OG metadata.

## Structure

| Path | Purpose |
|---|---|
| `lib/data/*.mjs` | One file per boss: biome, personality lines, pre-fight `banter`, 6 attack `moves`, a `winQuote` and a pool of 17 questions of mixed types. Each question has a `type`, a `sfx` topic sound and sometimes a `doc` (clues, an email to compare, steps to order) |
| `lib/bosses.mjs` | Combines the bosses, plus the hero, end messages, taglines and the "What AI can do for you" sheet with the 4 golden rules |
| `lib/game.mjs` | Pure game rules: rounds, HP, boss HP, score, streak, Chai Break, KO/escape, end states, titles |
| `lib/fighters.mjs` | Playable fighting styles (AI Archer, Prompt Samurai, Chai Brawler, Data Wizard), each with 6 moves and an ultimate; creator palettes; the 4 preset fighters |
| `lib/moves.mjs` | Fight choreography: who attacks (the winner of the question), which move fits the moment, announcer commentary, pre-fight script, finishing-move words |
| `lib/roster.js` | Custom fighters and the selected fighter, saved in localStorage (`obf_fighters`, `obf_fighter`) |
| `lib/fullscreen.js` | Browser full-screen mode (entered when the player clicks "Choose your fighter") |
| `lib/game.test.mjs`, `lib/fight.test.mjs` | Unit tests for the rules, the content, and the fight system |
| `lib/analytics.js` | `track()` sends events to Vercel Analytics / gtag / Plausible if present, plus a localStorage log (`obf_events`) |
| `lib/sound.js` | Web Audio 8-bit SFX (combat, boss roars, topic sounds like email ping / phone / camera / clock), a music loop per boss, and `announce()` for the announcer voice ("Round 1… Ready? Fight!", "Unbeatable") using the browser's speech. Mute is remembered |
| `lib/textures.js` | Minecraft-style 16x16 block textures (grass, dirt, sand, netherrack...) generated as SVG data URIs |
| `lib/mobs.js` + `components/Mob.js` | Blocky characters built from separate limbs; `heroModel(look)` builds a custom fighter (skin, hair, outfit, weapon). Poses `idle / walk / attack / hurt / ko / cheer / cast` and the attack moves are animated in `app/globals.css` |
| `components/World.js` | A biome per boss (ocean, swamp, The End, desert, Nether) with clouds, embers, trees and a coworker walking past |
| `components/` | `Game` (screen flow, music, picks each attack), `Landing` (title screen), `FighterSelect` (roster + character creator), `Battle` (full-screen fight: pre-fight banter, READY/FIGHT cues, question panel) + `Arena` (stage, Tekken-style HUD, attack animations), `Finale` (finishing move), `Results`, `Extras`, `ui` |

## Flow
Title → **Select your fighter** (pick a preset or create up to 9 of your own) → for each of the 5 stages: fighters walk in, the announcer and both sides trade lines, **READY? → FIGHT!** → 2 rounds (a quick "Round 2 … Fight!" cue between them) → after the last round, the winner's **finishing move** ("UNBEATABLE!", "FLAWLESS VICTORY", or "<BOSS> WINS") → results. The whole game plays full screen. Tap / Enter moves the intro on; "Skip intro" (or S / Esc) jumps to READY.

## Fight system
- Whoever wins the question attacks: a right answer = the hero attacks, wrong or too slow = the boss attacks.
- 9 kinds of attack (shot, dash, uppercut, slam, rain, beam, summon, spin, teleport) with their own projectiles, hit reactions (knockback, launch, squash, combo juggle), sparks, screen shake and sound.
- The moment picks the move tier: a KO or a comeback at low health gets specials, a streak gets combos, a broken streak gets a "COMBO BREAKER", low health gets brutal boss moves. Attacks never repeat back to back (no same move, no same kind twice in a row) and less-used moves are favoured, so a run shows off the whole move list.

## Rules
- 100 HP (10 hearts). 5 bosses, each with 2 rounds. Each boss picks 2 random questions of different types (one of them always a 🛠️ Which AI Tool? or 🤯 Crazy Situation), and the game spreads types out, so every run has at least 6 kinds of question. 10 rounds in total, different every game.
- 30 seconds per question (25 for the final boss), +10 seconds when there is something to read first. Running out of time counts as wrong.
- No Next buttons. A right answer plays your attack, shows a short cheer and moves on after 3 seconds (3.8 on a K.O. or Chai Break). A wrong answer plays the boss's attack, then a pop-up with the right answer and why, and moves on after 8 seconds. Timings live in `FEEDBACK_MS` in `lib/game.mjs` and `KINDS` in `lib/moves.mjs`.
- Options are shuffled. One attempt per question, no retries.
- Correct answer: +10 score and 50% boss damage (2 hits = K.O.). Wrong answer: -20 HP, a roast, and the boss throws something at you. If you miss the second hit, the boss escapes undefeated.
- 3 correct in a row: Chai Break, +10 HP (max 100). A wrong answer resets the streak.
- Game over at 0 HP (5 wrong answers). Victory after round 10.
- Titles: 0-40 Manual Labour Legend · 41-70 Corporate Survivor · 71-100 AI Overlord.
- Keyboard: 1-4 or A-D to answer. Enter or Space skips the wait (optional). Arrow keys + Enter on the fighter select screen.

## Analytics events
`game_start` (style, custom fighter), `replay`, `fighter_select`, `fighter_create`, `fighter_edit`, `answer` (boss, question id, type, correct, move → most-missed questions), `game_complete`, `game_over` (score, hp, defeated, missed), `share_click`, `challenge_click`, `challenge_link_open`.
To send them to Vercel, add `@vercel/analytics` and its `<Analytics />` component. `track()` already calls `window.va` if it exists.

## Sharing
Uses `navigator.share` when available, with a clipboard fallback. Challenge links look like `/?challenge=80` and show a banner on the landing page.

## Audience & writing style
The game is for people **without a tech background**. The questions use plain everyday language and office situations, with no jargon (no formulas, scripts or file formats). They teach what AI is good at, and the 4 golden rules: *check its work, keep secrets out, be clear*. The test `content is beginner-friendly` fails if jargon words or long answers are added.

**Keep it challenging.** Wrong answers must be believable traps ("let AI auto-reply", "ask AI if it's sure"), not silly jokes. Some questions have "don't use AI" as the right answer.

**Question types** (badge in the battle screen, defined in `QUESTION_TYPES` in `lib/bosses.mjs`):

| Type | What the player does |
|---|---|
| 💼 Work Problem | Pick the best plan for an everyday office situation |
| 🕵️ Case Study | Read a short story with clues, then find what went wrong or the best fix |
| 🔍 Spot the Mistake | Compare the original with what AI wrote and find the error |
| 🧩 Brain Teaser | Put steps in order, rank requests, add up time, or find the odd one out |
| ❓ Myth or Fact | Three statements are true, find the myth |
| 🧰 Pick the Tool | Choose the right kind of AI tool for the job (or no AI at all) |
| ✍️ Ask It Right | Choose the request that gets the best answer from AI |
| 🔒 Stay Safe | Privacy, scams, fakes and permission |
| 🛠️ Which AI Tool? | Pick the real, named tool for the job (ChatGPT, Copilot, Gemini, Perplexity, NotebookLM, Gamma, Canva, HeyGen, ElevenLabs, Otter.ai, Krisp, Suno, Zapier, Lovable…). Wrong answers are real tools used for the wrong job |
| 🤯 Crazy Situation | Wild but true office moments: a deepfake CFO on a video call, an AI that deleted 6,000 rows, a CEO who wants a fake photo with a cricketer |

**Spicy questions:** every stage plays at least one 🛠️ or 🤯 question (in a random round). The `spicy questions` test checks this.

The `variety` tests fail if a boss has fewer than 6 types, or if a game has the same type twice for one boss. The `no give-away` tests fail if the right answer is the longest option in more than 30% of questions, or more than 1.25x longer than the wrong ones on average.
