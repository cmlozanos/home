# Turbo Horizonte

Juego original HTML/CSS/Canvas 2D con un pequeño núcleo adaptado de código MIT, acreditado en [THIRD_PARTY.md](THIRD_PARTY.md). Sin marcas, coches, sprites ni música extraídos de juegos comerciales. Sin anuncios, compras, analítica, cuentas ni recursos externos.

Tres deportivos (velocidad/agarre diferentes), tres carreteras de curvas, tráfico, rampas y nitro recargable. Terminar la distancia abre repetir, elegir coche y siguiente circuito. Las rampas lanzan el coche si llega con suficiente velocidad; con turbo el salto dura más. El tráfico frena al chocar, y durante un salto no bloquea el coche.

## Controles

Flechas izquierda/derecha o A/D: girar. Arriba/W: acelerar. Abajo/S: frenar. Espacio: turbo. Escape: pausa. Botones táctiles equivalentes; cancelación y cambio de ventana sueltan controles. La ayuda 🤝 acelera automáticamente; se puede desactivar antes de iniciar. El jugador sigue controlando la dirección. Sonido apagado en cada apertura.

## Reto educativo y pausa

learning-gate.js es copia local de la fuente canónica. Se carga antes del juego y bloquea al entrar; cada diez minutos desde el reto resuelto vuelve a bloquear. La partida y pausa manual se conservan. No se avanza simulación, se vacía el estado de controles y se suspende audio durante el reto. Si falta el script, el botón jugar queda desactivado. El reloj de juego usa paso fijo 1/120, independiente del refresco.

## PWA y compatibilidad

Instalable desde HTTPS; una primera carga completa prepara el juego y el reto offline. Caché exclusiva nitro-highway-*; no elimina cachés de otros juegos. Sin APIs posteriores a Chrome 95 en la ruta de juego, sin WebGL ni dependencias de ejecución. Las pruebas de Chrome 95 de escritorio no sustituyen probar físicamente Android 5.0.2 SM-T530NU.

## Desarrollo

- `make check`: sintaxis, reglas, completar las nueve combinaciones de coche/circuito, paso fijo 30/60/120Hz y copia idéntica del reto.
- `make serve`: servidor estático local, puerto 8080.
- `make icons`: rasteriza el SVG original con Playwright ya instalado en el repositorio.
- Desde la raíz: `npx playwright test tests/new-racing.spec.cjs --workers=1`.
- `?test=1` expone una instantánea de solo lectura para comprobar entradas, tiempos y progresión; no incluye funciones de desbloqueo ni mutación.
