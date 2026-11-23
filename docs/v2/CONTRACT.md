# Family games 2.0 — shared contract

## Authorized scope and migration

Coordinated improvement requested23November2026: all currently published family games, same child-first philosophy as Cole Aventura. Preserve gameplay/data/URLs and independent offline packages, improve typography, controls, visual clarity and old-tablet runtime. Not a rewrite of unrelated private business tools. No cost-bearing services, AI APIs, analytics or cloud provisioning. Existing local repositories reused rather than downloading duplicates. Empty legacy `games-menu` is not a published game. Private historical animal-quiz backend stays untouched; its public static implementation is in home.

Inventory: home/{animal-quiz,nitro-highway,pocket-karts,pulse-path,fruit-splash,orbit-lab,memory-garden,shape-studio,little-atelier,maze-meadow,rubik-solver}; games/{little-chef-academy,burbujas,buscaminas}; separate repos banana-party,fancy-jumping-car,jump-the-car,world-of-joy,turbo-loop-legends; Cole Aventura is reference, not rewritten again.19 games plus reference/catalogues. Each must have own acceptance evidence; a global badge alone is not acceptance.

## Required common behavior

- Version2.0.0, source/release notes and public Git delivery. No v2 acceptance while checks fail.
- Linked Playwrite ES original OFL font local, whole words, discreet underlines only for explicitly curated vocabulary; no guessing syllables or splitting glyph shaping. Unknown words stay intact, not falsely annotated. Canvas/engine text needs native integration separately.
- Child controls minimal, ≥44px where feasible; native play tools preserved. Home returns the same game’s native menu, never the shared catalogue. Theme light/dark/system public, settings behind fresh multiplication. Gate is convenience, not authentication.
- Existing learning challenge entry/every10minutes remains: its prior explicit contract not silently removed. It pauses simulation/input/audio and preserves manual pause.
- Audio starts OFF every load. Adult audio setting controls native game audio; no automatic sound/voice. No recording.
- Mode/level/vehicle selection available without achievement locks. Preserve save data. Physics/goals and functional variants not flattened.
- Measured visible viewport via visualViewport/innerHeight, no universal overflow mask. Test orientation, short widths, native adult keyboard and no-scroll play. Catalogue may scroll (navigation list, not gameplay).
- Cheap bounded effects, reduced-motion and manual disable; no fake loader delays and no unrestricted render loops behind hidden/adult/learning overlays.
- Session points only on native achievements, idempotent award IDs. Reset after >1h inactivity (offline playing is activity), manual reset confirmed. Do not invent wins or infer score by scraping arbitrary DOM.
- PWA caches own prefix only; exact local family assets in each precache; cross-repo copies generated at author time, no runtime dependency on home or another checkout. Same origin is not permission to delete another game's cache.

## Technical choice

Reuse existing DOM/Canvas2D/SVG and Phaser/Three only where already necessary; do not add a second rendering framework. Classic shared shell compatible Chrome95, local fonts, DOM shadow boundary to isolate controls; slotted native settings keep original IDs/listeners/styles. Shadow controls stay separate from game hotkeys. Engine/native integration pauses its own simulation and uses actual achievement events. No global requestAnimationFrame/audio monkeypatch.

## Release gates

Per game: source/docs inspected, focused model/native checks, playable browser flow, audio default, parent overlay pause, theme/font/scope, dimensions/rotation and offline. Legacy95 engine evidence is not physical Android GPU evidence. Browser modern+WebKit and old engine selected by scope; minimum sufficient, no unrelated suites. Build/replay/simulation/physical acceptance reported separately.

## Delivery phases and stop conditions

1 Inventory/source sync and shared contract;2 reference shell PoC + independent adapters;3 native refinements;4 per-game checks+cross-game regression;5 publish same bytes, tag/release2 after actual gates. Per failing check ≤3 same-strategy attempts, then change diagnosis; never suppress errors. Keep durable matrix and known gaps. Budget first delivery pass bounded; no blanket claim19games done until every row verified.

## Navigation correction explicitly requested

Child Home returns the SAME game's native menu, preserving legitimate state and pausing simulation. It MUST NOT navigate to catalogue/external origin. `FamilyV2.register` now additionally accepts `home()`; adapters must implement native menu. Existing native home/catalogue anchors must be replaced/intercepted consistently via `data-family-home` and same native callback (not merely adding a second button). Catalogue navigation exists only inside protected Adult settings. Test page URL unchanged and native menu visible after home, no accidental score reset. Mechanically wrong behavior is authorized to change; preserve intent/data, not bugs. True race completion and meaningful world exploration are acceptance criteria.

Mechanics clarification from user: correct broken mechanics, child-reported racing defects and lack of open-world playability are explicitly in scope. Preserve good behavior/data, not flawed physics or empty objectives. Record concrete reproduction, correction and completion proof; never assert "no bugs" from menu smoke. Native Home correction applies to every child-visible exit, not only new shell.
