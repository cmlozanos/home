# Fruit Splash

## Reto educativo (ampliación aprobada el 25-09-2026)

Antes de jugar y cada diez minutos se resuelve una suma, resta o trazo de letra del sistema compartido. La partida, las entradas activas, el sonido y los temporizadores de juego se suspenden sin perder el progreso ni quitar una pausa manual. El reto funciona también al abrir la PWA sin conexión; cada entrada requiere uno nuevo. La copia local `learning-gate.js` procede de `../learning-gate/gate.js`.

En V2, Inicio vuelve al menú del mismo juego sin borrar partidas; el catálogo externo queda en Adultos. No necesita servidor Ubuntu. `make check` comprueba la sintaxis del módulo; las pruebas de integración están en `../tests/legacy-gates.spec.cjs`.

Juego táctil completo, estático, con Canvas 2D. URL: https://cmlozanos.github.io/home/fruit-splash/

- Jardín libre y sin penalizaciones, reto de 60 segundos y aventura con tres vidas/bombas.
- Deslizamientos multitáctiles (hasta 10 contactos), ratón, pausa con Escape.
- Frutas originales con mitades, zumo, combos, récords locales y sonido opcional apagado al abrir.
- PWA instalable, offline tras la primera carga, sin CDN ni cuentas.
- JavaScript clásico compatible con Chrome 95; no requiere WebGL. Resolución y partículas limitadas para tablets antiguas.
- Adaptación real de código MIT documentada en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

`make check`: sintaxis y PoC matemático de cortes y trayectorias.
`make serve`: servidor de desarrollo local en el puerto 8080.
Pruebas de navegador de ambos juegos: desde la raíz `make test-games`.

Subir la versión de recursos de `index.html` y `sw.js` juntos cuando se publique una actualización. El service worker solo elimina sus propias cachés. Los récords se conservan en `fruit-splash-v1` y toleran almacenamiento no disponible. `?test=1` expone únicamente una instantánea de diagnóstico para las pruebas.

## Family V2 · 2.0.0

Kit local `family-v2/`: fuente Playwrite ES (OFL), tema claro, controles de familia y puntos de la última hora. Los ajustes usan los mismos botones y conservan sus manejadores; la pausa familiar es independiente del reto educativo y de la pausa manual. Todos los modos y contenidos siguen disponibles sin requisitos de rango. No se migran ni borran partidas. Sonido apagado en cada carga. Los cuatro recursos del kit se precachean para uso offline.

Validación local: `make check`. Las pruebas de navegador no sustituyen una tablet física ni conceden permisos de cámara.

Inicio V2 conserva la URL y los guardados. Los controles de Adultos no sustituyen permisos del navegador; la cámara de Rubik sigue requiriendo permiso explícito.

V2 muestra la meta opcional de 100 puntos en Jardín y celebra la cesta llena sin terminar el juego libre. Inicio y Adultos siguen accesibles sobre la pausa manual y el resultado final.
