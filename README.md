# 5 Dead

An independent card game inspired by 5 Alive, built as an offline-ready PWA with an original dark tabletop and AI-generated skull card art. Supports 2–24 players, bots, local pass-and-play, and server-authoritative online rooms.

## Run

Requires Node.js 22.13+.

```sh
npm install
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_mixed_namorita.sql
npm start -- --port 4173
```

Open http://127.0.0.1:4173. Use `npm run dev` for frontend development. Database-backed development needs the local migration above. Sites provisions D1 and applies migrations when published. For another hosting provider, deploy the generated Worker and static assets with a D1 binding named `DB` and apply the migration. Room storage is persistent; records expire from play after 24 hours without a successful room update. The current build does not automatically remove expired database records.

## Play

- **Bots:** one human, 1–23 bots. Offline after the first complete load.
- **Pass & play:** 2–24 humans on one device, with a privacy screen between turns. Offline after the first complete load. Local hands and save data live in browser storage; they are private by convention, not protected from the device owner.
- **Online:** host creates a room, shares a link or six-character code, and starts when everyone arrives. Rooms synchronize every 1.2 seconds. Only the host starts or rematches. Private per-seat bearer credentials are retained on the device for reconnection; other players receive only hand counts. Anyone with the room code may join before play starts. The server validates every move and uses revision-based atomic database updates to reject conflicting moves. Online rooms need connectivity. There is no background bot takeover for disconnected online players; the table waits for them to reconnect.
- **Install:** browser install button on supported devices, Safari Share → Add to Home Screen on iOS. Wait for “Offline ready” before disconnecting. Offline play requires a browser with service-worker support. HTTPS is required outside localhost. Hardware/browser testing is limited to the available browser; native iOS and Android installation has not been device-tested.

## Rules and fairness

Official rules reference: [Hasbro 5 Alive F4205](https://instructions.hasbro.com/en-us/instruction/5-alive-card-game-kids-game-fun-family-game-for-ages-8-and-up-card-game-for-2-to-6-players).

The total begins at 0. Deal ten cards and give each player five lives. Number cards add to the total. Exactly 21 is safe. A player with no safe move loses one life, retains their hand, and resets the total. Finishing a hand immediately costs every opponent one life before applying the final wild card effect. Skip, reverse, pass, draw one/two for every opponent, set-to-0/10/21, hand redistribution, and bomb effects are implemented. Numeric zero alone blocks a bomb. Teams and sudden death are available.

Starting seats are chosen randomly rather than by age. A new hand begins clockwise left of the previous finisher. A bomb defender emptying their hand also ends the hand. When no draw pile or recyclable discard remains, only available cards can be drawn. These resolve digital edge cases explicitly.

### Deck

The implementation uses 77 playable cards: eight each of 0–4, four 5s, two 6s, one 7; two each Draw 1/Draw 2; four Pass; six Reverse; four Skip; five =21; two =10; three =0; one Re-deal; one Bomb. Life and reference cards are tracked separately. **The official leaflet verifies card effects but does not itemize the deck; exact physical-edition counts remain unverified. This is not a claim of a verified 1:1 reproduction of every retail edition.** Counts are centralized in `lib/game.ts` so a confirmed edition can be matched without changing the rules engine.

### More than six

Our disclosed party house rule adds whole copies of the playable deck: one for 2–6 players, two for 7–12, three for 13–18, four for 19–24. Every seat keeps ten cards, five lives, and the 21 cap. Original card proportions remain unchanged. This preserves equal distribution probability and available draw capacity; it does not guarantee equally strong hands or prove identical game balance at every table size.

Randomness uses `crypto.getRandomValues`, rejection sampling, and Fisher–Yates. No `Math.random` is used. Bots receive only their own hand and the public total. Server-generated online shuffles cannot be selected by clients; there is no client-verifiable multiplayer shuffle protocol.

## Checks

```sh
npm run check
npm test
node tests/rooms.mjs
```

The room integration test requires the local server and migrated database. It creates disposable test rooms. Engine tests include complete simulated games across sizes and variants, conservation of cards, team lives, draw effects, bombs, two-player special effects, privacy views, and illegal moves.

## Art

`public/assets/card-back.webp` was generated with the built-in OpenAI image generation tool. The final prompt is in `public/assets/artwork-prompt.txt`. All number and action labels are deterministic HTML for legibility and correctness. Barlow Condensed and DM Sans are self-hosted Google Fonts. This project is independent and is not affiliated with or endorsed by Hasbro.

## Animated arena (v2)

The table now uses an original AI midnight arena and six character portraits, glossy color cards, an overlapping sorted hand, and event-driven action sequences. Number cards display from 7 down to 0; wild cards follow in a fixed action order. This changes presentation only, never the deal or bot knowledge.

Public engine receipts identify played cards, draw counts and life losses. They exclude private draws and are retained for the last twelve actions so online clients can sequence effects. Deal, throw, draw, reverse, skip, reset, bomb, life-loss, hand-clear and victory cues have distinct synthesized audio. Sound starts after a user gesture, can be muted persistently, and stays quiet while the page is hidden. Reduced-motion mode keeps short text/color feedback and removes spatial effects.

Installed PWAs allow portrait setup and landscape play. On touch devices, starting an offline game attempts fullscreen and native landscape orientation. Browser support varies, particularly on iOS; a rotated, interactive landscape table provides the fallback. Help dialogs rotate to match. The desktop and phone viewport layouts were browser-checked, including portrait fallback; physical iOS/Android orientation locking still needs device verification. A roster shows all players when more than five opponents cannot fit around the arena.

New image files: `public/assets/arena.webp` and `public/assets/avatars.webp`. Both use built-in OpenAI image generation; final prompts are in `public/assets/arena-prompts.json`. The interface refers to the spatial layout and dramatic action feedback of [UNO Mobile](https://www.letsplayuno.com/); the environment, characters and game identity are original.

### Drag, drop and throw

Toss a hand card upward and release to play it: short, broad gestures work before the card reaches the felt, at any speed. The card flies into the pile automatically. Double-click or double-tap also plays; one tap selects for the Play button. Drag back into the hand to cancel. Unsafe cards, interruptions and rejected online moves return the card to its hand. Small twitches do not commit a move. Long hands support almost-horizontal touch swipes for browsing; diagonal lifts throw. The same pointer controls account for the CSS-rotated phone layout; keyboard users retain tap/Play controls.

### Phone ergonomics
Phone layouts use 48px icon targets, 52–56px primary actions and inputs, and 16px form text. Landscape hands keep cards 80–98px wide with at least 52px exposed between adjacent cards; longer hands scroll. Container queries share the same layout between native landscape and the rotated portrait fallback, including safe areas. Short landscape viewports condense far opponents without shrinking the controls. Browser QA covered 320px, 384px and 412px portrait widths, rotated gameplay, 915×412 landscape, and 915×320 with browser-toolbar space deducted. Physical S24 Ultra testing remains unverified.

### Card faces and rare cards
Card artwork uses a single size-aware vector face system in `components/playing-card.tsx` and `app/cards.css`. The printed set’s color cues inform the palette; Bomb has a charcoal/red face, gold border and fuse blast, while Reshuffle has a magenta card-stack/circular-arrow mark. Special-card labels occupy their own footer and set-value typography is sized separately from single digits. The How to Play guide renders the same component as the hand and discard pile. Bomb and Reshuffle each remain one per 77-card base deck, checked across every supported player count. No deal bias or guaranteed rare-card placement is introduced.
