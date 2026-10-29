# Plan del MVP de estudiantes

## Enfoque actual

La vista conserva su estructura visual y consume endpoints autenticados. El selector inicia en 1A y obtiene las opciones con `GET /api/secciones`. Cada cambio consulta `GET /api/admin/alumnos` con el parámetro `seccion` y límite de 100, de modo que el servidor entrega solo el salón seleccionado. Las respuestas de secciones y de cada salón se cachean en memoria durante dos minutos; una operación de escritura o cambio de sesión invalida la caché. Mientras carga, muestra skeletons `animation-loading-1` que conservan la estructura de KPI y tabla/lista móvil, sin texto ni datos simulados. No se descarga el padrón completo de toda la institución. El alta usa `POST /api/admin/alumnos`, la edición `PATCH /api/admin/alumnos/:id` y el retiro `DELETE /api/admin/alumnos/:id`; este último conserva el historial mediante desactivación lógica.

## Áreas y componentes

- `src/pages/EstudiantesPage.vue`: estructura de la vista, tarjetas, tabla, lista móvil y acciones.
- `src/composables/usePagination.js` y `src/components/PaginationControls.vue`: paginación compartida; Estudiantes muestra 12 resultados por página en tabla y lista móvil. El control aparece al superar 12. Filtros/búsqueda se aplican antes del corte y los resúmenes/exportación usan todos los resultados filtrados.
- `src/services/api.js`: cliente autenticado con Bearer token y caché de memoria temporal para consultas repetidas.
- `src/stores/data.js`: colección en memoria hidratada desde el backend.
- `src/components/ModalCreateStudent.vue`: formulario de alta, incluido el correo institucional.
- `src/components/ModalEditStudent.vue`: detalle y edición del estudiante seleccionado, incluido el correo institucional.
- Contenedor de identidad: muestra el Código encima del DNI y el QR que devuelve el backend; permite descargarlo cuando está disponible. El código permanece informativo y el DNI continúa editable solo dentro del formulario de edición.
- Edición contextual: `ModalEditStudent.vue` conserva el detalle y abre el formulario en una segunda instancia de `FlipModal`, usando el botón Editar como origen de la animación y la estructura visual del modal de edición de empleados.
- Contenedor de identidad del estudiante: reserva un área de 320px para el QR y deja el DNI a su derecha en escritorio; en móvil se apila.
- `src/components/ModalDeleteStudent.vue`: confirmación de eliminación.
- `backend_express/src/routes/admin.routes.ts`: rutas protegidas de alta, edición y retiro lógico; el alta crea persona, alumno, matrícula del año vigente y QR; los cambios personales se guardan en `personas`, el cambio de salón en la matrícula activa, y el retiro desactiva matrícula, alumno y usuario relacionado.
- `src/components/ModalSearch.vue`, `ModalFilters.vue` y `ModalExport.vue`: controles compartidos de consulta.
- `SelectFlip.vue`: para salones, agrupa opciones por grado, filtra por texto con el input compartido `style-2`, deja el rótulo fuera del campo y limita el popup a 480px o al espacio visible del viewport; el scroll ocurre en la lista de opciones. Aplicado en Filtros y en la edición desde el detalle.
- `src/components/FlipModal.vue` y estilos existentes: transición entre registro y detalle.

## Modelo provisional

El registro puede manejar `codigo_alumno`, `dni`, `telefono`, `nombres`, `correo_institucional`, `salon_seccion` y `estado`. El código es el identificador visible del alumno y el modelo es provisional hasta que se definan los campos académicos definitivos.

## Integración disponible

- `GET /api/admin/alumnos?seccion=<salón>&limit=100`: requiere sesión de administrador, devuelve alumnos activos con código, datos de persona, sección y QR.
- Las rutas `POST /api/admin/alumnos`, `PATCH /api/admin/alumnos/:id` y `DELETE /api/admin/alumnos/:id` están protegidas por el middleware de administrador. El alta genera código y QR y matricula en la sección elegida del año activo. La edición actualiza los datos personales y la matrícula activa; el retiro desactiva la cuenta y conserva el historial académico. No se borra físicamente.

## Validación

La compilación backend se valida con `npx tsc --noEmit` y el frontend con `npm run build`. La edición se abre desde el icono que ya existe dentro del detalle del estudiante; la fila de la tabla sigue abriendo el detalle y conserva la acción de retirar.

## Pendientes de definición

No implementar todavía campos, estados, paginación o reglas de negocio que no estén aprobados en `spec.md`.
