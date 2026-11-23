# V2 — validación focal local

Alcance: `nitro-highway`, `pocket-karts`, `pulse-path`. Sin commit/push.

## Fallos reproducidos y regresiones

- Karts: orientado contra el borde exterior en (367,0), acelerando y girando
  durante 8 s, quedaba en x=366,65 y velocidad 3,25. Con giro mínimo mientras
  se acelera/frena: x=272,77, velocidad 139,36; sale del borde.
- Karts: visitar los 24 centros de checkpoint con dt=0 daba dos vueltas y
  victoria a tiempo cero. Ahora exige paso temporal y velocidad en sentido
  del circuito; regresiones también rechazan cruzar hacia atrás. No es una
  protección contra manipulación deliberada del estado.
- Highway: jugador parado junto a tráfico que se alejaba recibía una colisión.
  Ahora solo cuenta al alcanzar tráfico más lento.
- Ambos: soltar teclado cancelaba una dirección aún pulsada con otro dedo.
  Se conserva la unión de fuentes teclado/táctil; regresión de dos punteros,
  cancelación de uno y teclado simultáneo. Reinicio limpia entradas y reloj.
- Pulse: controles de cabecera a 43px y altura de canvas obsoleta al rotar.
  Corregidos a 44px y resize tras actualizar el viewport del kit.
- Home compartido: registrado con el menú nativo; no navega al catálogo ni
  otorga victoria. Selección conservada y carrera reiniciada al pulsar Jugar.

## Evidencia ejecutada

- `make -C <juego> check`: verde en los tres. Carreras: 9 combinaciones
  coche/circuito por juego; Pulse: 6 circuitos/dificultades; invariancia
  30/60/120Hz, colisiones, rampas, checkpoints, restauración y negativos.
- `GAMES_BASE_URL=http://127.0.0.1:4177/ npx playwright test tests/racing-finish.spec.cjs --project=tablet --workers=1 --output=pocket-karts/.v2-test-results`: 2/2.
  Highway 24,0 s y Karts 24,5 s de prueba. Conducción real con teclado,
  meta (24 checkpoints en Karts), siguiente circuito y captura de ambas metas.
- `tests/new-racing.spec.cjs --project=tablet`: 8/8 en 33,3 s después de los
  cambios de mecánica; input táctil, cancelación, reto periódico, pausa manual,
  retry, responsive, offline y aislamiento de caché.
- Pulse focal: no salta sin entrada, retry, sin almacenamiento, offline y
  recurrencia conservando pausa: 3/3.
- `node nitro-highway/tools/check-family-browser.cjs`: verde los tres;
  320×568, 740×360, 1280×800; controles >=44px, sin scroll de página, ajustes
  trasladados con listeners, ayuda, tema, audio OFF tras reload, pausa familiar
  y manual, entradas mixtas/reinicio y Home con URL estable/menú visible.
- Inspección visual de las dos capturas de meta: fuente, cabecera, resultado,
  controles y HUD visibles a 1280×800.
- Recursos offline: 120/120/121 URLs existentes y cuatro copias del kit
  idénticas byte a byte al canónico al comprobar. `git diff --check`: verde.

## Límites

No se afirma ausencia de bugs ni mejora de FPS medida en hardware. No se ha
probado la tablet física, Chromium95 ni WebKit en esta tarea. Las carreras de
navegador cubren el primer circuito; las nueve combinaciones están cubiertas
por física determinista. No se ejecutó suite global. Dos pruebas antiguas de
Pulse que buscan ajustes directamente en la pantalla infantil requieren
adaptar su flujo al acceso adulto; no se ejecutaron como aceptación V2.
