# Salto Neón

Plataformas de avance automático con tres circuitos originales de 18–27 segundos en modo tranquilo, salto por toque/espacio, portales de gravedad, precipicios, prismas, estrellas y puntos de control. Modo normal más rápido. La ayuda de salto y repetir saltos al mantener pulsado son controles visibles independientes; pueden desactivarse. Con la ayuda desactivada es necesario saltar para superar obstáculos.

Entrada educativa obligatoria y cada diez minutos mediante copia local del módulo `learning-gate`; la simulación, el sonido y entradas pendientes se congelan durante el reto, sin acumular tiempo. Sonido apagado en cada carga. No hay anuncios, red analítica, compras, fuentes o librerías remotas.

Canvas 2D / JavaScript clásico compatible con Chrome 95; no WebGL, `roundRect`, import maps ni servicios remotos. PWA con caché propia `pulse-path-`, jugable sin conexión tras la primera instalación correcta. Guardado local opcional de circuitos completados y mejor progreso; sigue funcionando si el almacenamiento no está disponible.

`make check` valida sintaxis, colisiones, salto, gravedad, restauración y que los seis recorridos/dificultades sean completables e idénticos a 30/60/120 Hz. `make serve` sirve esta carpeta en el puerto 8080. Desde la raíz del repositorio, `make icons GAME=pulse-path` genera los PNG de instalación en `icons/`. Las pruebas Playwright del repositorio verifican entrada táctil/teclado, pausa, reintento, victoria y siguiente circuito. En `?test=1`, `window.__pulse.read()` ofrece una copia de diagnóstico solo de lectura; no modifica el estado.

Créditos de terceros y procedencia concreta: [CREDITS.md](CREDITS.md). La verificación en Chromium 95 de escritorio no sustituye una prueba física en la tablet Android indicada.
