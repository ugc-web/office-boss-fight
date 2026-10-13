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
| `lib/data/*.mjs` | One file per boss: personality lines, 1 workflow question, a pool of AI-tool questions |
| `lib/bosses.mjs` | Combines the bosses, plus the hero, end messages, taglines and the AI toolkit cheat sheet |
| `lib/game.mjs` | Pure game rules: rounds, HP, boss HP, score, streak, Chai Break, KO/escape, end states, titles |
| `lib/game.test.mjs` | Unit tests for the rules and the content |
| `lib/analytics.js` | `track()` sends events to Vercel Analytics / gtag / Plausible if present, plus a localStorage log (`obf_events`) |
| `lib/sound.js` | 8-bit Web Audio sound effects with mute (remembered) |
| `components/Sprite.js` | Hand-drawn pixel-art sprites (hero + 5 bosses) as SVG |
| `components/` | `Game` (screen flow), `Landing`, `BossIntro` (VS card), `Battle` + `Arena` (fight scene), `Results`, `Extras`, `ui` |

## Rules
- 100 HP. 5 bosses, each with 2 rounds: a workflow question, then a random AI-tool question (images, video, voice, music, research, code, meetings, slides, data). 10 rounds in total.
- Options are shuffled. One attempt per question, no retries.
- Correct answer: +10 score and 50% boss damage (2 hits = K.O.). Wrong answer: -20 HP, a roast, and the boss throws something at you. If you miss the second hit, the boss escapes undefeated.
- 3 correct in a row: Chai Break, +10 HP (max 100). A wrong answer resets the streak.
- Game over at 0 HP (5 wrong answers). Victory after round 10.
- Titles: 0-40 Manual Labour Legend · 41-70 Corporate Survivor · 71-100 AI Overlord.
- Keyboard: 1-4 or A-D to answer, Enter or Space to continue.

## Analytics events
`game_start`, `replay`, `answer` (boss, question id, kind, correct → most-missed questions), `game_complete`, `game_over` (score, hp, defeated, missed), `share_click`, `challenge_click`, `challenge_link_open`.
To send them to Vercel, add `@vercel/analytics` and its `<Analytics />` component. `track()` already calls `window.va` if it exists.

## Sharing
Uses `navigator.share` when available, with a clipboard fallback. Challenge links look like `/?challenge=80` and show a banner on the landing page.
