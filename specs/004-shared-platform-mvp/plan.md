# Plan del MVP de plataforma compartida

## Áreas principales

- `src/App.vue` y el router: estructura general y navegación.
- `src/composables/useTheme.js`: selección de temas.
- `public/themes/`: recursos y estilos de temas.
- `src/composables/useGsap.js` y `src/components/FlipModal.vue`: animaciones y transiciones.
- `src/components/DatePicker.vue`, `TimePicker.vue` y `SelectFlip.vue`: controles compartidos.
- `public/manifest.webmanifest`, service worker e iconos: instalación y metadatos de la PWA.
- `src/assets/styles/frontend.css` y archivos de parches: estilos globales y responsivos.

## Validación

Comprobar todas las rutas con cada tema, en tamaños de escritorio y móvil. Revisar apertura y cierre de modales, controles de fecha y hora, navegación y metadatos de instalación. Ejecutar `npm run build`.

## Pendientes

Las decisiones de marca, funcionamiento offline, gesto de cierre, pruebas y actualización de caché deben definirse antes de considerar terminada la plataforma.
