# Plan de Calendario

## Enfoque

Registrar la ruta y reutilizar `PlaceholderPage.vue` para mostrar el estado inicial de Calendario. La sección se integrará en la navegación existente sin crear un componente funcional hasta definir los requisitos del calendario escolar.

## Archivos involucrados

- `src/router/index.js`: ruta protegida `/calendario`.
- `src/components/AppNav.vue`: opción visible en escritorio.
- `src/components/ModalOptions.vue`: acceso desde Opciones en móvil.
- `src/pages/PlaceholderPage.vue`: título, icono y mensaje de próxima disponibilidad.

## Validación

Comprobar navegación desde escritorio y móvil, estado activo de la sección, mensaje vacío y protección de la ruta.
