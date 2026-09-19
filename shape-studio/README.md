# Taller de formas

Piezas, siluetas y geometría para manos pequeñas. Juego independiente de HTML, CSS y JavaScript clásico, sin bibliotecas de producción ni CDN. Mantiene Chrome 95 y navegadores actuales como base de compatibilidad. No depende del motor de otro juego.

## Ejecutar y comprobar

- `make serve`: servidor local en el puerto 8080.
- `make check`: sintaxis JavaScript, invariantes del juego, manifest y recursos offline.
- `make icons`: genera los iconos PNG desde el SVG original con Playwright, dependencia solo de desarrollo.
- Pruebas de interacción en el repositorio: `tests/learning-memory-shapes.spec.cjs`.

El sonido comienza apagado en cada apertura. No hay reloj, anuncios, compras, cuentas ni telemetría. El progreso se guarda localmente; si el navegador bloquea el almacenamiento el juego sigue funcionando. La PWA precarga exclusivamente sus recursos y elimina exclusivamente sus versiones antiguas de caché. Abrir una vez conectado habilita el juego offline.

Tres dificultades: 4, 6 y 8 piezas. El segundo nivel introduce círculo/óvalo y cuadrado/rectángulo; el tercero comparte un único color y añade rombo/hexágono. Arrastrar, tocar pieza y hueco, o Tab / Enter son equivalentes. Comparación por identidad geométrica, no por color. Soltar fuera o sobre una pieza incorrecta no penaliza. Escape cancela la selección.

Créditos y adaptación de código MIT verificado: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
