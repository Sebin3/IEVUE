# Plan del MVP de empleados

## Enfoque actual

La vista conserva su composición visual y consulta hasta 100 docentes a través del endpoint autenticado. La respuesta se conserva en memoria por dos minutos para evitar repetir la misma consulta al salir y volver a la vista; las mutaciones y el cambio de sesión invalidan la caché. No usa registros simulados como fallback. Durante la carga muestra skeletons `animation-loading-1` que mantienen la estructura de KPI y tabla/lista móvil, sin texto visible. Los formularios existentes se conectan a rutas administrativas para alta, edición, cambio de contraseña opcional y desactivación lógica.

## Áreas y componentes

- `src/pages/EmpleadosPage.vue`: resumen, tabla de escritorio, lista móvil y acciones.
- `src/composables/usePagination.js` y `src/components/PaginationControls.vue`: paginación compartida con límite de 12 docentes por página en escritorio y móvil; el control aparece al superar 12. Búsqueda antes de paginar y resumen sobre todos los resultados filtrados.
- `src/services/api.js`: cliente autenticado con Bearer token.
- `src/stores/data.js`: colección en memoria hidratada desde el backend.
- `src/components/ModalCreateEmployee.vue`: formulario de creación; el rol Profesor se asigna en el backend.
- `src/components/ModalEditEmployee.vue`: detalle y edición del docente seleccionado sin modificar su rol.
- `src/components/ModalDeleteEmployee.vue`: confirmación de eliminación.
- `backend_express/src/routes/admin.routes.ts`: endpoints protegidos para alta, edición y desactivación de docentes, con sincronización de `personas`, `docentes` y `usuarios`.
- Componentes compartidos de búsqueda, filtros, exportación, modales y selectores.

## Modelo provisional

El registro puede manejar `id` (docente), `usuario_id`, `rol`, `dni`, `nombres`, `apellidos` y `correo`. La especialidad académica no se muestra como rol o cargo. La contraseña inicial o nueva se envía solo al guardar y el backend la almacena con bcrypt; no se devuelve ni se conserva en el store.

## Integración disponible

- `GET /api/admin/docentes?limit=100`: requiere sesión de administrador; entrega ID de docente/cuenta, rol, correo, estado, nombres, apellidos y DNI.
- `POST /api/admin/docentes`: crea persona, docente y cuenta de profesor; hashea la contraseña y asigna especialidad interna predeterminada.
- `PATCH /api/admin/docentes/:id`: actualiza datos personales, correo y opcionalmente contraseña; conserva rol y especialidad.
- `DELETE /api/admin/docentes/:id`: desactiva docente y cuenta, conservando historial.

## Validación

Revisar creación, selección, edición, cancelación, eliminación, búsqueda, filtros y exportación en escritorio y móvil. Probar todos los temas y ejecutar `npm run build`.

## Pendientes

No enviar contraseñas en las respuestas, logs ni store; no borrar físicamente registros con historial asociado. La activación por correo queda pendiente.
