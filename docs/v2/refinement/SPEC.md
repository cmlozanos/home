# Visual and functional refinement — approved 23 November 2026

User explicitly approved the proposed full pass, including scenario day/night and richer, more realistic and impressive graphics. Scope remains 19 public games in seven repositories. Prior child-first rules, local data, muted audio, native Home and old-tablet budgets remain authoritative. No new paid assets, services, engines or heavy postprocessing. Existing supplied model reviews are advisory, not proof of rendering or device performance.

## Acceptance
Each game receives native visual refinement (not only shell CSS), focused unchanged-mechanics tests and browser render review at tablet and short landscape. Correct demonstrated functional failures with regressions. Day/night must affect native scenes where applicable; manual/reduced-motion suppresses decorative effects, never required gameplay. Preserve offline caches and local assets. Source commit/push per repo, no force or rewriting v2.0.0 tags. Physical Tab4 remains unverified.

## Plan and ownership
- Main: common theme/motion contract, Orbit native render + Home/viewport regressions, integration and delivery.
- Worker racing: home nitro-highway/pocket-karts/pulse-path native graphics.
- Worker activities: home animal-quiz/fruit-splash/memory-garden/shape-studio/little-atelier/maze-meadow/rubik-solver native graphics.
- Worker local-games: games Chef/Bubbles/Mines native graphics and motion integration.
- Worker legacy: banana-party/jump-the-car/fancy-jumping-car/world-of-joy native graphics.
- Worker turbo: turbo-loop-legends native graphics.

Shared API to consume: FamilyV2.motionAllowed() boolean; FamilyV2.theme() => light|dark; window familyv2:appearance detail {theme,motion}. Prefer getters each render / event-driven redraw, no global rendering monkeypatch. Main alone edits shared family-v2 files and propagates exact copies. Workers must not touch shared kits or commit/push; main integrates exact kits/caches then publishes.

## Evidence sources read this follow-up
Scratch creative learning philosophy (scratchfoundation.org), Phaser Scale Manager (docs.phaser.io), GDevelop 2D Platformer MIT template and GDevelopApp/GDevelop-examples, jakesgordon/javascript-racer, taniarascia/memory, web.dev canvas-performance (historical; measure claims). Inspiration/patterns, no borrowed third-party art. Prior GPT6.1Sol and Gemini4Argon text reviews identified Orbit Home simulation, viewport mismatch, native decorative motion integration and theme mismatch; not a complete visual audit.

Budget: bounded per-slice implementation and verification, at most three same-strategy failure attempts before diagnosis change. Record unfinished coverage rather than claim completion.

## User emphasis, same approval
Linked continuous school typography is mandatory in every surface, including engine-rendered labels/HUD/numerals; no alternate display fonts for realism. Turbo Loop Legends (cars, ramps, loops) has explicit highest priority: improve native visual depth and play feel while verifying heavy-car loops, landing and recovery regressions. Decorative richness must never obscure the road or sacrifice old-tablet playability.
