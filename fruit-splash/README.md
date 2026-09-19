# Fruit Splash

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
