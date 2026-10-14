# Plan del MVP de plataforma compartida

## Áreas principales

- `src/App.vue` y el router: estructura general y navegación.
- `src/composables/useTheme.js`: selección de temas.
- `public/themes/`: recursos y estilos de temas.
- `src/composables/useGsap.js` y `src/components/FlipModal.vue`: animaciones y transiciones.
- `src/components/DatePicker.vue`, `TimePicker.vue` y `SelectFlip.vue`: controles compartidos.
- `public/manifest.webmanifest`, service worker e iconos: instalación y metadatos de la PWA.
- `src/assets/styles/frontend.css` y archivos de parches: estilos globales y responsivos.
- `src/assets/styles/patches.css`: reglas de la navegación Simple y su adaptación del encabezado.
- `src/composables/useNavStyle.js`: opción persistente de selección `Simple`.
- `src/components/SettingsModal.vue`, `ModalOptions.vue`, `AppNav.vue`, `FlipModal.vue` y `src/assets/styles/patches.css`: Configuración anidada sobre Opciones con sidebar y patrón `pretty-tabs` de la referencia (indicador compartido vertical en escritorio y horizontal en móvil). Cuenta usa la tarjeta y el estado de correo de referencia con fallbacks honestos si no hay perfil; Suscripción, General y Agente quedan como paneles vacíos hasta definir sus contenidos. La transición líquida reproduce el JS de referencia: resorte con impulso para la posición al abrir, ancho/alto de 300ms y radio de 700ms; al cerrar usa resorte sin impulso para posición, ancho/alto/radio de 250ms y contenido que escala, desenfoca y se desvanece. El origen usa fondo `on-background` y radio de 64px; otros FLIP no cambian.
- `super-beautiful-toast`: dependencia Vue 3 instalada, montada globalmente con `ToastHost` y conectada a las operaciones CRUD del prototipo.
- `src/components/AgentChatbot.vue`, `src/components/FlipModal.vue` y `src/assets/styles/patches.css`: botón flotante y panel abajo a la derecha, con FLIP desde el botón, markup/estilos del scope de chat `f0318d9e`, paleta del tema y contenido recortado durante el cierre.
- El panel del agente habilita las herramientas de modal flotante de `FlipModal` solo en escritorio/tablet: barra superior para arrastrar y acoplar, esquinas para redimensionar, límites al viewport y persistencia local por clave `chat`; los manejadores se ocultan en móvil.
- `AgentChatbot.vue` mide Opciones para igualar el tamaño del asistente en tablet/móvil; solo en móvil lo ancla arriba de Opciones. `patches.css` separa las capas del encabezado de chat y conserva los controles `style-7` en 40×40px.
- El panel móvil del asistente usa una ubicación FLIP dedicada que cubre el viewport completo; la ventana exterior no tiene margen ni radio, y el chat interior conserva 8px de margen y 40px de radio. En tablet y escritorio se mantiene el panel inferior-derecho actual y sus radios.
- El control de nueva conversación abre un `FlipModal` anidado sobre el panel del asistente, sin oscurecer otra vez el viewport. Conserva un ancho máximo de 400px, alto según contenido (aprox. 185px) y radio de 32px; usa la animación compartida desde/hacia el icono y, al cerrar, solo transforma el contenedor mientras desvanece la ventana para que el contenido no se aplaste. No modifica el comportamiento de los demás modales. Cancelar conserva conversación y borrador; Empezar de nuevo los limpia. La pila compartida de `FlipModal` hace que Escape cierre primero la confirmación.
- En `FlipModal.vue`, el chatbot cierra con un único FLIP del contenedor y la ventana interna acompaña al padre mientras se desvanece; los demás modales mantienen la animación de ventana de 2s.
- La capa de botones toma del frontend de referencia solo las reglas visuales de `style-7`, `variant-glass` y `variant-bright`; no importa sus estilos de navegación, modales ni formularios.

## Validación

Comprobar todas las rutas con cada tema, en tamaños de escritorio y móvil. Revisar apertura y cierre de modales, controles de fecha y hora, navegación y metadatos de instalación. Ejecutar `npm run build`.

## Pendientes

Las decisiones de marca, funcionamiento offline, gesto de cierre, pruebas y actualización de caché deben definirse antes de considerar terminada la plataforma.
