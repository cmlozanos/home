# Evidence and status — 2.0.0

Coordinated 2.0.0 renovation of 19 games in seven repositories. Final release acceptance below supersedes historical candidate entries. Not a promise of zero defects.

## Repositories and native delivery

- banana-party `2fc4075` native2.0; jump-the-car `5943fae`; fancy-jumping-car `9addb4a`; world-of-joy `f8a6d21`; turbo-loop-legends `60372e9`. Initial Pages builds verified. Final common-shell corrections delivered separately before tag acceptance.
- home11games plus catalogues: native/model tests, shared shell, exact kits and per-game browser paths in evidence/. Native score/pause/Home adapters, not generic DOM score scraping.
- games3games+catalogue: model checks, Bubbles shots/terminal transitions, Mines actual deterministic wins/loss/retry, Chef native test routes and offline worker fix. No backend or private animal quiz touched.

## Real old-engine evidence

Actual Chromium95.0.4630.0 snapshot official Mac ARM917397, hash verified; task-only download386MiB extracted+zip and no global installation. Engine on desktop/SwiftShader != tablet hardware. Runs:
- shell regression5/5 and all11home game entry/parent/home/offline11/11;
- memory4viewports/all difficulties and true board completion;
- Highway/Karts full races and next circuit2/2, not instant fixture wins; common racing controls all3games3×3viewports;
- quiz/fruit/orbit/Rubik12scenarios with real actions;
- Banana first climb reaches next level, Jump track1wins/retry, Fancy full3checkpoint race and World exploration8/8+six Racing rounds;
- Bubbles actual shot win/loss uses explicit response fixture to reach terminal controls (not claimed full natural campaign); Mines4000model boards and4browser viewports win/loss/retry;
- Chef genuine95 entry/menus/adult pause/offline and native count traversal separate instrumentation.

## Pending / known limits

Physical Galaxy Tab4 GPU/RAM/thermal/touch callouts not verified; no blanket "bug-free" or all car/track/campaign acceptance. Camera permission and real image capture in Rubik not tested. Rubik editor/camera/long move sequences may scroll intentionally; catalogue scroll also intentional. Unknown syllable vocabulary remains whole and unannotated; curated dictionary does not constitute a universal syllabifier. Native Canvas/Phaser labels use font adapters where integrated; automatic DOM styling is not proof of all engine art.

## Gate selection

Full root model checks because changes span all games; focused real play and shared regressions reused if same bytes. Historical tests were updated only for agreed navigation/parent-gate changes (old public settings links no longer valid). No weakened physics/cache/licensing/permission guards. Font338740bytes measured separately from500KB native-game budget, image2MB budget retained. Native old checks and modern tablet suite retained and defects diagnosed rather than ignored.

Final native tablet root suite had legacy selector mismatches for settings now protected and shadow ID collisions; tests updated to semantic native controls and adult route, not weakened physics assertions. This uncovered a real Maze negative ellipse radius during transient resize; clamped positive render-cell and tween time, with native maze suite6/6 now passing. Review pending root full final suite outcome below. Audio/caches/gate/data guards retained.

Root tablet run:115passed,5failures were old Orbit selectors captured before agreed test adaptation; focused Orbit suite8/8 then passes current semantic reset and protected save/speed route. Pulse5/5 and art/maze6/6 pass after scoped corrections. No final red check is hidden as success: old failed logs preserved as diagnosis, current focal evidence supersedes those exact invalidated cases. CI splits existing viewport projects into separate jobs with same checks; no removal of tests, matrix keeps modern/WebKit paths and20minute cap avoids previous all-project10minute queue coupling.

Current final candidates: games77ed59b (Pages built), standalone final75bd573/54bd7a9/8390882/4196bab and Turbo1ef90de; Home pending commit. Shell all exact. Native phone driving+memory17/17passed after tracing disabled for driving tests and realistic90s completion budget on exhaustive boards (assertions unchanged). WebKit full104passed16explicit skips; final tablet serial check running to replace earlier concurrent-run artifacts. CI is viewport-matrix, serial within each job to avoid native tracing/teardown stalls; no suites omitted.

Final root tablet **120/120passed** serial on current source, including two full natural keyboard races. Root Safari104passed16explicit skips (offline limitations/CDP/native full-race restricted cases). Phone initial run114passed3skips3failed due exhaustive-board timeout and Chromium trace-context teardown; scoped serial rerun17/17passed preserving assertions. No claim initial failing runs were green. Horizontal serial final run continues, focused11/11V2 horizontal already green.

Horizontal serial final116passed3skips exposed one real issue: Quiz status feedback intercepted letter keys on short landscape. Fixed feedback pointer-events:none (status has no controls), revalidated storage-denied full answer and responsive view. Source pending follow-up acceptance; not counted as passed until focused run completes. No click-force workaround.

Quiz horizontal correction focused2/2passed, no force-click. Full root tablet120passed; Safari104passed16skips; modern entry12+11WebKit and genuine95entry11+regressions5 passed. Public eight standalone/games native entry/Home/Adult checked and home11URLs follow. Gates recorded without zero-bug or physical-device claims.

Final Quiz correction accepted separately:quiz-landscape-accepted2/2green on current source (the earlier same-name log was overwritten by an older concurrent process, so it is retained as historical failure, not acceptance). Final same-runtime public Home11/11passed. Pages accepted742e40e. CI matrix in progress, release tags await its result. Tests do not require hidden clicks or suppress game errors.

## Final delivery reconciliation — 2026-11-23

- Current Home runtime:742e40e; documentation head54f2115. Latest CI45221073670 passed tablet120/120, phone117passed/3skipped, landscape117passed/3skipped. Safari job still installing external browser dependencies when recorded; not counted as a pass. Earlier runtime Safari CI passed, complemented by current local Safari104passed/16explicit skips; final CI acceptance recorded separately below.
- Games59d72de aligns all four gitlinks with the accepted standalone commits. Pages45222274488 succeeded. Local `make check-v2` passes exact bundle checks. Existing runtime browser/playability evidence reused: gitlink-only alignment changes no local engine bytes.
- Publishedv2.0.0 releases: Banana75bd573, Jump54bd7a9, Fancy8390882, World4196bab, Turbo1ef90de, Games59d72de. Home release waits final CI.
- Re-ran `make check check-games check-release-v2`:exit0; public Quiz nativeHome/Adult/error smoke:exit0 after final landscape fix. Compact CI summaries and model output retained under evidence/.
- Removed only task-owned `.v2-task` Chromium95 archive/extraction after all old-engine processes stopped. Sources, tests, licensing, screenshots and necessary evidence retained. Shared browsers/caches and unrelated `.DS_Store` untouched.

## Accepted final CI

[Home CI45221073670](https://github.com/cmlozanos/home/actions/runs/45221073670):SUCCESS, four projects. Tablet120passed; phone117passed/3skipped; landscape117passed/3skipped; Safari104passed/16skipped. Total458passed/22explicit skips. Runtime742e40e; subsequent changes only documentation/evidence. Current-source local Safari repeated104passed/16skipped. Earlier failed runs remain historical diagnostics, not acceptance. No CI failure outstanding for this accepted runtime.

All seven repositories accepted forv2.0.0; release map in DELIVERY.md. Public Pages and native Home/Adult checks recorded. Physical-device and camera limits remain unchanged.
