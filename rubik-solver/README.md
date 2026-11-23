# Rubik Solver 3x3

Aplicación web estática servida desde GitHub Pages en:

<https://cmlozanos.github.io/home/rubik-solver/>

## Funcionalidad

- Entrada explícita del patrón por selección de color o por detección de cámara/foto.
- Cubo 3D interactivo con rotación táctil/ratón y pintado directo de pegatinas.
- Diseño mobile-first con paleta táctil sticky y acción de resolver prioritaria.
- Editor plano de las 54 pegatinas en orden `U R F D L B`.
- Entrada asistida por foto/cámara para muestrear una cara cada vez.
- Validación de conteos, piezas, orientaciones y paridad antes de resolver.
- Solución paso a paso con movimientos Singmaster y cubo 3D volumétrico que anima la capa completa de cada giro.
- Slider de velocidad visual persistente para ralentizar o acelerar giros, cambios de vista y transiciones del cubo.
- PWA instalable con manifest, iconos y service worker para cachear los recursos locales y abrir la app sin conexión.

## Algoritmo

El solver usa `cube.js`, librería MIT que implementa el algoritmo de dos fases de Herbert Kociemba para cubos 3x3. El motor se inicializa en un Web Worker para evitar bloquear la interfaz durante la generación de tablas.

Fuentes:

- <https://kociemba.org/math/imptwophase.htm>
- <https://github.com/ldez/cubejs>

## Licencia de terceros

Los archivos en `vendor/cubejs/` proceden de `cubejs@1.3.2` y conservan su licencia MIT en `vendor/cubejs/LICENSE`.

## Family V2 · 2.0.0

Kit local `family-v2/`: fuente Playwrite ES (OFL), tema claro, controles de familia y puntos de la última hora. Los ajustes usan los mismos botones y conservan sus manejadores; la pausa familiar es independiente del reto educativo y de la pausa manual. Todos los modos y contenidos siguen disponibles sin requisitos de rango. No se migran ni borran partidas. Sonido apagado en cada carga. Los cuatro recursos del kit se precachean para uso offline.

Validación local: `make check`. Las pruebas de navegador no sustituyen una tablet física ni conceden permisos de cámara.

Inicio V2 conserva la URL y los guardados. Los controles de Adultos no sustituyen permisos del navegador; la cámara de Rubik sigue requiriendo permiso explícito.

V2 elimina Bootstrap remoto: estilos de controles y layout locales. La entrada manual compacta cabe en móvil y tablet; cámara, editor plano, fuentes desplegadas y solución larga pueden necesitar desplazamiento, sin recortar contenido. Vaciar caras y copiar algoritmo requieren confirmación. La inicialización del solver sigue en su Worker.

`make check-browser`: scramble R real, resolución y ocho giros animados hasta completar; comprueba puntos y funcionamiento con localStorage denegado. Requiere el servidor estático en :4177 y Playwright existente en el catálogo. El guardado bloqueado ya no interrumpe la inicialización del editor.
