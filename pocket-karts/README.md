# Mini Karts

Juego original HTML/CSS/Canvas 2D con un pequeño núcleo adaptado de código MIT, acreditado en [THIRD_PARTY.md](THIRD_PARTY.md). Sin marcas, coches, sprites ni música extraídos de juegos comerciales. Sin anuncios, compras, analítica, cuentas ni recursos externos.

Tres karts (velocidad/agarre diferentes) y tres circuitos cenitales. Dos vueltas y doce checkpoints ordenados por vuelta; cruzar meta sin completar el recorrido no cuenta. Los karts transparentes son fantasmas de ritmo visuales, no rivales sólidos ni clasificación competitiva. El niño conduce el kart opaco y sigue las flechas amarillas.

## Controles

Flechas izquierda/derecha o A/D: girar. Arriba/W: acelerar. Abajo/S: frenar y retroceder. Escape: pausa. Botones táctiles equivalentes; cancelación y cambio de ventana sueltan controles. La ayuda 🤝 acelera automáticamente con velocidad reducida; se puede desactivar antes de iniciar. El jugador sigue controlando la dirección. Sonido apagado en cada apertura.

## Reto educativo y pausa

learning-gate.js es copia local de la fuente canónica. Se carga antes del juego y bloquea al entrar; cada diez minutos desde el reto resuelto vuelve a bloquear. La partida y pausa manual se conservan. No se avanza simulación, se vacía el estado de controles y se suspende audio durante el reto. Si falta el script, el botón jugar queda desactivado. El reloj de juego usa paso fijo 1/120, independiente del refresco.

## PWA y compatibilidad

Instalable desde HTTPS; una primera carga completa prepara el juego y el reto offline. Caché exclusiva pocket-karts-*; no elimina cachés de otros juegos. Sin APIs posteriores a Chrome 95 en la ruta de juego, sin WebGL ni dependencias de ejecución. Las pruebas de Chrome 95 de escritorio no sustituyen probar físicamente Android 5.0.2 SM-T530NU.

## Desarrollo

- `make check`: sintaxis, reglas, completar las nueve combinaciones de coche/circuito, paso fijo 30/60/120Hz y copia idéntica del reto.
- `make serve`: servidor estático local, puerto 8080.
- `make icons`: rasteriza el SVG original con Playwright ya instalado en el repositorio.
- Desde la raíz: `npx playwright test tests/new-racing.spec.cjs --workers=1`.
- `?test=1` expone una instantánea de solo lectura para comprobar entradas, tiempos y progresión; no incluye funciones de desbloqueo ni mutación.

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

### Mecánicas V2 verificadas

Un kart orientado contra el borde conserva giro mínimo mientras se acelera o
frena para poder recuperarse. Los checkpoints solo cuentan con movimiento hacia
delante; una posición estacionaria o un cruce hacia atrás no dan vueltas.
Las entradas táctiles y de teclado son independientes y reiniciar limpia su reloj.

`make check` incluye regresiones de estos casos y las nueve combinaciones
coche/circuito completadas con física de paso fijo. La prueba existente
`tests/racing-finish.spec.cjs` conduce con teclado real, comprueba meta y abre
el siguiente circuito; no modifica el estado del juego.

Inicio usa el menú nativo del juego y mantiene la URL. En carreras abandona
la carrera actual sin premiarla y conserva coche/circuito seleccionados; Jugar
inicia una carrera nueva. En Salto Neón mantiene selección y progreso guardado.
El catálogo solo se ofrece desde el área de adultos del kit.
