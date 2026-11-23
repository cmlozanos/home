# Family games 2.0.0

Release programme:19 games upgraded in7source repositories, Cole Aventura maintained as reference. Existing Pages URLs retained. Each game has its local offline family kit, linked-school font, public theme, Adult settings, native Home and persistent session points. Educational gate still required at entry/every10minutes as previously agreed. No private backend or unrelated work tools included.

## Gameplay changes with evidence

- Turbo Loop Legends: heavy Titán/Mamut could not clear some turbo gaps; recovery after broken loop could reappear stuck. Adjusted native physics/recovery with86tests,272route/recovery runs and real Mamut/Fábrica completion.
- Mini Karts: false laps from stationary/reverse checkpoints, wall-edge entrapment, mixed-input releases.24checkpoint keyboard race reaches meta and next track.
- Turbo Horizonte: traffic moving away from a stopped player caused collision; mixed-input handling/restart corrected; full keyboard race+next track.
- Super Kart Racing: countdowns surviving restart and lap/checkpoint direction; complete3checkpoint route and restart tested.
- Jump the Car: airborne crossing of finish was missed; first track finished with4jumps and replay, physics comparisons14cars/100tracks remain.
- Banana Party: landing from below and lost short touch jumps; first climb mission reaches next level through production physics.
- World of Joy: accessible nearby objective trails, falling-star radius, recovery preserving time/fuel, sliding collision, compass sign, road-route guidance and empty-tank reverse.8/8fruit exploration and six Racing rounds complete via production simulation inputs, no teleport/win setter.
- Memory/Shapes: invalid indices/placement/multi-touch cancellation; all difficulties solved with actual controls.
- Atelier/Maze: second-finger stroke/gesture cancellation, invalid directions and negative-radius canvas render on a transient tiny resized surface. Draw/export actual PNG; solve generated maze and next/reload.
- Orbit: placement radii for large bodies and habitable-zone reset; original simulation retained.
- Fruit Splash: optional100point target and overlay ordering; real swipes, game over and retry.
- Rubik: offline editor without Bootstrap CDN, storage-denied fallback, actual animated solve turns; camera permission untouched.
- Chef: storage-denied fallback, no-shadow/no-AA render budget, stop rendering behind pause/gate/hidden and corrected directory offline navigation. Native playability route tested separately.

## Shared correctness fixes

Adult modal cannot block periodic learning gate; shadow keyboard never controls cars; fallback cookie is authoritative when quota writes fail; real keyboard/pointer movement renews activity; replay IDs unique per native run. Points reset after>1h inactivity, not merely offline state. Parent multiplication is a usability barrier, not secure age verification. No telemetry/accounts.

## Validation and limits

Detailed per-game notes remain local (V2-VALIDATION/README/RELEASE_NOTES). Root model check preserves math, maze, physics, PNG source/license, cache-isolation and performance budgets. School font measured separately340KB rather than silently increasing game-code500KB budget. Exact local kit hashes tested.

Modern browser and actual Chromium95 desktop engines tested with touch viewports. Engine emulation is NOT physical Android5GPU/RAM/thermal acceptance. No claim every campaign/car-track combination is bug-free. Rubik camera/editor/long solutions may scroll to preserve data; catalogues intentionally scroll. Remaining known limits must accompany release, not be masked with overflow:hidden.
