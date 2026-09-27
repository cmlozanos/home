# Shared educational gate

Canonical sources: `gate.js`, `profile.js`, `reading-words.js`, `reading-images/` and the two `READING_*.md` notices. Each game includes local copies of the full bundle; no runtime CDN, external font, audio, tracking or API is required. Compatible with Pointer Events and Canvas 2D in Chrome 95. The HTML document must include a mobile viewport meta tag. Load `learning-profile.js`, `reading-words.js` and then `learning-gate.js` before the game; profiles alone also serve the Games settings UI.

## Contract

Load before the game script. After the game has initialized:

```js
var gate = LearningGate.mount({
  gameId: 'unique-game-slug',
  onLock: function () { /* Pause simulation/audio and cancel active input. */ },
  onUnlock: function () { /* Restore the previous pause state. */ }
});
```

Mount immediately locks. Every navigation and every PWA launch starts locked: there is no persistent unlock token. Successful completion unlocks for exactly 600,000 milliseconds of wall-clock time, including time hidden or in another app. A wrong answer or unfinished tracing does not reset this interval. A one-second timer, visibility, focus and page-show checks relock after expiry; games may additionally call `gate.check()` before a frame or interaction. Moving the wall clock backwards relocks instead of extending a session. Day and night have the same rule.

Returned API: `isLocked()`, `check()`, `destroy()`. `destroy()` is for removing an entire game instance, not for dismissing a challenge. Mount callbacks are synchronous; errors are caught and the overlay remains locked. The application must fail closed if this script cannot load. An integration that renders before mounting, or runs simulation without honoring the pause callback, is incomplete.

`LearningGate.createTimers()` returns a separate game-time scheduler with `set(callback, delay)`, `clear(id)`, `pause()` and `resume()`. Wire pause/resume into the gate callbacks for delayed matches, previews and wins. Pausing preserves the remaining delay using a monotonic clock; callbacks created while paused wait for resume. Repeated pause/resume calls are harmless. This does not replace the gate's own wall-clock timer or modify global timers.

The dialog captures outside input, stops events inside the dialog before they bubble to document/window, contains focus, and has no dismiss control. The game must not install its own earlier window-capture handlers that bypass this contract. Notifications `learninggate:lock` and `learninggate:unlock` contain only `detail.gameId`.

## Challenges

Without a stored profile, equal random selection of addition, subtraction and guided letter tracing. These three minima always remain enabled. When the profile adds reading, selection is equally random among all four types; a single successful challenge unlocks, never two consecutive challenges. Both operands and the result are whole numbers 0–9; subtraction never produces a negative result. Mathematics accepts keypad touches or number keys. Mistakes only show a retry icon.

Reading displays one lowercase word of at most five letters and three ARASAAC images, with exactly one correct answer. The 100-word bank preserves Spanish accents. Answer position is shuffled; a wrong answer generates a different word and three images disjoint from the previous three. Overlapping depicted concepts are excluded using the bank's groups. A mistake does not unlock, reset the timer or penalize the game. Only three PNGs are decoded by the UI at a time. Buttons remain disabled until all three load; a failed image offers an explicit retry of the same question and never grants access. Stale image events cannot affect a replacement round. Keyboard users can Tab to a choice and press Enter/Space, or press 1–3. Attribution is visible and the full [source/licence record](READING_ASSETS.md) is cached with the images.

## Profiles and privacy

The user approved this addition, ARASAAC CC BY-NC-SA and a one-year profile cookie on 27-09-2026. Games exposes a collapsed, adult-facing «Perfiles y retos» panel. Aprendiz presets minima and Avanzado presets minima plus reading; the reading checkbox remains independently configurable. Save is explicit. For the Lenovo tablet, select Avanzado and save once in that browser. No browser fingerprint or guessed model automatically changes a child's challenges.

`LearningProfile.read()` returns a validated generic profile or null; `save({level:'learner'|'advanced',reading:boolean})` and `clear()` return verified success booleans. Cookie `family-learning-profile` contains only `{version:1,level,reading,expiresAt}`, is host-only with `Path=/`, `SameSite=Lax`, `Max-Age=31536000` and `Secure` on HTTPS. All games on the same GitHub Pages origin share it; no child names, IDs, answers or progress are stored in it or transmitted to a backend. As a first-party cookie it accompanies same-origin HTTP requests, including static Pages requests. No unlock token is persisted. Missing, expired, invalid or inaccessible cookies use only the three minima. Blocked storage displays a settings error rather than claiming a save succeeded. The gate reads the profile afresh at each block, so a settings change applies to the next challenge, without dismissing an active challenge.

All 100 PNGs (935825 bytes) are precached per installed game for offline use. Initial offline availability requires one complete online installation; service-worker failures cannot bypass the gate. The word/image bank and profile script are local, so a configured browser does not need Google, ARASAAC or an application server while playing.

There are 54 original centerline models: Spanish A–Z and Ñ, uppercase and lowercase. A yellow numbered start point and arrow guide each ordered stroke. Geometry validates a continuous route along the current stroke, including swept samples between pointer events, progress and endpoint. Dots are intentional tap strokes. Shortcuts across curves, starting at the wrong place, off-path scribbles, and cancelled touches do not complete the stroke. A completed stroke is preserved after an error in the next stroke. Retry resets only the letter. Distinct touches cannot contribute to one active stroke.

The models teach one simple printed-letter variant, not handwriting assessment or clinical motor-skill evaluation. Tolerance is deliberately generous for ages 4–6. Assistive descriptions supplement icons; tracing itself requires a pointing input and is not keyboard-operable. Device clock changes cannot be authenticated without a server. This gate is an educational activity, not a tamper-proof parental-control/security boundary.

## Verification and integration selectors

Run `make check`: syntax, 10,000 seeded arithmetic cases, every stroke of all 54 models, tracing rejection/cancellation, 10,000 reading rounds, all words/answer positions, full replacement, cookie schema/expiry and all 100 PNG hashes. Run `make check-browser` for the original pointer/keypad/interval contract. From Home, `make test-reading` runs actual image loading, error/retry, focus, callback recovery, profile fallback and recurrence tests; `make test-reading-games` verifies the integrated Home games including offline reading. Set `CHROME95_PATH` to an installed Chromium 95 executable for the legacy engine. Download/contact-sheet targets are documented in [READING_ASSETS.md](READING_ASSETS.md); a normal check never downloads.

Browser selectors: `#learning-gate`, `#gate-prompt`, `[data-gate-key="0"]` through `9`, `#gate-trace[data-letter]`, `#gate-retry`, `#gate-feedback`, `#gate-word`, `[data-reading-id]`, `#gate-reading-retry`. `LearningGate.Core` exports the models, geometric validators and pure random challenge generators; it offers no solve/unlock API. Browser tests complete the real visible UI and verify time changes, focus containment, callback pause/restore and offline startup. None of these checks claims physical Android hardware performance.
