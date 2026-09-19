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
