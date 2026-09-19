# Shared educational gate

Canonical source: `gate.js`. Copy this classic script into each game's offline bundle; do not serve it from a CDN. No dependencies, fonts, network requests, audio, or tracking. Compatible with Pointer Events and Canvas 2D in Chrome 95. The HTML document must include a mobile viewport meta tag.

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

Equal random selection of addition, subtraction and guided letter tracing. Both operands and the result are whole numbers 0–9; subtraction never produces a negative result. Mathematics accepts keypad touches or number keys. Mistakes only show a retry icon.

There are 54 original centerline models: Spanish A–Z and Ñ, uppercase and lowercase. A yellow numbered start point and arrow guide each ordered stroke. Geometry validates a continuous route along the current stroke, including swept samples between pointer events, progress and endpoint. Dots are intentional tap strokes. Shortcuts across curves, starting at the wrong place, off-path scribbles, and cancelled touches do not complete the stroke. A completed stroke is preserved after an error in the next stroke. Retry resets only the letter. Distinct touches cannot contribute to one active stroke.

The models teach one simple printed-letter variant, not handwriting assessment or clinical motor-skill evaluation. Tolerance is deliberately generous for ages 4–6. Assistive descriptions supplement icons; tracing itself requires a pointing input and is not keyboard-operable. Device clock changes cannot be authenticated without a server. This gate is an educational activity, not a tamper-proof parental-control/security boundary.

## Verification and integration selectors

Run `make check`: syntax, 10,000 seeded arithmetic cases, every stroke of all 54 models, rejection of shortcuts/off-path movement, cancellation and order. Run `make check-browser` with the repository's Playwright dependencies installed for real pointer, keypad, interval, focus containment and callback-failure checks. Set `CHROME95_PATH` to an installed Chromium 95 executable to repeat on the legacy engine.

Browser selectors: `#learning-gate`, `#gate-prompt`, `[data-gate-key="0"]` through `9`, `#gate-trace[data-letter]`, `#gate-retry`, `#gate-feedback`. `LearningGate.Core` exports the actual models and pure validator for deterministic geometric tests; it offers no solve/unlock API. Full browser tests must complete the real UI and test time changes, focus containment, callback pause/restore, and offline startup.
