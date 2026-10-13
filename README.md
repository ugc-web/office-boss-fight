# Office Boss Fight

Fight office villains using the right AI tools. Survive the workday. Become the AI Overlord.

Built with Next.js 14 (App Router), React 18, and Tailwind CSS. There is no backend, no login, and no API keys.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # game-logic unit tests (node --test)
npm run build
```

Deploy: push to GitHub and import the repo in Vercel (no config needed). You can set `NEXT_PUBLIC_SITE_URL` for OG metadata.

## Structure

| Path | Purpose |
|---|---|
| `lib/data/*.mjs` | One file per boss: biome, personality lines and a pool of 11 questions of mixed types. Each question has a `type`, a `sfx` topic sound and sometimes a `doc` (clues, an email to compare, steps to order) |
| `lib/bosses.mjs` | Combines the bosses, plus the hero, end messages, taglines and the "What AI can do for you" sheet with the 4 golden rules |
| `lib/game.mjs` | Pure game rules: rounds, HP, boss HP, score, streak, Chai Break, KO/escape, end states, titles |
| `lib/game.test.mjs` | Unit tests for the rules and the content |
| `lib/analytics.js` | `track()` sends events to Vercel Analytics / gtag / Plausible if present, plus a localStorage log (`obf_events`) |
| `lib/sound.js` | Web Audio 8-bit SFX (combat, boss roars, topic sounds like email ping / phone / camera / clock) + a music loop per boss, with mute (remembered) |
| `lib/textures.js` | Minecraft-style 16x16 block textures (grass, dirt, sand, netherrack...) generated as SVG data URIs |
| `lib/mobs.js` + `components/Mob.js` | Blocky characters built from separate limbs. Poses `idle / walk / attack / hurt / ko / cheer` are animated in `app/globals.css` |
| `components/World.js` | A biome per boss (ocean, swamp, The End, desert, Nether) with clouds, embers, trees and a coworker walking past |
| `components/` | `Game` (screen flow + music), `Landing` (title screen), `BossIntro` (walk-in VS), `Battle` (timer, two-column on desktop) + `Arena` (fight scene), `Results`, `Extras`, `ui` (hearts, boss bar, particles) |

## Rules
- 100 HP (10 hearts). 5 bosses, each with 2 rounds. Each boss picks 2 random questions of different types, and the game spreads types out, so every run has at least 6 kinds of question. 10 rounds in total, different every game.
- 30 seconds per question (25 for the final boss), +10 seconds when there is something to read first. Running out of time counts as wrong.
- No Next buttons. A right answer shows a short cheer and moves on after about 2 seconds (3 on a K.O. or Chai Break). A wrong answer opens a pop-up with the right answer and why, then moves on after about 7 seconds. Boss intros start the fight after 4.5 seconds. Timings live in `FEEDBACK_MS` and `INTRO_MS` in `lib/game.mjs`.
- Options are shuffled. One attempt per question, no retries.
- Correct answer: +10 score and 50% boss damage (2 hits = K.O.). Wrong answer: -20 HP, a roast, and the boss throws something at you. If you miss the second hit, the boss escapes undefeated.
- 3 correct in a row: Chai Break, +10 HP (max 100). A wrong answer resets the streak.
- Game over at 0 HP (5 wrong answers). Victory after round 10.
- Titles: 0-40 Manual Labour Legend · 41-70 Corporate Survivor · 71-100 AI Overlord.
- Keyboard: 1-4 or A-D to answer. Enter or Space skips the wait (optional).

## Analytics events
`game_start`, `replay`, `answer` (boss, question id, type, correct → most-missed questions), `game_complete`, `game_over` (score, hp, defeated, missed), `share_click`, `challenge_click`, `challenge_link_open`.
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

The `variety` tests fail if a boss has fewer than 6 types, or if a game has the same type twice for one boss. The `no give-away` tests fail if the right answer is the longest option in more than 30% of questions, or more than 1.25x longer than the wrong ones on average.
