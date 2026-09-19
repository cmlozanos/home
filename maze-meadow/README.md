# El jardín de los caminos

Standalone, original garden maze game for young children. Serve this directory over HTTP(S); no production dependencies, CDN, account or backend required.

Lead the rabbit to the carrot using adjacent-cell taps, swipes, arrow/WASD keys or the large directional pad. Hedges block movement. Choose 4×4, 6×6 or 8×8 mazes. The seed remains stable when restarting a maze; “another maze” and the win screen's next button advance it. Stars are optional. The lightbulb toggles a visible hint route. Completed count, level size and maze number persist locally, with storage failures handled. Sound starts off.

The generator adapts the MIT-licensed stack traversal and reciprocal wall removal from Kees Meijer's maze-generator. The small native core uses deterministic seeded randomness and a separate breadth-first solver. Grid inputs are bounded to 16×16, while the UI offers only 4/6/8. Full source provenance appears in `THIRD_PARTY_NOTICES.md`. All garden/rabbit/carrot illustrations and UI are original Canvas/SVG artwork.

The help drawer contains installation instructions and credits. PWA scope/cache cleanup are isolated to `maze-meadow/`. The app runs offline after its first successful online load. Chrome 95 is the compatibility baseline alongside modern Chromium and Safari; Canvas 2D does not require WebGL. Physical tablet performance is not established by browser emulation.

## Checks

`make check` runs generator connectivity, determinism, reciprocal walls, blocked moves, solver and PWA asset checks. `make serve` starts a local HTTP server on port 4182 (Python standard library). The home repository's `tests/learning-art-maze.spec.cjs` solves real UI paths and checks painting/maze controls. `?test=1` exposes `window.__meadow.read()` read-only state/geometry snapshots; there is no state-setting or completion shortcut.
