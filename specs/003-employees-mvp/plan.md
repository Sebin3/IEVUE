# Plan del MVP de empleados

## Enfoque actual

La implementación reutilizará la composición visual de trámites y el patrón de selección con modal. El correo se conserva en el formulario y el cargo será el dato destacado en móvil.

## Áreas y componentes

- `src/pages/EmpleadosPage.vue`: resumen, tabla de escritorio, lista móvil y acciones.
- `src/stores/data.js`: colección simulada y operaciones locales.
- `src/components/ModalCreateEmployee.vue`: formulario de creación con el orden aprobado.
- `src/components/ModalEditEmployee.vue`: detalle y edición del empleado seleccionado.
- `src/components/ModalDeleteEmployee.vue`: confirmación de eliminación.
- Componentes compartidos de búsqueda, filtros, exportación, modales y selectores.

## Modelo provisional

El registro puede manejar `id`, `dni`, `nombres`, `correo` y `cargo`. La contraseña no debe persistirse como una credencial real en esta etapa.

## Validación

Revisar creación, selección, edición, cancelación, eliminación, búsqueda, filtros y exportación en escritorio y móvil. Probar todos los temas y ejecutar `npm run build`.

## Pendientes

No implementar autenticación, permisos ni activación de contraseñas hasta que exista una especificación de backend y seguridad.
