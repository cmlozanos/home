# Órbita · Tu pequeño universo

## Reto educativo (ampliación aprobada el 25-09-2026)

Antes de jugar y cada diez minutos se resuelve una suma, resta o trazo de letra del sistema compartido. La partida, las entradas activas, el sonido y los temporizadores de juego se suspenden sin perder el progreso ni quitar una pausa manual. El reto funciona también al abrir la PWA sin conexión; cada entrada requiere uno nuevo. La copia local `learning-gate.js` procede de `../learning-gate/gate.js`.

La salida «Todos los juegos» conduce a https://cmlozanos.github.io/games/. No necesita servidor Ubuntu. `make check` comprueba la sintaxis del módulo; las pruebas de integración están en `../tests/legacy-gates.spec.cjs`.

Laboratorio de gravedad táctil para niños. Juego estático, sin cuentas, anuncios, servicios externos ni dependencias de ejecución. Abrir `index.html` mediante cualquier servidor HTTP; GitHub Pages sirve la carpeta directamente.

## Jugar

- Pulsa ▶ para empezar; ↺ en la portada recupera el universo guardado.
- Escoge un planeta, cometa, estrella, nebulosa o agujero negro y toca el espacio. Los planetas reciben una velocidad orbital inicial respecto a la estrella próxima de mayor masa.
- Arrastra en el espacio y suelta para lanzar en la dirección de la flecha. La longitud controla la velocidad inicial. También puedes arrastrar directamente desde la paleta al espacio.
- Toca un cuerpo existente para inspeccionarlo, arrástralo y suéltalo para lanzarlo. Hasta diez contactos independientes, sujetos a la pantalla del dispositivo.
- Los cuerpos se atraen; al chocar se unen conservando masa y momento. Los viajeros que abandonan el área de simulación se retiran, con indicación visual.
- Herramientas: ＋ crear, ☝ mover, ⌖ bloquear, ↻ poner en órbita, ● cambiar el tamaño y 🌱 ver las zonas habitables. Bloquear y después poner en órbita activa una ayuda orbital que ignora perturbaciones; una colisión cancela esa ayuda.
- Botones: pausar, cambiar entre 1×/2×/0,5×, mostrar trayectorias, guardar y elegir entre seis escenarios. «Colisión» demuestra el colapso de dos estrellas masivas; «Semillero» la formación de estrellas; «Vida» parte de un mundo avanzado para observar civilizaciones.
- Las estrellas envejecen y producen gigantes y remanentes según su masa: enanas blancas, púlsares, magnetares o agujeros negros. Un choque de planetas pequeños no genera un agujero negro. Los agujeros negros absorben materia al contactar con ella.
- Los mundos rocosos en una zona habitable desarrollan vida, agricultura, industria, era nuclear y naves colonizadoras. Si pierden las condiciones adecuadas, la vida retrocede.
- Hay descubrimientos visuales al crear tres cuerpos, completar una órbita y reunir los cinco tipos.
- Teclado: con el lienzo enfocado, Intro crea un cuerpo y Espacio pausa. Todos los botones admiten teclado y tienen nombre accesible.
- El sonido comienza apagado en cada apertura. Los universos se guardan automáticamente cada 15 segundos y al salir, además del botón explícito. Todo permanece en el navegador del dispositivo.

## Física y rendimiento

Integrador velocity Verlet con paso fijo 1/120 s, máximo 20 pasos por fotograma, gravedad mutua con suavizado de Plummer de 10 unidades y colisiones inelásticas con detección continua durante el movimiento. Los radios sólidos visibles coinciden con las superficies físicas; halos, anillos y colas son decorativos. La escala de masas, evolución, habitabilidad y tiempos es lúdica, no una predicción astronómica ni una reproducción de los parámetros privados del museo. La velocidad orbital inicial es solo una ayuda de colocación. Los bloqueos explícitos y las órbitas protegidas son restricciones educativas externas: no se exige conservación del momento frente a esos anclajes.

Máximo 24 cuerpos, 100 puntos de trayectoria por cuerpo, 90 partículas y densidad de píxel máxima 1,5. Canvas2D sin WebGL, fuentes del sistema, scripts clásicos, cero descargas externas. Compatible por APIs con Chrome 95 y Safari con Pointer Events; no se garantiza una tasa de fotogramas concreta sin medir el dispositivo físico. Orientación libre, cámara que adapta el encuadre al área disponible. No se acumula tiempo al volver de segundo plano.

PWA instalable con manifiesto, iconos PNG y caché offline propia `orbit-lab-*`. Su service worker solo intercepta su carpeta y no elimina cachés de otros juegos. La navegación consulta la red; una apertura offline utiliza el documento precacheado. Al publicar cambios se deben incrementar juntos la versión de CSS/scripts en HTML y la versión/lista de recursos en `sw.js`.

## Verificar

```sh
make check  # sintaxis, órbitas, impactos continuos, evolución, vida, colonias, APIs e iconos
make serve  # servidor local en http://localhost:8080
make icons # regenerar PNG desde SVG con ImageMagick
```

`?test=1` expone `window.__orbitDiagnostics`, una instantánea de solo lectura del estado para la automatización del navegador. No permite modificar la simulación. El padre del proyecto contiene el arnés de pruebas responsive/PWA del conjunto de juegos.

Consulta [RESEARCH.md](RESEARCH.md) y la [auditoría de Stellar Playground](STELLAR_AUDIT.md) para las fuentes, diferencias y límites de la adaptación. El núcleo gravitatorio reutilizado conserva su [licencia MIT](vendor/LICENSE.gravity). El guardado v2 conserva edad, tamaño, bloqueos y vida, y sigue aceptando partidas v1. Las naves en tránsito y los efectos efímeros no se guardan.
