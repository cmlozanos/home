# Ampliación de carreras y ritmo — 19-09-2026

## Autorización y alcance

El usuario respondió «Sí, los tres juegos» a la propuesta de carreras pseudo-3D con nitro y rampas, minikarts cenitales y plataformas rítmicas de un toque. La propuesta incluía gráficos propios, atribución de las bases abiertas, retos educativos, PWA, sonido inicial apagado y compatibilidad objetivo Chrome 95. La publicación se realiza en el repositorio personal `cmlozanos/home`, con entradas nuevas en su catálogo y la configuración existente de GitHub Pages.

La instrucción posterior «olvídate de los juegos antiguos a la hora de meter los bloqueos nuevos» excluye los juegos ya publicados. No se modifica Turbo Loop Legends, Rubik ni los seis juegos anteriores de la home, ni sus bloqueos o reglas existentes. El sincronizador educativo tiene una lista explícita de solo tres destinos.

## Entrega

| Juego | Contenido | Controles |
| --- | --- | --- |
| Turbo Horizonte | Tres coches, tres escenarios, tráfico, curvas, nitro, rampas y meta | Botones táctiles, flechas y espacio; ayuda de aceleración opcional |
| Mini Karts | Tres coches con distinto agarre, tres circuitos, dos vueltas y checkpoints secuenciales | Botones táctiles y flechas; ayuda de aceleración opcional |
| Salto Neón | Tres circuitos originales, dos dificultades, estrellas, portales de gravedad y checkpoints | Toque/espacio; ayudas de salto opcionales |

Cada juego tiene su manifiesto e iconos PWA, caché independiente, recursos locales y acceso directo sin servidor de aplicación. Los recursos precargados ocupan 72–84 KiB por juego. No se incluyen publicidad, compras, analítica ni recursos comerciales de los juegos de referencia. Las procedencias y licencias completas se enlazan desde cada juego.

El reto se exige al entrar, incluso mediante URL directa o PWA, y cada 600.000 ms después de resolver el anterior. No existe pase persistente entre juegos. Las operaciones tienen operandos/resultados de 0 a 9, sin negativos; los trazos cubren 54 letras españolas en mayúscula/minúscula. Los errores no penalizan la partida. La simulación se congela y se mantiene una pausa manual previa. La hora de noche no elimina ni alarga la regla.

## Verificación reproducible

```sh
make check check-games
npm test
CHROME95_PATH='/ruta/al/Chromium95' npm test -- --project=chrome95 tests/learning-gate.spec.cjs tests/new-racing.spec.cjs tests/pulse-path.spec.cjs tests/racing-finish.spec.cjs
npm run serve
make screenshots GAME='nitro-highway pocket-karts pulse-path'
```

Las comprobaciones numéricas incluyen las nueve combinaciones coche/circuito de cada juego de carreras, los seis recorridos/dificultades de Salto Neón, invariancia a 30/60/120 Hz, colisiones, saltos, 24 checkpoints de karts sin saltarse su orden, congelación al finalizar, 10.000 retos aritméticos y todos los trazos. Las comprobaciones estáticas validan que cada recurso offline existe, tiene la versión solicitada por el HTML y no borra las cachés de otros juegos.

Las pruebas de navegador utilizan la interfaz real para resolver retos y controles normales para terminar las carreras; los diagnósticos son solo de lectura. Incluyen entrada/recurrencia, error y trazo, teclado, contactos táctiles nativos, pausa, reintento, siguiente circuito, almacenamiento deshabilitado, offline y disposiciones de teléfono/tablet. Las pruebas de contactos múltiples usan CDP de Chromium y se omiten expresamente en WebKit.

Resultado local del conjunto completo: **228 pruebas superadas, 20 omisiones explícitas, cero fallos**, en 9,8 minutos. Las omisiones son las repeticiones de carreras/temporizadores largos fuera del proyecto seleccionado y las pruebas CDP/offline que el arnés reserva a Chromium; no se presentan como pruebas superadas en Safari. Todos los juegos anteriores se comprobaron sin añadirles el nuevo bloqueo.

Chromium real **95.0.4630.0**: las 13 pruebas de integración educativa superadas (18,7 s), incluidas entrada directa, letras, reloj, falta del script y multitáctil nativo. También se verificaron los diez casos de carreras y los cuatro de Salto Neón en ese motor durante la validación de cada juego. No equivale a una prueba en el dispositivo Android físico.

Incidencia del arnés local: la carrera larga de Mini Karts terminaba sus 24 checkpoints, abría el siguiente circuito y cerraba la página, pero Chromium 151/macOS quedaba esperando al finalizar la traza Playwright del contexto. Repetir exactamente la prueba con `--trace=off` terminó con código 0 en 26,0 s (24,7 s de prueba). Solo las dos pruebas de carreras completas desactivan la traza y conservan una captura de la meta; las pruebas breves mantienen sus trazas. No se modificó la física para resolver esta incidencia.

## Límites

Chromium 95.0.4630.0 de escritorio comprueba el motor antiguo, pero no sustituye probar físicamente Android 5.0.2 en la Samsung SM-T530NU: rendimiento, controladores y comportamiento de instalación pueden variar. Offline requiere una primera carga correcta con conexión. No se promete compatibilidad con todos los navegadores históricos. El reto es educativo, no un control parental resistente a manipulación del código o del reloj.
