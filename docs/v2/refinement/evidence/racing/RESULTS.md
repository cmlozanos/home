# Native racing refinement — 2026-11-23

Scope: native game.js in Nitro Highway, Pocket Karts, Pulse Path; native README;
Nitro Makefile and focused browser test. Shared checkout, no commit/push.
Shared kit, cores, caches, HTML/version URLs untouched by this worker.

- Nitro: layered horizon/city, perspective planted verges/guardrail/reflectors,
  metallic body facets, static/timed boost flames, striped ramps and flight ground shadow.
- Karts: shaded terrain, planted props/islands, clubhouse, edge seams/rubber line,
  body highlights and outline. Motion-off removes visual ghosts/skids/pulsing guidance.
- Pulse: three cliff layers, sun/moon, structural deck panels, faceted hazards,
  high-contrast landing tops and outlined avatar. Motion-off removes particles/parallax.
- All Canvas labels consume FamilyV2.fontFamily and fontReady; no display/mono fonts.
  Theme/motion getters are authoritative; appearance events redraw without changing state.

## Checks actually executed

- `make -C nitro-highway check`, `make -C pocket-karts check`,
  `make -C pulse-path check`: PASS. 9 car/course combinations each; six Pulse
  routes/difficulties at 30/60/120Hz; collision/checkpoint/gate guards retained.
- `GAMES_BASE_URL=http://127.0.0.1:4189/ node nitro-highway/tools/check-family-browser.cjs`:
  PASS all three, touch bounds 320×568/740×360/1280×800, mixed inputs, native Home,
  pause/settings, theme, audio initially OFF.
- `GAMES_BASE_URL=http://127.0.0.1:4189/ npx playwright test tests/new-racing.spec.cjs tests/pulse-path.spec.cjs --project=tablet --workers=1 --output=docs/v2/refinement/evidence/racing/playwright-results`:
  13 PASS, including Pulse actual assisted finish, retry/saves, educational recurrence,
  racing inputs and offline/cache isolation. No core changes.
- `GAMES_BASE_URL=http://127.0.0.1:4189/ node nitro-highway/tools/check-native-appearance.cjs`:
  PASS all three; new native pixel differences for day/night, getter vs DOM priority,
  motion-off still advances physics, frozen pause, ghost removal, font contract,
  fallback without getters/reduced motion, no page errors and 1× canvas budget.
- Scoped `git diff --check`: PASS.

## Visual evidence and limits

Twelve screenshots: first circuit in each game, both themes, 1280×800 and 740×360.
Screenshots hide only the pause modal via Playwright screenshot styling to reveal
unchanged frozen native scenes. Actual DOM toolbar is retained. Reviewed representative
Nitro day/night, Karts tablet/short landscape and Pulse tablet/short landscape images.
Other authored courses are model-tested, not all individually visually reviewed.
No physical Android/Tab4/Chrome95 performance acceptance, FPS benchmark, new WebKit
run or deployment claimed. Native checks are not GPU/device evidence.

Initial preview attempt met a shared-port race (EADDRINUSE/refused); used an isolated
4189 preview without stopping another worker. An overly strict text-draw assertion
was corrected: no Pulse text is on-screen near the first obstacle. Actual emitted
fonts plus source contract are checked instead. No mechanics were weakened.
