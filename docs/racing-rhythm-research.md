# Investigación: carreras y plataformas rítmicas

Fecha: 2026-09-19. Estado: investigación seguida de aprobación explícita del lote de tres juegos e implementación. Los juegos antiguos quedan excluidos del nuevo bloqueo conforme a la aclaración posterior del usuario.

## Alcance y límites

Se han consultado la búsqueda pública de GitHub, metadatos, licencias, README y código de proyectos concretos. Las estrellas son una señal de interés de desarrolladores, **no una medida de uso por niños**, calidad, seguridad ni compatibilidad.

Se pueden adaptar los fragmentos licenciados y documentar la aportación propia. No se propone ocultar los autores originales, eliminar sus avisos de licencia, copiar las marcas Geometry Dash/Asphalt ni incorporar música, vehículos de marca o recursos comerciales extraídos de esos juegos. Cambiar colores no convierte esos recursos en propios.

La prioridad técnica es el dispositivo ya indicado: Android 5.0.2 / Chrome 95, además de móviles y tablets modernos. Una prueba en Chromium 95 de escritorio verifica APIs y ejecución, pero no demuestra rendimiento ni compatibilidad del controlador gráfico de la tablet física.

## Candidatos inspeccionados

| Proyecto y revisión inmutable | Estrellas observadas | Licencia y evidencia | Evaluación |
| --- | ---: | --- | --- |
| [jakesgordon/javascript-racer](https://github.com/jakesgordon/javascript-racer/tree/3e8a060b5900755db27f899612a74a77427c853e) | 1.157 | [MIT](https://github.com/jakesgordon/javascript-racer/blob/3e8a060b5900755db27f899612a74a77427c853e/LICENSE), Jake Gordon y colaboradores. El [README](https://github.com/jakesgordon/javascript-racer/blob/3e8a060b5900755db27f899612a74a77427c853e/README.md) excluye redistribuir su música y reconoce sprites prestados de OutRun. | Mejor referencia ligera para carretera pseudo-3D, curvas y colinas. Reutilizar solamente código identificado; sustituir **todos** los sprites y música. El propio autor advierte que es demo y que no optimizó móviles: no adoptar sin adaptación y pruebas. |
| [Gaetz/js-Racing](https://github.com/Gaetz/js-Racing/tree/1d94a229f5c23f0e73335661dff9615119b24cb0) | 3 | [MIT](https://github.com/Gaetz/js-Racing/blob/1d94a229f5c23f0e73335661dff9615119b24cb0/LICENSE), Gaëtan Blaise-Cazalet. | Núcleo cenital pequeño, Canvas 2D y sin motor externo. Aceleración/frenado, orientación y colisiones de cuadrícula. Solo teclado, bucle fijo `setInterval`, sin adaptación móvil. Usar núcleo seleccionado con atribución, arte y circuitos nuevos, entrada táctil y temporización corregidas. |
| [Konatsu13/Geometry_Dash](https://github.com/Konatsu13/Geometry_Dash/tree/14203e78f792e4f42b99f8d5fff29ec50c2611cf) | 1 | [MIT](https://github.com/Konatsu13/Geometry_Dash/blob/14203e78f792e4f42b99f8d5fff29ec50c2611cf/LICENSE), Fathan Athaya Dimyati. `script.js` contiene geometría Canvas, saltos, portales, colisiones y síntesis Web Audio. El README menciona `assets/level1.mp3`, sin procedencia musical específica verificada. | Referencia adaptativa posible, **no paquete listo**. No incorporar el MP3. Diseñar niveles, identidad visual y música originales; usar colisiones/salto licenciados solo si aportan valor. Dos defectos de compatibilidad confirmados abajo. |
| [BKcore/HexGL](https://github.com/BKcore/HexGL/tree/6addc95a2fce3bf05f4d751823cc054c61a16d68) | 1.741 | [MIT](https://github.com/BKcore/HexGL/blob/6addc95a2fce3bf05f4d751823cc054c61a16d68/LICENSE) para código y recursos salvo indicación individual; [audio/LICENSE](https://github.com/BKcore/HexGL/blob/6addc95a2fce3bf05f4d751823cc054c61a16d68/audio/LICENSE) incluye CC-BY 3.0 y dominio público, con autores identificados. | Juego futurista WebGL, controles táctiles y motor Three.js antiguo. Más próximo a velocidad 3D, pero no coches de carretera y mayor riesgo gráfico/mantenimiento en Android 5. No primera opción para la compatibilidad exigida. |
| [mrdoob/Starter-Kit-Racing](https://github.com/mrdoob/Starter-Kit-Racing/tree/40942fbcefc833a80db6583040fcba27e0e7e6c1) | 307 | MIT; README acredita los modelos de Kenney como CC0 y motor crashcat. | Buen ejemplo 3D moderno con coches y saltos. `index.html` importa Three 0.185.1 y crashcat 0.0.3 desde CDNs. No adoptar directamente: dependencias externas, renderer moderno, controles/rendimiento físico pendientes. |
| [ssusnic/Pseudo-3d-Racer](https://github.com/ssusnic/Pseudo-3d-Racer/tree/12dfc34d7d055b83441016d9a2e774c585fdfdc3) | 67 | MIT, Srdjan Susnic. | Tutorial Phaser 2, carretera recta y jugador, no juego completo. Menor ventaja que el pequeño núcleo de Jake Gordon para nuestra aplicación sin dependencias. |

Otras exclusiones: los primeros resultados de `geometry-dash language:javascript` incluyen documentación, herramientas para servidores y proyectos sin licencia explícita. `web-dashers/web-dashers.github.io` (173 estrellas) no presentaba licencia en metadatos: no se trata la publicación del repositorio como permiso de reutilización. Proyectos de decompilación no acreditan derechos sobre los recursos del juego original por incluir una licencia en su repositorio.

## Inspección técnica y pruebas ejecutadas

### Pseudo-3D: fragmentos licenciados verificables

Se descargó `common.js` de Jake Gordon fijando el commit y se evaluó en un contexto Node `vm` con `window` mínimo. Se probaron `Util.project`, `Util.overlap` y `Util.accelerate` del código original, sin reimplementarlas para el ensayo.

- Con cámara de 800 × 400, profundidad 1 y ancho de carretera 2000, z=1000 produce ancho de pantalla 800; z=2000 produce 400. Centro x=400 en ambos casos.
- Solapamiento positivo para centros 0/1 y anchos 2; negativo para centros 0/4 y anchos 2.
- `accelerate(10,4,0.5)` produce 12.
- Resultado: **PASS** en las cinco aserciones. Esto verifica primitivas matemáticas, no la jugabilidad completa ni el rendimiento de render.

En `common.js` líneas 119–133 el original usa acumulador de tiempo y `update(step)`: base útil para paso fijo. Sus gráficos y audio **no** se descargaron para incorporarlos al producto.

### Runner: la adaptación es obligatoria

Se evaluó `script.js` del commit fijado en Node `vm`, interceptando únicamente el arranque DOM. Se ejecutó el `Game.prototype.update` original con un jugador sin colisiones y velocidad de nivel 4.8 para simular un segundo con diferente número de frames:

| Frames de actualización en 1 segundo | Avance observado |
| ---: | ---: |
| 30 | 144 px |
| 60 | 288.00000000000034 px |
| 120 | 576.0000000000002 px |

`update()` suma directamente `level.speed` (línea 1876); `_loop()` llama a `update()` una vez por frame (líneas 2071–2075). El juego se acelera en pantallas rápidas y ralentiza en dispositivos lentos. Hay que separar simulación y render con paso fijo, además de no dejar que el bloqueo educativo acumule tiempo de simulación.

El mismo archivo usa `roundRect` cinco veces. Se abrió Chromium real **95.0.4630.0** mediante Playwright y se consultaron sus APIs:

```text
CanvasRenderingContext2D.prototype.roundRect: undefined
Canvas 2D: true
PointerEvent: function
AudioContext: function
```

Por tanto, copiarlo sin modificar rompe la ruta de dibujo correspondiente en Chrome 95. Usar caminos Canvas compatibles (`arcTo`/líneas) o helper local, sin depender de `roundRect`. No atribuir esta comprobación de escritorio al Android físico.

### Minikarts: límites detectados leyendo código

En `src/car.js`, `update()` modifica velocidad y posición por tick; `src/main.js` lo ejecuta a 30 Hz con `setInterval`. La entrada solo registra teclado. La meta accede a `currentTrack.code` sin validar que exista la celda; salir de la cuadrícula puede causar una excepción. La adaptación tendría que corregir esos puntos, añadir controles táctiles y mantener carreras de un jugador sin arrastrar el segundo jugador obligatorio del ejemplo.

## Lote aprobado

Tres juegos nuevos, distintos entre sí, manteniendo coches existentes y aplicando el bloqueo educativo acordado únicamente a estos tres nuevos juegos:

1. **Carreras de carretera pseudo-3D**: cámara trasera, curvas, tráfico, nitro y rampas, con base matemática MIT de Jake Gordon, coches y escenarios originales. Reproduce la sensación arcade de velocidad/saltos, **no la fidelidad gráfica ni el contenido de Asphalt 9**. Es la opción con menor riesgo para la tablet antigua.
2. **Minikarts cenitales**: circuitos cortos con curvas, agarre, frenada y carrera contra rivales sencillos; núcleo seleccionado de Gaetz bajo MIT. Debe adaptarse a niños no lectores, con iconos y controles táctiles amplios.
3. **Plataformas rítmicas original**: avance automático, salto por toque, obstáculos y portales, niveles propios graduados para 4–6 años y sonido inicialmente apagado. Referencia de código MIT Konatsu13, sin su MP3, nombres o patrones de niveles copiados. Paso fijo y caminos de dibujo compatibles con Chrome 95.

Alternativa para el primer juego: un fork 3D completo de HexGL/Starter Kit, con más coste de optimización y sin prometer compatibilidad de la tablet antes de un ensayo gráfico real. No se recomienda como primera entrega.

### Criterios de aceptación

- Conservar licencias completas y mapa de fragmentos reutilizados; créditos accesibles, sin sugerir autoría exclusiva.
- Sin anuncios, compras, telemetría, autenticación infantil ni CDNs de ejecución.
- HTML/JS/CSS y Canvas 2D para la ruta compatible; teclado y táctil; retrato y paisaje.
- PWA/offline y cachés aisladas por juego; acceso desde la home existente.
- Reto al entrar y cada diez minutos después de resolver el anterior; bloqueo pausa simulación/audio y conserva la partida. Errores no destruyen progreso.
- Pruebas de colisiones, victoria/reinicio, pausa, entrada táctil, sonidos OFF, almacenamiento, instalación/offline y ausencia de desbordamientos.
- Verificar 30/60/120 Hz sin diferencias en simulación; probar Chromium 95 real además de navegadores actuales. El ensayo de tablet física seguirá siendo una limitación explícita mientras no esté disponible.

## Reproducibilidad de la consulta

Consultas públicas ejecutadas, sin escrituras externas ni cambios de credenciales:

```sh
gh api 'search/repositories?q=geometry-dash+language:javascript&sort=stars&per_page=7'
gh api 'search/repositories?q=racing-game+language:javascript&sort=stars&per_page=10'
gh api 'search/repositories?q=geometry-dash+language:javascript+license:mit&sort=stars&per_page=25'
gh api 'search/repositories?q=javascript+top+down+racing+license:mit&sort=stars&per_page=7'
gh api repos/jakesgordon/javascript-racer
gh api 'repos/jakesgordon/javascript-racer/contents/common.js?ref=3e8a060b5900755db27f899612a74a77427c853e'
gh api 'repos/Konatsu13/Geometry_Dash/contents/script.js?ref=14203e78f792e4f42b99f8d5fff29ec50c2611cf'
```

Se contrastaron contenidos `LICENSE`, `README.md`, árbol completo y fuentes citadas de cada candidato. La investigación inicial no incorporó recursos a los juegos. Tras la aprobación se crearon Turbo Horizonte (`nitro-highway`), Mini Karts (`pocket-karts`) y Salto Neón (`pulse-path`), cada uno con créditos concretos y recursos visuales propios.

## Implementación de las carreras

- Turbo Horizonte adapta únicamente la función de proyección MIT de Jake Gordon. Tres coches, tres escenarios, carretera con curvas, tráfico, nitro recargable, rampas, meta y siguiente circuito. Todos los vehículos y escenarios son trazados Canvas/SVG originales, sin sprites OutRun ni audio comercial.
- Mini Karts adapta el movimiento por orientación del ejemplo MIT de Gaëtan Blaise-Cazalet, con físicas de paso fijo propias, tres karts y tres trazados. Cuenta doce checkpoints en orden por vuelta y dos vueltas por carrera. Los karts transparentes son fantasmas visuales de ritmo; no se presentan como rivales sólidos ni como una competición con clasificación.
- Ambos integran la copia local canónica de LearningGate, pausa de simulación/audio y liberación de entradas durante el reto, PWA con caché propia y controles táctiles/teclado. La ayuda inicial acelera suavemente; no conduce por el niño.
- Pruebas Node ejecutadas: las nueve combinaciones coche/circuito por juego pueden finalizar; invariancia de simulación con render a 30/60/120 Hz; turbo/salto/colisión en carretera; 24 checkpoints ordenados, rechazo de atajos y marcha atrás en karts. Resultado PASS. Las pruebas de navegador se registran en la entrega, sin extrapolar al hardware físico Android no disponible.
