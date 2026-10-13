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
| `lib/bosses.mjs` | Static boss/question/roast/explanation data |
| `lib/game.mjs` | Pure game reducer: HP, score, streak, Chai Break, end states, titles |
| `lib/game.test.mjs` | Unit tests for the rules |
| `lib/analytics.js` | `track()` → Vercel Analytics / gtag / Plausible if present, plus a localStorage log (`obf_events`) |
| `lib/sound.js` | 8-bit Web Audio SFX with mute (persisted) |
| `components/` | `Game` (state machine), `Landing`, `Battle`, `Results` (share card + challenge) |

## Rules (MVP)
- 100 HP, 5 bosses, 1 question each, 4 shuffled options, no retries.
- Correct answer: +20 score, boss KO. Wrong answer: −20 HP, roast, and the boss stays undefeated (the game moves on).
- 3 correct in a row: Chai Break, +10 HP (max 100). A wrong answer resets the streak.
- Game over at 0 HP. Victory after the last boss.
- Titles: 0–40 Manual Labour Legend · 41–70 Corporate Survivor · 71–100 AI Overlord.

## Analytics events
`game_start`, `replay`, `answer` (boss, correct → most-missed questions), `game_complete`, `game_over` (score, hp, defeated, missed), `share_click`, `challenge_click`, `challenge_link_open`.
To send them to Vercel, add `@vercel/analytics` and its `<Analytics />` component. `track()` already calls `window.va` if it exists.

## Sharing
Uses `navigator.share` when available, with a clipboard fallback. Challenge links look like `/?challenge=80` and show a banner on the landing page.
