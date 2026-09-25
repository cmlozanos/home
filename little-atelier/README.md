# Pequeño Atelier

## Reto educativo (ampliación aprobada el 25-09-2026)

Antes de jugar y cada diez minutos se resuelve una suma, resta o trazo de letra del sistema compartido. La partida, las entradas activas, el sonido y los temporizadores de juego se suspenden sin perder el progreso ni quitar una pausa manual. El reto funciona también al abrir la PWA sin conexión; cada entrada requiere uno nuevo. La copia local `learning-gate.js` procede de `../learning-gate/gate.js`.

La salida «Todos los juegos» conduce a https://cmlozanos.github.io/games/. No necesita servidor Ubuntu. `make check` comprueba la sintaxis del módulo; las pruebas de integración están en `../tests/legacy-gates.spec.cjs`.

Standalone, original, child-friendly painting game. Serve this directory over HTTP(S); no production dependencies, CDN, account or backend required. `index.html` starts the game immediately.

Paint using a finger, pen or mouse; choose colors, three brush widths, eraser, four original stamps and four papers. Undo/redo retains up to 24 snapshots. Completed work is saved locally with storage errors handled. PNG export downloads the composed drawing, including its paper. Clear requires an icon-based confirmation and can be undone. Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z control history. Sound always starts off.

Drawing coordinates are normalized to preserve the composition across orientation changes. Input is limited to one active pointer per stroke; additional contacts are ignored rather than joining unrelated fingers. Paint retention is bounded to 300 actions/12,000 input points and 2,048 points per stroke. The oldest actions are discarded when those limits are reached. Backing canvas pixel ratio is capped at two. No telemetry or remote requests.

The help drawer contains installation instructions and third-party credits. PWA scope and cache deletion are restricted to `little-atelier/`; opening once online makes it available offline. The service worker does not clear other games' caches.

Chrome 95 is the compatibility baseline, alongside modern Chromium and Safari. Canvas 2D and classic JavaScript scripts do not require WebGL. Physical old-tablet performance remains a separate hardware validation.

## Checks

`make check` runs dependency-free core and asset checks. `make serve` starts a local HTTP server on port 4181 (Python standard library). The home repository's `tests/learning-art-maze.spec.cjs` exercises the actual game UI across its browser/device projects. Append `?test=1` for read-only `window.__atelier.read()` snapshots; it cannot set game state.

See `THIRD_PARTY_NOTICES.md` for the exact MIT source adaptation. UI, illustration and stamp artwork are original.
