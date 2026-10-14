# Tareas del MVP de plataforma compartida

## Prototipo realizado

- [x] **T001:** Configurar las rutas principales de la aplicación.
- [x] **T002:** Incorporar selección de temas.
- [x] **T003:** Integrar modales con transición FLIP.
- [x] **T004:** Crear o adaptar controles compartidos de fecha, hora y selectores.
- [x] **T005:** Configurar metadatos, iconos y recursos iniciales de la PWA.
- [x] **T006:** Revisar la responsividad de las vistas principales.
- [x] **T013:** Agregar la variante de navegación Simple para escritorio y conservar el estilo móvil existente.
- [x] **T014:** Reemplazar el logotipo del encabezado de navegación por `public/icons/S.svg`.
- [x] **T015:** Ajustar el logotipo del encabezado con una presentación visual de `24×24` que recorta el espacio transparente del SVG original y mantiene la proporción visual del nav de referencia.
- [x] **T016:** Centrar el logotipo dentro del botón superior de la navegación Simple.
- [x] **T017:** Restaurar en el botón superior de Simple el fondo del tema y el radio circular de `28px`, igual que en la referencia.
- [x] **T018:** Fijar el tamaño de los botones de Simple para evitar que el círculo se deforme al cambiar el tamaño de la ventana.
- [x] **T019:** Mostrar la marca `Peruano Suizo` como `nav-name` en los estilos de navegación con encabezado textual, conservando el formato de la referencia.
- [x] **T020:** Usar un `S-nav.svg` autónomo y limpio, con `viewBox` recortado, como imagen directa de `24×24` para alinear el logotipo con la estructura del nav de referencia.
- [x] **T021:** Restaurar en los botones del nav las variables de `md-ripple` para reutilizar el efecto visual de hover y pulsación de la referencia.
- [x] **T022:** Invalidar la caché de la PWA y versionar `S-nav.svg` para que el navegador cargue la versión corregida del logotipo.
- [x] **T023:** Aplicar el color institucional `#db3331` al texto `Peruano Suizo` del encabezado de navegación.
- [x] **T030:** Mantener en modo oscuro los colores claros de los eventos activos del calendario, respetando el tema seleccionado mediante variables específicas del calendario.
- [x] **T031:** Instalar la dependencia `super-beautiful-toast@0.1.0` para la futura integración de notificaciones.
- [x] **T032:** Montar `ToastHost` global e integrar confirmaciones en las operaciones de trámites, empleados y estudiantes.
- [x] **T033:** Ocultar los iconos predeterminados en las confirmaciones del toast para mantener el tratamiento visual del proyecto.
- [x] **T034:** Agregar el botón flotante del asistente y su panel lateral de 400×786px, siguiendo la estructura visual de referencia y manteniendo el chat simulado local.
- [x] **T035:** Alinear el fondo animado, la textura, los controles y el recorte del chatbot con los estilos proporcionados para impedir que los gradientes desborden el panel.
- [x] **T036:** Posicionar el panel del asistente a la derecha y alineado abajo con el botón; reutilizar el cierre FLIP compartido con la reducción del contenedor sincronizada; usar la paleta y tamaño 56×56px del botón `agent-button` y replicar el flujo local del chat de Inicio.
- [x] **T037:** Alinear el modal del asistente con el markup y scope `f0318d9e` de referencia, retirar clases de backdrop/layout que cambiaban su aspecto y recortar el fondo animado durante el cierre FLIP.
- [x] **T038:** Corregir el cierre del asistente colocando la ventana hija en coordenadas locales del contenedor, reduciendo todos sus límites al tamaño del botón y recuperando la capa de los controles.
- [x] **T039:** Alinear el botón flotante del asistente sobre Opciones en tablet/móvil y mantener visibles e interactivos los controles superiores del chat por encima de su fondo y mensajes.
- [x] **T040:** Evitar la burbuja del mensaje vacío detrás de los controles y ajustar el cierre FLIP del asistente al radio del botón, sin afectar el cierre compartido de los demás modales.
- [x] **T041:** Evitar el doble FLIP del fondo animado del asistente; comprobar en navegador dos ciclos consecutivos de apertura/cierre y que Crear estudiante conserve su cierre.
- [x] **T042:** Hacer persistente el manejo global de `Escape` ante HMR, cerrar solo el modal superior y evitar que pulsaciones repetidas cierren modales inferiores durante la animación; validado con compilación de producción.
- [x] **T043:** Evitar que el formulario de Crear trámite se comprima durante su FLIP de cierre; hacer FLIP solo del contenedor y desvanecer el panel interno, sin cambiar la animación de apertura ni la de otros modales; compilación de producción validada.
- [x] **T044:** Aplicar la estrategia de cierre sin compresión interna a Crear estudiante, sin modificar su animación de apertura ni los demás modales; compilación de producción validada.
- [x] **T045:** Aplicar la estrategia de cierre sin compresión interna a Crear empleado, sin modificar su animación de apertura ni los demás modales; compilación de producción validada.
- [ ] **T046:** Conectar los elementos compartidos del botón y el encabezado de Filtros; aplicar al origen `translate/rotate/scale: none`, transición de opacidad de 80ms, `opacity: 0` y `pointer-events: none`, animar la copia y restaurar estilos al terminar/cancelar. La copia usa `z-index: 10001` sobre el backdrop (`10000`) y, al abrir, toma desde el primer frame el color calculado del icono de destino. Compilación correcta; falta comprobar visualmente el recorrido de apertura y cierre en la instancia activa.
- [x] **T047:** Conectar el icono `download` y el título `Exportar` del botón y modal de exportación con la transición compartida de `FlipModal`; dejar fuera el icono `table` y la opción `Exportar csv`. Compilación de producción validada.
- [x] **T048:** Hacer que los iconos compartidos usen el color calculado del destino tanto al abrir como al cerrar, para regresar al tono original del botón en Filtros y Exportar. Compilación de producción validada.
- [x] **T049:** Alinear el modal de búsqueda hacia la izquierda del control siguiente de la barra, centrado verticalmente con su botón, y animar el icono `search` mediante el elemento compartido de `FlipModal`. Compilación de producción validada.
- [x] **T050:** Evitar la deformación y el blur del input al cerrar Search: contraer solo el contenedor y desvanecer la ventana interna, conservando apertura y vuelo del icono. Compilación y cierre repetido en navegador validados.
- [x] **T051:** Igualar el modal del asistente con la referencia: margen inferior de 8px en escritorio, controles con el `variant-glass` original sin degradados extra e iconos con contraste completo del tema, además del contorno exterior sutil; mantener intactos el contenido del chat y el FLIP de cierre. Compilación de producción validada.
- [x] **T052:** Agregar la confirmación de nueva conversación como `FlipModal` anidado, alineado al panel del asistente, transparente fuera de la tarjeta y con tamaño de referencia (máximo 400px, alto natural ~185px, radio 32px). Reutilizar la apertura FLIP y cerrar solo el contenedor mientras el contenido se desvanece (`container-only`) para evitar aplastamiento; Escape cierra solo la confirmación. Cancelar conserva el borrador. Validado en navegador y compilación de producción.
- [x] **T053:** Aplicar únicamente las reglas de botones del frontend de referencia: base `style-7`, radios, `variant-glass` y `variant-bright`, conservando variables de color del tema y sin importar los estilos de navegación, modales o campos. El botón flotante del agente conserva `position: fixed` con una regla específica para superar la variante. Build y diff validados; el navegador devolvió el árbol accesible pero no permitió capturar una imagen de verificación.
- [x] **T054:** Implementar el menú de tres puntos móvil como un `FlipModal` anclado arriba a la derecha. Las opciones abren sus propios modales anidados desde el elemento seleccionado; al cerrarlos se vuelve al menú y luego al botón. Usar `container-only` para que el contenido no se aplaste y compartir icono/texto entre opciones y destinos.
- [x] **T055:** Adaptar el panel del asistente a pantalla completa móvil (modal exterior a viewport, chat interno con 8px de margen y 40px de radio), manteniendo el panel redondeado inferior-derecho en tablet; validado con medidas del DOM en Chromium y build de producción.
- [x] **T056:** Implementar Configuración como modal anidado desde Opciones, con sidebar adaptable y pestañas accesibles de estilo `pretty-tabs` (verticales en escritorio y horizontales en móvil), reutilizando tema/navegación existentes. El cierre líquido es optativo y aislado en `FlipModal`; validado en Chromium en escritorio, tablet y móvil, con build de producción.
- [x] **T057:** Alinear el sidebar de Configuración con las reglas `pretty-tabs` de la referencia (radio de píldora 32px y reglas móviles a 680px), y cambiar orientación/ARIA entre escritorio y móvil. Se anuló el `min-width: 800px` inline de `FlipModal` dentro del breakpoint móvil para evitar que el modal desborde el viewport; indicador e interacción comprobados en Chromium en escritorio y móvil, con build de producción.
- [x] **T058:** Reproducir la estructura de Cuenta del panel de Configuración (tarjeta con fondo animado, datos disponibles y estado de correo) y dejar vacíos los paneles de Suscripción, General y Agente hasta definir su contenido; validado en Chromium en escritorio y móvil y con build de producción.
- [x] **T059:** Alinear el cierre líquido de Configuración con el JS/CSS de referencia: morph del contenedor al botón, blobs unidos con filtro goo y expansión/desenfoque/desvanecimiento del contenido; quitar la transición CSS conflictiva y restaurar opacidad/estilos del botón al terminar. Conservar intacto el FLIP de los demás modales. Compilación, frame intermedio y origen restaurado validados en Chromium.
- [x] **T060:** Completar también la apertura líquida de Configuración según el flujo observado en Stepbro Money: partir del botón, mezclar el fondo con goo y asentar geometría/radio mientras el panel interno pasa de escala 2 + blur 8px + opacidad 0 a su estado normal. Restaurar estilos temporales tras apertura/interrupción y comprobar apertura, cierre, origen y build en Chromium.
- [x] **T061:** Corregir la cinemática líquida de Configuración contrastándola con el nuevo JS: portar el integrador por frame N8 para posición (apertura con impulso 2400, cierre sin impulso), usar las duraciones y curvas de ancho/alto/radio/contenido de cada rama, y aplicar al origen el fondo `on-background` + radio 64px. Validar modal/origen limpios tras el cierre y compilación de producción.
- [x] **T062:** Evitar que el cierre líquido pinte el botón Configuración con el fondo de apertura `on-background`: al cerrar, usar el fondo calculado del control de origen y conservar el radio de morph. Replicar el cambio de relleno FILL 0→1 del icono seleccionado en las pestañas de Configuración.
- [x] **T064:** Habilitar el panel del asistente como modal flotante en escritorio/tablet: arrastre/acople desde la barra superior, redimensionado por esquinas, límites al viewport y geometría persistente por clave. Corregir el destino para que no acumule el desplazamiento interpolado y amortiguar el movimiento; mantener intacto el panel móvil. Build y pruebas manuales de arrastre, resize y acople en Chromium completados.

## Pendientes de decisión

- [ ] **T007 [USUARIO]:** Confirmar la marca y los textos de la PWA.
- [ ] **T008 [USUARIO]:** Confirmar el gesto de cierre de modales en móvil.
- [ ] **T009 [USUARIO]:** Definir el comportamiento sin conexión.

## Trabajo posterior

- [ ] **T010:** Incorporar pruebas automatizadas de componentes y rutas.
- [ ] **T011:** Verificar instalación y actualización de la PWA en los navegadores objetivo.
- [ ] **T012:** Definir invalidación y actualización de caché.
