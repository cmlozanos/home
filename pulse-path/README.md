# Salto Neón

Plataformas de avance automático con tres circuitos originales de 18–27 segundos en modo tranquilo, salto por toque/espacio, portales de gravedad, precipicios, prismas, estrellas y puntos de control. Modo normal más rápido. La ayuda de salto empieza desactivada: sin pulsar no hay saltos. Puede activarse expresamente con el botón de varita. Repetir saltos requiere mantener pulsado y conserva su selector independiente. Corrección solicitada el 27-09-2026; no cambia circuitos, física ni progreso guardado.

Entrada educativa obligatoria y cada diez minutos mediante copia local del módulo `learning-gate`; la simulación, el sonido y entradas pendientes se congelan durante el reto, sin acumular tiempo. Sonido apagado en cada carga. No hay anuncios, red analítica, compras, fuentes o librerías remotas.

Canvas 2D / JavaScript clásico compatible con Chrome 95; no WebGL, `roundRect`, import maps ni servicios remotos. PWA con caché propia `pulse-path-`, jugable sin conexión tras la primera instalación correcta. Guardado local opcional de circuitos completados y mejor progreso; sigue funcionando si el almacenamiento no está disponible.

`make check` valida sintaxis, colisiones, salto, gravedad, restauración y que los seis recorridos/dificultades sean completables e idénticos a 30/60/120 Hz. `make serve` sirve esta carpeta en el puerto 8080. Desde la raíz del repositorio, `make icons GAME=pulse-path` genera los PNG de instalación en `icons/`. Las pruebas Playwright del repositorio verifican entrada táctil/teclado, pausa, reintento, victoria y siguiente circuito. En `?test=1`, `window.__pulse.read()` ofrece una copia de diagnóstico solo de lectura; no modifica el estado.

Créditos de terceros y procedencia concreta: [CREDITS.md](CREDITS.md). La verificación en Chromium 95 de escritorio no sustituye una prueba física en la tablet Android indicada.

## Versión 2.0.0 — Family V2

Integra la copia local del kit canónico `../family-v2/`: tema público con selector
nativo, fuente manuscrita local, ajustes para adultos y sesión de una hora. Los
botones originales de sonido, ayuda y opciones se trasladan conservando sus
listeners; el audio siempre arranca apagado. La pausa familiar es independiente
del reto educativo y de la pausa manual: cerrar un diálogo no desbloquea ninguno.

Todos los coches/circuitos siguen accesibles. Se simplifica el HUD y se reducen
los efectos y la resolución de render a un máximo de 1× para tablets antiguas;
se conservan los circuitos y las claves de progreso existentes. Las correcciones
de mecánica acotadas se detallan abajo. Las
metas y logros reales aportan puntos con IDs estables por circuito, sin premiar
abrir menús. La caché propia `2.0.0` precarga CSS/JS del kit con `?v=2.0.0`,
`playwrite-es.ttf` y `OFL.txt`; conserva las cachés ajenas y el progreso guardado.

Autorización de este lote: solo cambios locales en este juego; integración Git
a cargo del agente principal, sin commit/push desde esta tarea.

Inicio usa el menú nativo del juego y mantiene la URL. En carreras abandona
la carrera actual sin premiarla y conserva coche/circuito seleccionados; Jugar
inicia una carrera nueva. En Salto Neón mantiene selección y progreso guardado.
El catálogo solo se ofrece desde el área de adultos del kit.

### Refinamiento nativo — 23 noviembre 2026

Escena Canvas con materiales facetados, profundidad y paletas de día/noche.
Consume `FamilyV2.theme()`, `motionAllowed()` y `familyv2:appearance`;
sin kit usa el atributo de tema y `prefers-reduced-motion`. El texto Canvas
usa `FamilyV2.fontFamily` y redibuja tras `fontReady`, con fallback ligado.
La preferencia de movimiento elimina decoración, no movimiento de juego.
Física, controles, guardado y límite de resolución 1× conservados.

Desde la raíz, con el servidor existente activo:
`node nitro-highway/tools/check-native-appearance.cjs` (también
`make -C nitro-highway check-native-appearance`). Admite `GAMES_BASE_URL`.
Verifica paletas Canvas, evento/getters/fallback, pausa, juego sin decoración,
tipografía y resolución en 1280×800 y 740×360. Capturas en
`docs/v2/refinement/evidence/racing/`. No acredita rendimiento físico Android.
