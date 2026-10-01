# Plan del MVP de estudiantes

## Enfoque actual

La implementación debe aprovechar la vista existente de estudiantes, el store de datos simulados y los componentes compartidos. La prioridad es consolidar el comportamiento visual antes de incorporar servicios externos.

## Áreas y componentes

- `src/pages/EstudiantesPage.vue`: estructura de la vista, tarjetas, tabla, lista móvil y acciones.
- `src/stores/data.js`: colección simulada y operaciones locales de creación, edición y eliminación.
- `src/components/ModalCreateStudent.vue`: formulario de alta, incluido el correo institucional.
- `src/components/ModalEditStudent.vue`: detalle y edición del estudiante seleccionado, incluido el correo institucional.
- Contenedor de identidad: muestra el Código encima del DNI; ambos permanecen informativos y el DNI continúa editable solo dentro del formulario de edición.
- Edición contextual: `ModalEditStudent.vue` conserva el detalle y abre el formulario en una segunda instancia de `FlipModal`, usando el botón Editar como origen de la animación y la estructura visual del modal de edición de empleados.
- Contenedor de identidad del estudiante: reserva un área de 320px para el QR y deja el DNI a su derecha en escritorio; en móvil se apila.
- `src/components/ModalDeleteStudent.vue`: confirmación de eliminación.
- `src/components/ModalSearch.vue`, `ModalFilters.vue` y `ModalExport.vue`: controles compartidos de consulta.
- `src/components/FlipModal.vue` y estilos existentes: transición entre registro y detalle.

## Modelo provisional

El registro puede manejar `codigo_alumno`, `dni`, `telefono`, `nombres`, `correo_institucional`, `salon_seccion` y `estado`. El código es el identificador visible del alumno y el modelo es provisional hasta que se definan los campos académicos definitivos.

## Validación

Revisar creación, selección, edición, cancelación, eliminación, búsqueda y filtros con datos simulados. Comprobar todos los temas disponibles y tamaños de escritorio y móvil. Ejecutar `npm run build` al finalizar.

## Pendientes de definición

No implementar todavía campos, estados, paginación o reglas de negocio que no estén aprobados en `spec.md`.
