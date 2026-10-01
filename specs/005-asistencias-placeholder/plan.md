# Plan de Asistencias

## Enfoque

Renombrar la sección de Intenciones como Asistencias y conservar su vista vacía. Se reutilizará `PlaceholderPage.vue` hasta definir el flujo y la información que manejará el módulo.

## Archivos involucrados

- `src/router/index.js`: ruta protegida `/asistencias`.
- `src/components/AppNav.vue`: opción visible en escritorio.
- `src/components/ModalOptions.vue`: acceso desde Opciones en móvil.
- `src/pages/PlaceholderPage.vue`: título, icono y mensaje de próxima disponibilidad.

## Validación

Comprobar la navegación desde escritorio y móvil, el estado activo y la presentación del mensaje vacío.
