# Taller de formas

## Reto educativo (ampliación aprobada el 25-09-2026)

Antes de jugar y cada diez minutos se resuelve una suma, resta o trazo de letra del sistema compartido. La partida, las entradas activas, el sonido y los temporizadores de juego se suspenden sin perder el progreso ni quitar una pausa manual. El reto funciona también al abrir la PWA sin conexión; cada entrada requiere uno nuevo. La copia local `learning-gate.js` procede de `../learning-gate/gate.js`.

En V2, Inicio abre el menú del juego; «Todos los juegos» queda dentro de Adultos y conduce a https://cmlozanos.github.io/games/. No necesita servidor Ubuntu. `make check` comprueba la sintaxis del módulo; las pruebas de integración están en `../tests/legacy-gates.spec.cjs`.

Piezas, siluetas y geometría para manos pequeñas. Juego independiente de HTML, CSS y JavaScript clásico, sin bibliotecas de producción ni CDN. Mantiene Chrome 95 y navegadores actuales como base de compatibilidad. No depende del motor de otro juego.

## Ejecutar y comprobar

- `make serve`: servidor local en el puerto 8080.
- `make check`: sintaxis JavaScript, invariantes del juego, manifest y recursos offline.
- `make icons`: genera los iconos PNG desde el SVG original con Playwright, dependencia solo de desarrollo.
- Pruebas de interacción en el repositorio: `tests/learning-memory-shapes.spec.cjs`.

El sonido comienza apagado en cada apertura. No hay reloj, anuncios, compras, cuentas ni telemetría. El progreso se guarda localmente; si el navegador bloquea el almacenamiento el juego sigue funcionando. La PWA precarga exclusivamente sus recursos y elimina exclusivamente sus versiones antiguas de caché. Abrir una vez conectado habilita el juego offline.

Tres dificultades: 4, 6 y 8 piezas. El segundo nivel introduce círculo/óvalo y cuadrado/rectángulo; el tercero comparte un único color y añade rombo/hexágono. Arrastrar, tocar pieza y hueco, o Tab / Enter son equivalentes. Comparación por identidad geométrica, no por color. Soltar fuera o sobre una pieza incorrecta no penaliza. Escape cancela la selección.

Créditos y adaptación de código MIT verificado: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).


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
  `http://127.0.0.1:4177/`; alternativamente `GAME_URL=http://127.0.0.1:8080/ make
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

Regresiones: identidades vacías/no textuales no encajan; geometría incorrecta y soltar fuera no colocan piezas; puntero secundario no inicia arrastre y su cancelación no cancela el arrastre primario. Un punto por encaje confirmado, sin duplicados.

Resultado observado (23-11-2026): `make check` verde y
`node tools/check-v2-browser.cjs` + `BROWSER=webkit node
 tools/check-v2-browser.cjs` verdes en los cuatro viewports anteriores.
La inspección visual adicional fue a 360×740; no acredita inspección visual de
cada estado. Chromium validó recarga offline y la firma PNG exportada en Atelier.

Regresión preexistente adicional ejecutada desde home:
`playwright test tests/learning-memory-shapes.spec.cjs --project=tablet --grep
'all three levels|geometry rejects|dragging over' --timeout=90000` → 3/3 verdes.
El primer intento con el límite original de 45 s agotó el timeout en Memory al
finalizar/teardown; la repetición acotada amplió solo el presupuesto temporal,
sin cambiar aserciones, y pasó. No se presenta ese primer intento como verde.
