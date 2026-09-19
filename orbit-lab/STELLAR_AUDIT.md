# Auditoría de referencia: Stellar Playground

Consulta pública realizada el 19 de septiembre de 2026. Esta es una comparación de funcionalidades documentadas, no una auditoría del código privado de Stellar Playground ni una prueba presencial de la instalación de Frost.

## Identidad y fuentes verificables

1. **Clark Planetarium Productions, ficha oficial del producto**: https://www.clarkplanetariumproductions.org/exhibits/stellarplayground
   - Describe los mecanismos de interacción, evolución, habitabilidad y creación de cuerpos. Es la fuente principal del inventario inferior.
   - Ofrece el producto comercial con un dongle de licencia Keylok y requisitos Windows 10/11, 16 GB RAM y Nvidia RTX 3060 Ti o superior. No publica en esta ficha una licencia abierta, código fuente ni una versión JavaScript descargable.
2. **Ideum, “Phenomenal Cosmic Power: Stellar Playground on Ideum's Widest Touch Table”**, artículo del 6 de septiembre de 2023: https://ideum.com/news/stellar-playground-ideum-pano
   - Atribuye la aplicación a Clark Planetarium y la mesa Pano Dual 49 pulgadas a Ideum.
   - Confirma expresamente la instalación: “You can also find Stellar Playground at Frost Science in Miami”. Por tanto, la referencia del usuario a Frost corresponde al mismo producto, según su proveedor de hardware.
   - Confirma agujeros negros: “feeding the universe [...] into an all-consuming black hole”.
   - Incluye una demostración oficial: https://www.youtube.com/watch?v=KEQEj6jTXDg . Se verificó el enlace embebido; no se ha usado una inspección fotograma a fotograma de ese vídeo como evidencia adicional.
3. **Búsqueda en Frost Science**: https://www.frostscience.org/?s=stellar+playground
   - La búsqueda pública devolvió cero resultados durante esta consulta. No invalida la atribución explícita de Ideum, pero no aporta una segunda ficha funcional del museo.

Las páginas se consultaron mediante peticiones HTTPS públicas. Se extrajo el texto de las fichas excluyendo scripts y estilos; no se accedió a cuentas, credenciales ni sistemas del museo.

## Inventario documentado

| Funcionalidad | Evidencia en la ficha de Clark Planetarium | Consecuencia para la comparación |
| --- | --- | --- |
| Gravedad mutua | “gravitational pull of objects on each other” | Todos los cuerpos interactúan, incluidas las estrellas; no solo orbitan un punto fijo. |
| Cuatro cuerpos iniciales | Sol de 1 masa solar, enana roja de 0,1 masas solares, gigante gaseoso de 100 masas terrestres, planeta de 1 masa terrestre | Paleta de creación diferenciada por masa y naturaleza. |
| Órbitas, colisiones, fusiones y edad | “orbit, collide, combine, and age” | Una fusión debe modificar las propiedades y puede alimentar una evolución posterior. |
| Crecimiento de estrellas | “White Stars”, “Blue stars”, “Giants”, “Super Giants”, “Mega Giants” | Combinar cuerpos genera distintas clases estelares. |
| Remanentes de estrellas | “solar mass dependent scenarios” que producen “White Dwarfs”, “Pulsars”, “Magnetars”, “Black holes” | El desenlace depende de la masa y de la evolución, no de cualquier contacto entre dos planetas. |
| Color, temperatura y longevidad | “Larger mass stars burn hotter and faster” | Las diferencias deben ser visibles y reaccionar a las fusiones. |
| Nebulosas y supernovas | “planetary nebula from low-mass stars or supernovae from more massive stars” | Eventos visuales y generación de remanentes con tipos distintos. |
| Formación secundaria | “Planetary nebula can also condense, forming new protostars and planets” | Existe reciclaje de materia tras eventos estelares. |
| Habitabilidad | Zona de agua líquida cuya distancia depende de la masa de la estrella | El entorno orbital afecta al estado del planeta. |
| Vida y civilizaciones | Vida simple, compleja, agricultura, industria, era nuclear y espacial | Evolución temporal condicionada por habitabilidad; naves que colonizan. |
| Crear, mover y lanzar | Arrastrar desde las paletas; tocar un cuerpo existente para moverlo; velocidad del dedo al soltar | Debe distinguirse tocar un cuerpo existente de crear otro en el vacío. |
| Bloquear | “Locks celestial body into its position and ignores all gravity sources” | Modificador explícito de posición fija. |
| Poner en órbita | “orbit the nearest larger mass star” | La referencia usa la estrella próxima de mayor masa, no necesariamente el cuerpo más masivo de todo el universo. |
| Bloquear + órbita | “enters orbit and ignores other gravity sources” | Asistencia orbital separada de la simulación gravitatoria libre. |
| Multitáctil colaborativo | Hasta 80 contactos en hardware compatible; Ideum describe diez jugadores en Pano | En tablet el límite real depende de su pantalla, sistema y navegador. |
| Información de cada cuerpo | Ideum: “information about each celestial body created” | Una inspección visual compacta puede mostrar tipo, masa y estado. |

## Qué está confirmado y qué no

- **Confirmado:** colisiones, acumulación de masa, envejecimiento estelar, supernovas y agujeros negros son parte del producto. Frost aparece expresamente como instalación del mismo producto.
- **Aportado por el usuario:** en su experiencia del museo, colisionar cuerpos acaba produciendo agujeros negros. Concuerda con la cadena de acumulación/evolución documentada.
- **No documentado en las fuentes consultadas:** umbrales numéricos exactos, tiempos de envejecimiento, algoritmo de colisión, unidades internas, fórmula concreta de habitabilidad, comportamiento de fragmentos, precisión relativista, ajustes de masa mediante sliders, trazas orbitales, guardado, pausa o velocidad configurable. No deben presentarse como una copia exacta de la referencia.
- **Límite científico:** dos planetas ordinarios no se convierten automáticamente en un agujero negro por chocar. Si la adaptación acelera o simplifica acumulación y colapso, esas reglas son una abstracción lúdica propia. Los agujeros negros estelares deben asociarse a un objeto suficientemente masivo y su evolución.
- **Código/arte:** las fuentes públicas permiten estudiar mecánicas, pero no dan permiso para reutilizar código o imágenes comerciales. La adaptación puede tener implementación y arte propios; no debe describirse como el software del museo ejecutado en web.

## Estado local observado antes de esta ampliación

Inspección de `physics.js` y `game.js` realizada antes de cambios de esta tarea:

- Había gravedad mutua, un integrador Verlet y fusión conservando masa y momento; por tanto, no era correcto afirmar que no existía ningún cálculo de colisiones.
- La condición de impacto exigía penetrar hasta el 78 % de la suma de los radios. Solo comprobaba posiciones al finalizar cada paso: cuerpos suficientemente rápidos podían atravesarse entre muestras.
- La fusión conservaba el tipo del cuerpo dominante; no había edad, evolución estelar, supernovas, remanentes ni agujeros negros.
- Había cinco tipos iniciales: planeta oceánico, roca, gigante, cometa y estrella. Había ayudas orbitales automáticas, tres escenarios, trazas, pausa, control temporal, guardado y multitáctil de creación.
- Los contactos sobre el campo creaban objetos; no permitían recoger cuerpos ya existentes.
- El límite de 24 cuerpos y partículas acotadas era una decisión local para móviles antiguos, no una capacidad atribuible al producto del museo.

## Plan de paridad incremental basado en evidencia

1. **Impactos fiables:** detectar cruces dentro del paso, resolver contactos a la suma real de los radios, preservar masa y momento, y emitir eventos claros de fusión. Verificar impactos rápidos, tangencias, cadenas de fusiones y ausencia de NaN.
2. **Evolución y agujeros negros:** mantener edad/etapa, actualizar la clase al acumular masa y resolver finales dependientes de masa con nebulosa o supernova, remanentes y absorción por agujeros negros. Los umbrales y tiempos son parámetros de la adaptación, no valores extraídos del museo. Comprobar que una colisión pequeña no produce injustificadamente un agujero negro y que la cadena masiva sí termina en él.
3. **Interacción de museo adaptada:** recoger y lanzar cuerpos existentes, soltar desde una paleta, órbita respecto a la estrella adecuada y bloqueo explícito. Comprobar multitáctil y captura/cancelación de contactos.
4. **Completar las familias de evolución:** enana roja, estrellas blancas/azules, gigantes, enana blanca, pulsar y magnetar; hacer observables los cambios. Cubrir todas las ramas documentadas con pruebas, manteniendo presupuestos limitados de cuerpos y efectos.
5. **Habitabilidad y vida:** condiciones continuas durante un intervalo, etapas visuales de vida/civilización y colonización; verificar pérdida de condiciones habitables, continuidad de las partidas guardadas y límites de objetos.
6. **Validación de alcance real:** registrar qué mecanismos están implementados, simplificados o pendientes. Validar simulación y uso táctil en Chrome 95 y navegadores actuales; no equiparar ese resultado a medir fluidez en la SM-T530NU física.

Esta secuencia ordena dependencias y pruebas. No afirma que las seis fases ya estén implementadas ni sustituye el registro de validación del cambio final.

## Implementación de esta ampliación (19-09-2026)

Las seis fases anteriores se han implementado con las siguientes adaptaciones explícitas:

| Área | Implementado | Límite o simplificación |
| --- | --- | --- |
| Impactos | Suma completa de radios, detección continua de círculos durante cada desplazamiento Verlet, fusión y absorción | No hay fragmentación ni relatividad. Los anillos, halos y chorros no son superficies sólidas. |
| Evolución | 17 familias; enanas rojas, estrellas blancas/azules, gigantes, enanas blancas, púlsares, magnetares y agujeros negros | Los tiempos y umbrales se inventan para experimentar en segundos, no proceden del código privado del museo. |
| Colapso | Colisiones acumuladas desde masa 90 forman un agujero negro; absorbe cuerpos al contactar | Es una regla de juego. Dos planetas ordinarios no producen un agujero negro real. |
| Reciclaje | Una muerte estelar expulsa el 8 % de masa como nebulosa con retroceso; se condensa en planeta rocoso si masa <1 o en protoestrella en otro caso | A 24 cuerpos no se expulsa un objeto adicional: toda la masa queda en el remanente. No se simula una nube de millones de partículas. |
| Manipulación | Recoger, arrastrar, lanzar, cancelar, bloquear, poner en órbita alrededor de la estrella próxima más masiva y combinar bloqueo+órbita | Hasta diez contactos y 24 cuerpos; la captura física depende del dispositivo. Las restricciones artificiales están señalizadas. |
| Vida | Flujo conjunto de estrellas, zona habitable, seis etapas de vida/civilización, hasta ocho naves colonizadoras; pérdida de vida al perder habitabilidad | No se modelan atmósferas, química, estaciones, ecosistemas ni historia humana; las etapas son iconos educativos. |
| Persistencia | Guardado v2 con edad, masa, radios, etapas, bloqueos y vida; lectura de v1 | Los efectos y las naves en tránsito no persisten. No hay cuenta ni sincronización remota. |
| Escenarios | Solar, binario, sol vacío, colisión, semillero y vida | El escenario «Vida» empieza con un mundo industrial para hacer observable la colonización sin una espera larga. |

El motor conserva masa y momento lineal en impactos libres y eyecciones. Bloquear cuerpos, lanzarlos con el dedo, usar órbitas protegidas o retirar viajeros que salen del área son intervenciones externas y no se presentan como un sistema aislado conservativo. Las estrellas envejecen incluso estando bloqueadas: bloquear es una ayuda espacial, no detener el tiempo.

Pruebas reproducibles: `make -C orbit-lab check`, `npm test -- tests/orbit-evolution.spec.cjs tests/orbit-cancel.spec.cjs`. La suite numérica cubre 12 órbitas, contactos rápidos/rasantes/cadenas, masa/momento, todas las ramas de evolución, eyección, límite de objetos, tamaños, bloqueos, habitabilidad, pérdida de vida y colonización válida. La suite de navegador recorre gestos, plantillas, cancelaciones y guardado real. El resultado completo de dispositivos y despliegue se registra en `docs/RELEASE-20260919.md`.
