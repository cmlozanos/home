# El jardín de los caminos

## Reto educativo (ampliación aprobada el 25-09-2026)

Antes de jugar y cada diez minutos se resuelve una suma, resta o trazo de letra del sistema compartido. La partida, las entradas activas, el sonido y los temporizadores de juego se suspenden sin perder el progreso ni quitar una pausa manual. El reto funciona también al abrir la PWA sin conexión; cada entrada requiere uno nuevo. La copia local `learning-gate.js` procede de `../learning-gate/gate.js`.

En V2, Inicio abre el menú del juego; «Todos los juegos» queda dentro de Adultos y conduce a https://cmlozanos.github.io/games/. No necesita servidor Ubuntu. `make check` comprueba la sintaxis del módulo; las pruebas de integración están en `../tests/legacy-gates.spec.cjs`.

Standalone, original garden maze game for young children. Serve this directory over HTTP(S); no production dependencies, CDN, account or backend required.

Lead the rabbit to the carrot using adjacent-cell taps, swipes, arrow/WASD keys or the large directional pad. Hedges block movement. Choose 4×4, 6×6 or 8×8 mazes. The seed remains stable when restarting a maze; “another maze” and the win screen's next button advance it. Stars are optional. The lightbulb toggles a visible hint route. Completed count, level size and maze number persist locally, with storage failures handled. Sound starts off.

The generator adapts the MIT-licensed stack traversal and reciprocal wall removal from Kees Meijer's maze-generator. The small native core uses deterministic seeded randomness and a separate breadth-first solver. Grid inputs are bounded to 16×16, while the UI offers only 4/6/8. Full source provenance appears in `THIRD_PARTY_NOTICES.md`. All garden/rabbit/carrot illustrations and UI are original Canvas/SVG artwork.

The help drawer contains installation instructions and credits. PWA scope/cache cleanup are isolated to `maze-meadow/`. The app runs offline after its first successful online load. Chrome 95 is the compatibility baseline alongside modern Chromium and Safari; Canvas 2D does not require WebGL. Physical tablet performance is not established by browser emulation.

## Checks

`make check` runs generator connectivity, determinism, reciprocal walls, blocked moves, solver and PWA asset checks. `make serve` starts a local HTTP server on port 4182 (Python standard library). The home repository's `tests/learning-art-maze.spec.cjs` solves real UI paths and checks painting/maze controls. `?test=1` exposes `window.__meadow.read()` read-only state/geometry snapshots; there is no state-setting or completion shortcut.


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
  `http://127.0.0.1:4177/`; alternativamente `GAME_URL=http://127.0.0.1:4182/ make
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

Regresiones: dirección inválida no mueve ni lanza excepción; pared bloquea; reiniciar descarta el gesto aún capturado y mantiene la semilla; reiniciar tras alcanzar meta cancela el modal pendiente; otro laberinto avanza. Un punto por meta y no por estrella.

Resultado observado (23-11-2026): `make check` verde y
`node tools/check-v2-browser.cjs` + `BROWSER=webkit node
 tools/check-v2-browser.cjs` verdes en los cuatro viewports anteriores.
La inspección visual adicional fue a 360×740; no acredita inspección visual de
cada estado. Chromium validó recarga offline y la firma PNG exportada en Atelier.
