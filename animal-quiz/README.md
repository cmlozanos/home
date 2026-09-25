# Quiz de Animales: versión estática

Aprobación: el 2026-09-25 el usuario confirmó progreso exclusivamente local por dispositivo, sin sincronización ni migración. Los datos y servicios antiguos permanecen intactos. Esta variante no publica nombres ni edades personales y sustituye solo la antigua entrada de redirección de la home.

Conserva los 20 animales y los distractores originales. Cada ronda baraja las cuatro alternativas sin cambiar cuál es correcta. Acertar suma una estrella y aumenta la racha; fallar reinicia la racha y aumenta el peso de esa pregunta. Escribir correctamente añade otra estrella. Se conservan los cinco hitos: primer acierto, rachas de 3 y 5, primera palabra y 50 estrellas.

Los perfiles genéricos **A B C** y **A … Z** guardan por separado el progreso de tres primeras letras y palabra completa. El teclado incluye Ñ y las vocales acentuadas o diéresis necesarias para la palabra. También admite teclado físico. Los textos educativos se mantienen: las ilustraciones no sustituyen las alternativas por un ejercicio distinto de emparejar dibujos.

Cada apertura exige el reto común (suma, resta o trazo); se repite cada diez minutos desde la resolución, también contando el tiempo fuera de la aplicación. Las transiciones se congelan mientras está bloqueado, oculto o con la ayuda abierta. No se conceden estrellas por resolver ese reto: son independientes del Quiz.

La partida usa únicamente la clave `animal-quiz:local:v1` de localStorage. No escribe nada antes de responder en el Quiz, no recupera perfiles de otro servidor ni realiza llamadas API. Si el navegador impide guardar, funciona durante la sesión y muestra un aviso. No se borran otras claves. Limpiar los datos del navegador elimina el progreso local; otra tablet tendrá su propio progreso.

Juego silencioso, sin WebGL, emojis como gráficos de animales, CDNs, dependencias de red para jugar ni fuentes remotas. Los dibujos son SVG propios. La PWA conserva sus recursos y el reto educativo sin borrar cachés de otros juegos. Instalar desde el menú del navegador después de una primera carga con conexión. El botón de casa abre el catálogo `https://cmlozanos.github.io/games/`.

## Desarrollo y validación

- `make check`: sintaxis, reglas, los 20 animales, rangos, aislamiento de perfiles, validación de guardado e integridad PWA.
- `make icons`: genera PNG de 192 y 512 desde `icon.svg`; requiere Playwright instalado en el entorno del proyecto y un navegador disponible.
- `make preview-art`: genera una hoja de los 20 dibujos en `art-preview.png` para revisión visual; es un artefacto local excluido de Git.
- `make serve`: servidor estático local en el puerto 8080.

Las pruebas de navegador están en `tests/animal-quiz.spec.cjs` del catálogo, y completan el reto real mediante clics y trazos. La compatibilidad objetivo es Chrome 95; emular ese navegador no sustituye la prueba física en Android antiguo.

Verificación del 25-09-2026: 39 pruebas de navegador correctas entre tablet,
teléfono vertical/horizontal, WebKit y Chromium 95.0.4630.0; una prueba offline
omitida en WebKit por la limitación de su emulación de red. Revisadas las
pantallas de perfiles, preguntas y escritura, y las veinte ilustraciones.
`make check check-games` del catálogo también comprueba los recursos versionados
y que la caché del Quiz no borra las de otros juegos. Falta probar el dispositivo
Android físico; no se presenta el motor de escritorio como esa tablet.
