# Activities native refinement — bounded pass + verified fixes

Approved scope: seven native activities only, shared checkout; no commit/push. No shared family kits, core engines, persistence schemas, service workers, dependencies or cache versions edited by this worker. Other workers' concurrent changes preserved. Main preview :4177 left running. Own temporary :4187 preview stopped after validation.

## Per-game source and results
Paths below are relative to repository root.

| Game | Native changes / owned files | Empirical checks |
|---|---|---|
| animal-quiz | `game.js`, `style.css`: appearance bridge, unified computed linked font, lit field-guide animal mount, tactile answer/key/profile surfaces, distinct correct/wrong states; original 20 animal SVGs unchanged. `Makefile`, `tools/check-refinement-browser.cjs`: reproducible seven-activity render check. | make check; full accented-word/profile and wrong-answer regressions at tablet/short landscape; light/dark captures both sizes. |
| fruit-splash | `game.js`, `style.css`: cached native orchard horizon/fence/sun/moon/stars, lit enamel controls; theme redraw and disabled floating/speck/ring/drop decoration; slice physics and necessary fruit halves preserved. | make check; actual swipe/scoring/pause/resume/retry and independent fingers/modes at both sizes; exact static menu canvas when motion off; light/dark captures. |
| memory-garden | `game.js`, `style.css`, `index.html`: botanical linen/embossed backs, paper faces/matched frame, native day/night, linked font and normal-word authored label; Help above shell toolbar. No animal art/deck rewrite. | make check; existing native browser harness all 3 difficulties, four viewports, completion/points/pause/settings/Home/offline; final light/dark and separate face-up captures. |
| shape-studio | `game.js`, `style.css`, `index.html`: joiner tray/wood grain/recessed silhouettes, SVG material gradients without changed contours, same gold for all level-3 pieces, selection lighting; linked normal-word scene labels; Help stacking fix. | make check; existing native browser harness all levels/four viewports, completion/locking/points/Home/settings/offline; light/dark captures. |
| little-atelier | `game.js`, `style.css`, `index.html`: desk grain, paper frame/tape/cast shadows, inset palette wells and tool surfaces; room theme does not recolor drawing paper/export; linked font and normal-word label; Help stacking fix. | make check; existing native browser harness four viewports with real painting, history/save, tools and pauses/Home/offline; day/night captures plus real stroke detail. |
| maze-meadow | `game.js`, `style.css`, `index.html`: native gradient ground, layered hedge/contact shadows and sparse wall leaf tips, distinct night palette, bounded motion-off position snap; garden-bed surfaces and linked label; Help stacking fix. | make check incl. 300 deterministic mazes, reciprocity/connectivity/blocked moves; native browser completion all sizes/four viewports plus pauses/Home/offline; light/dark captures. |
| rubik-solver | `app.js`, `styles.css`: satin ABS highlights on existing cubies, tabletop lighting, explicit readable light validation colors, normal-word labels; all 3 Canvas font sites use FamilyV2.fontFamily and fontReady repaint. Six sticker identities and explanatory layer-turn animation preserved. | make check; real R-scramble solve 8 animated steps/points; denied-storage startup and solving; day/night both sizes; computed DOM and actual Canvas font assertion. |

## Evidence

- `native-checks.txt`: all seven `make check`, exit 0.
- `acceptance.txt`: 14/14 final native render cases on main preview :4177, 1280×800 and 740×360, two themes each. Each awaits `FamilyV2.fontReady` then 400 ms transition settling. Checks computed linked font on visible native labels/controls/HUD, API precedence, event/no-API fallback, decorative motion suppression, geometry and unchanged native saves. API precedence/no-API tests temporarily stub the public object: contract evidence, not proof of missing-shell packaging. Rubik Canvas prompt font asserted directly. No page errors.
- `quiz-fruit-gameplay.txt`: 8/8 actual focused Playwright interactions, tablet and short landscape.
- `{memory-garden,shape-studio,little-atelier,maze-meadow}-gameplay-fixed.txt`: four viewports each (1280×800, 1024×600, 360×740, 740×360), all passing after native Help overlay fix. Commands: `GAME_URL=http://127.0.0.1:4187/<game>/ node <game>/tools/check-v2-browser.cjs` run from matching game directory (script path relative there is `tools/check-v2-browser.cjs`).
- `rubik-gameplay.txt`: solve and denied-storage checks passed.
- `contact-1280.png`, `contact-740.png`: final light/dark review sheets; corresponding `<game>-<width>-<theme>.png` full captures. Separate memory face-up and Atelier real-stroke detail PNGs. Visually inspected contact sheets, full-size Memory animals, Atelier real stroke and native dark Shape/Fruit captures.

## Observed failures and fixes

1. First static-motion assertion sampled before appearance redraw settled; awaited redraw before comparison, then passed. No disabled assertion.
2. Initial native harnesses caught family toolbar intercepting the native Help close button (Memory/Shapes portrait; Atelier/Maze short landscape). Fixed only native Help overlay z-index; four-viewports reruns green. Initial failed logs retained as `*-gameplay.txt` beside fixed logs.
3. First Memory light capture caught the card flip edge-on. Final captures wait 400 ms and show stable identical card geometry; no masking/layout change. Separate face-up captures verify clear SVG animals.
4. Rubik pale success message was low contrast in initial review. Explicit native validation foreground/background colors corrected and final captures reviewed.

## Limits / handoff

- Chromium desktop evidence only for this slice. Physical old Android/Tab4 performance, real camera permissions, WebKit/Chrome95 visual acceptance not revalidated here; do not equate emulation/model checks with hardware acceptance.
- Rubik advanced editor/camera/long solutions may scroll by existing design; no horizontal overflow verified, no blanket no-scroll claim for those panels.
- Existing muted-audio assertions retained in native harnesses; no new audio activation.
- Native decorative motion is off via public API/event with DOM/media fallback before API. Required explanatory Rubik layer turns remain visible; disabling decoration never changes solver state.
- Main owns shared-kit propagation and service-worker/cache version integration. Concurrent shared/cache diffs in checkout are not worker-owned.
- No new library, font file, paid asset, heavy filter, permanent state key or control. Original linked font and discreet whole-word/syllable reading pipeline untouched.
- Self-check: scope/native changes, readable semantics, executable checks, recorded failures and concise handoff verified. More ambitious photorealism is not claimed: original recognizable child-first vector/Canvas language retained with material/depth refinements.
