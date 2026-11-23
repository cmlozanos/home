# Pequeño Atelier

## Reto educativo (ampliación aprobada el 25-09-2026)

Antes de jugar y cada diez minutos se resuelve una suma, resta o trazo de letra del sistema compartido. La partida, las entradas activas, el sonido y los temporizadores de juego se suspenden sin perder el progreso ni quitar una pausa manual. El reto funciona también al abrir la PWA sin conexión; cada entrada requiere uno nuevo. La copia local `learning-gate.js` procede de `../learning-gate/gate.js`.

En V2, Inicio abre el menú del juego; «Todos los juegos» queda dentro de Adultos y conduce a https://cmlozanos.github.io/games/. No necesita servidor Ubuntu. `make check` comprueba la sintaxis del módulo; las pruebas de integración están en `../tests/legacy-gates.spec.cjs`.

Standalone, original, child-friendly painting game. Serve this directory over HTTP(S); no production dependencies, CDN, account or backend required. `index.html` starts the game immediately.

Paint using a finger, pen or mouse; choose colors, three brush widths, eraser, four original stamps and four papers. Undo/redo retains up to 24 snapshots. Completed work is saved locally with storage errors handled. PNG export downloads the composed drawing, including its paper. Clear requires an icon-based confirmation and can be undone. Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z control history. Sound always starts off.

Drawing coordinates are normalized to preserve the composition across orientation changes. Input is limited to one active pointer per stroke; additional contacts are ignored rather than joining unrelated fingers. Paint retention is bounded to 300 actions/12,000 input points and 2,048 points per stroke. The oldest actions are discarded when those limits are reached. Backing canvas pixel ratio is capped at two. No telemetry or remote requests.

The help drawer contains installation instructions and third-party credits. PWA scope and cache deletion are restricted to `little-atelier/`; opening once online makes it available offline. The service worker does not clear other games' caches.

Chrome 95 is the compatibility baseline, alongside modern Chromium and Safari. Canvas 2D and classic JavaScript scripts do not require WebGL. Physical old-tablet performance remains a separate hardware validation.

## Checks

`make check` runs dependency-free core and asset checks. `make serve` starts a local HTTP server on port 4181 (Python standard library). The home repository's `tests/learning-art-maze.spec.cjs` exercises the actual game UI across its browser/device projects. Append `?test=1` for read-only `window.__atelier.read()` snapshots; it cannot set game state.

See `THIRD_PARTY_NOTICES.md` for the exact MIT source adaptation. UI, illustration and stamp artwork are original.


## Family V2 · 2.0.0

Upgrade autorizado para esta carpeta; sin migrar ni borrar guardados. Recursos
`family-v2/{family.css,family.js,playwrite-es.ttf,OFL.txt}` copiados físicamente del
kit canónico, sin enlaces ni dependencia de ejecución de otra carpeta. HTML y
precache usan los mismos parámetros `v=2.0.0`; manifest/caché son 2.0.0.

Inicio abre el menú local y «Seguir jugando» conserva la partida y la URL. El
catálogo externo existe solo en Adultos. Audio, instalación y ayuda conservan
sus botones/listeners nativos, accesibles tras la multiplicación. Tema público
usa los tokens del kit (sistema/día/noche); el lienzo conserva su paleta artística.
Audio apagado cada apertura. Dificultades disponibles sin desbloqueos ni borrar
progreso. Pausas independientes para reto educativo, Adultos y menú/ayuda;
cerrar uno no reanuda otro. Si vence el reto con Adultos abierto, se cierra ese
diálogo para que el reto siga siendo operable, sin liberar la pausa educativa.

### Verificación V2 y límites

- `make check`: core, negativos, sintaxis, manifest y assets/cache con URL exacta;
  las comprobaciones existentes se conservan.
- `make check-browser`: con el preview del repositorio ya disponible en
  `http://127.0.0.1:4177/`; alternativamente `GAME_URL=http://127.0.0.1:4181/ make
  check-browser` contra `make serve` (ajustar puerto al de este juego).
  Reutiliza Playwright de desarrollo, no instala dependencias. `BROWSER=webkit`
  selecciona WebKit; `CHROME95_PATH` selecciona un ejecutable Chromium antiguo.
- Prueba focal real a 1280×800, 1024×600, 360×740 y 740×360: todos los tamaños,
  geometría sin scroll de documento, finalización por entradas UI, puntuación por
  éxito, Inicio sin navegación ni pérdida de datos, ayuda/audio tras Adultos,
  tema y pausa simultánea educativa/Adultos. Chromium comprueba también precache,
  recarga offline, sonido OFF y kit 2.0.0. WebKit omite offline de service workers.
- Los eventos secundarios/cancelaciones se inyectan en handlers DOM; no acreditan
  comportamiento táctil del sistema operativo. No se ha medido tablet física ni
  se confunde el motor Chromium actual con ejecutar Chrome 95 real.
- Sin suites globales, commits, push ni cambios fuera de las cuatro carpetas.

Regresión multitáctil: un contacto secundario todavía apoyado no puede iniciar otro trazo cuando termina el primario. Se conservan pintura/sellos/goma, deshacer/rehacer y exportación PNG real; los autoguardados no conceden puntos.

Resultado observado (23-11-2026): `make check` verde y
`node tools/check-v2-browser.cjs` + `BROWSER=webkit node
 tools/check-v2-browser.cjs` verdes en los cuatro viewports anteriores.
La inspección visual adicional fue a 360×740; no acredita inspección visual de
cada estado. Chromium validó recarga offline y la firma PNG exportada en Atelier.
