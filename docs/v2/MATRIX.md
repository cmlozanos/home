# V2 delivery matrix

Status in progress; this file records evidence, not a promise that every row is accepted.

| Source | Games | Responsible scope | Initial state |
|---|---|---|---|
| home | memory-garden,shape-studio,little-atelier,maze-meadow | puzzles/creative | read+implementation |
| home | nitro-highway,pocket-karts,pulse-path | racing/rhythm | read+implementation |
| home | animal-quiz,fruit-splash,orbit-lab,rubik-solver | exploration/quiz | read+implementation |
| games | little-chef-academy,burbujas,buscaminas | local integration | read+implementation |
| banana-party,jump-the-car | standalone | classic2D | read+implementation |
| fancy-jumping-car,world-of-joy | standalone | Three3D | read+implementation |
| turbo-loop-legends | standalone | Phaser/Planck | read+implementation |

Cole Aventura remains current reference. No private backend tools included. Existing .DS_Store changes in legacy repos preserved, not part of delivery.

## Native issues reproduced/corrected so far

- Karts: no-motion/backward checkpoint lap counting and wall-edge recovery; full24checkpoint keyboard race completed.
- Highway: stationary-player collision with traffic moving away; mixed input release and native menu.
- Orbit: large-body orbit placement radius and stale habitable zone between scenarios.
- Rubik: denied storage broke editor; remote Bootstrap removed; native animated moves completion checked.
- Chef: unguarded saveState crashed when storage denied; hidden/frozen render work and default shadow/AA budget reduced; real offline navigation failed at directory URL and worker now falls back explicitly to cached index.
- Bubbles: protected audio toggle previously did not create a resumable engine after adult freeze; lazy explicit activation corrected; width of native toolbar corrected after shared shell.

These are concrete fixes, not a statement that all bugs are gone. See per-game validation notes for actual route coverage.

## Shared-shell adversarial review

Read-only audit reproduced five bugs after first adapter pass: Adult modal deadlocked the10minute gate; theme arrows leaked into driving; quota-failed localStorage fallback reloaded stale points; keyboard/continuous pointer activity expired session; replay reused achievement IDs. Corrected canonical shell coordination, shadow key boundary, authoritative fallback, throttled real activity and per-race run identifiers. New regressions pass10/10 modern+WebKit and5/5 Chromium95. The source remains version2.0.0 while cache uses shell2 revision to prevent stale mixing before release acceptance. This is why a visual pass alone was not sufficient.

## Final standalone commits

banana-party75bd573; jump-the-car54bd7a9; fancy-jumping-car8390882; world-of-joy4196bab include final shared-shell audit corrections. Native complete-play evidence remains valid for unchanged game sources, complemented by final shell regression. Tags pending until Pages and programme gates finish. Turbo final follow-up pending.

Chef validation now covers40rounds/five modes with native keyboard-driven simulation. It exposed unreachable rear spawn, stale final HUD, summary timer surviving Home and incomplete retry-state reset; these are corrected with regression. This was not just a rendering update.

Turbo final shared-shell commit1ef90de (native60372e9 unchanged);16/16V2 browser desktop/WebKit/95 plus offline1/1 genuine95. Final bytes match canonical kit. Private identity/DS excluded. Physical device still pending.
