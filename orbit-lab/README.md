# Órbita · Tu pequeño universo

Laboratorio de gravedad táctil para niños. Juego estático, sin cuentas, anuncios, servicios externos ni dependencias de ejecución. Abrir `index.html` mediante cualquier servidor HTTP; GitHub Pages sirve la carpeta directamente.

## Jugar

- Pulsa ▶ para empezar; ↺ en la portada recupera el universo guardado.
- Escoge un planeta, cometa o estrella en la paleta inferior y toca el espacio: recibe una velocidad orbital circular respecto al cuerpo más masivo.
- Arrastra en el espacio y suelta para lanzar en la dirección de la flecha. La longitud controla la velocidad inicial. También puedes arrastrar directamente desde la paleta al espacio.
- Varios dedos pueden crear cuerpos simultáneamente, con tantos puntos de contacto como admita la pantalla.
- Los cuerpos se atraen; al chocar se unen conservando masa y momento. Los viajeros que abandonan el área de simulación se retiran, con indicación visual.
- Botones: pausar, cambiar entre 1×/2×/0,5×, mostrar trayectorias, guardar y elegir sistema solar/dos estrellas/un sol vacío.
- Hay descubrimientos visuales al crear tres cuerpos, completar una órbita y reunir los cinco tipos.
- Teclado: con el lienzo enfocado, Intro crea un cuerpo y Espacio pausa. Todos los botones admiten teclado y tienen nombre accesible.
- El sonido comienza apagado en cada apertura. Los universos se guardan automáticamente cada 15 segundos y al salir, además del botón explícito. Todo permanece en el navegador del dispositivo.

## Física y rendimiento

Integrador velocity Verlet con paso fijo 1/120 s, máximo 20 pasos por fotograma, gravedad de todos los cuerpos con suavizado de Plummer de 10 unidades y colisiones inelásticas. La escala de masas y tiempos es lúdica: no representa un modelo astronómico a escala. La velocidad circular inicial es una ayuda de colocación, no una fijación artificial a la trayectoria; las perturbaciones posteriores actúan físicamente. La estrella se mueve y recibe fuerzas como los demás cuerpos.

Máximo 24 cuerpos, 100 puntos de trayectoria por cuerpo, 90 partículas y densidad de píxel máxima 1,5. Canvas2D sin WebGL, fuentes del sistema, scripts clásicos, cero descargas externas. Compatible por APIs con Chrome 95 y Safari con Pointer Events; no se garantiza una tasa de fotogramas concreta sin medir el dispositivo físico. Orientación libre, cámara que adapta el encuadre al área disponible. No se acumula tiempo al volver de segundo plano.

PWA instalable con manifiesto, iconos PNG y caché offline propia `orbit-lab-*`. Su service worker solo intercepta su carpeta y no elimina cachés de otros juegos. La navegación consulta la red; una apertura offline utiliza el documento precacheado. Al publicar cambios se deben incrementar juntos la versión de CSS/scripts en HTML y la versión/lista de recursos en `sw.js`.

## Verificar

```sh
make check  # sintaxis, 12 órbitas, conservación, colisiones, 24 cuerpos, APIs e iconos
make serve  # servidor local en http://localhost:8080
make icons # regenerar PNG desde SVG con ImageMagick
```

`?test=1` expone `window.__orbitDiagnostics`, una instantánea de solo lectura del estado para la automatización del navegador. No permite modificar la simulación. El padre del proyecto contiene el arnés de pruebas responsive/PWA del conjunto de juegos.

Consulta [RESEARCH.md](RESEARCH.md) para las fuentes inspeccionadas y las decisiones de adaptación. El núcleo gravitatorio reutilizado conserva su [licencia MIT](vendor/LICENSE.gravity).
