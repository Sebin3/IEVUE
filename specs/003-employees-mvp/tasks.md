# Tareas del MVP de empleados

## Prototipo realizado

- [x] **T001:** Actualizar la vista para usar DNI y cargo.
- [x] **T002:** Ordenar el formulario como DNI, nombres y apellidos, correo institucional, contraseña y cargo.
- [x] **T003:** Incorporar cargos escolares, incluyendo auxiliares.
- [x] **T004:** Adaptar la presentación móvil para destacar el cargo.
- [x] **T005:** Integrar creación, selección, edición, eliminación, búsqueda, filtros y exportación.
- [x] **T011:** En móvil, abrir Crear empleado y Buscar desde el modal FLIP del botón de tres puntos; apilar el modal de destino sobre el menú y mantener la barra de escritorio.
- [x] **T012:** Mostrar 12 docentes por página en escritorio y móvil con la paginación compartida; conservar el total del resumen y aplicar búsqueda antes de paginar. Build validado; no se inició localhost.

## Pendientes de decisión

- [ ] **T006 [USUARIO]:** Confirmar el catálogo final de cargos.
- [ ] **T007 [USUARIO]:** Confirmar la ubicación de acciones en la vista de escritorio.
- [ ] **T008 [USUARIO]:** Definir el flujo futuro de activación y contraseña.

## Trabajo posterior

- [ ] **T009:** Incorporar pruebas automatizadas.
- [ ] **T010:** Diseñar autenticación, autorización y almacenamiento seguro.
- [x] **T013:** Sustituir docentes simulados por `GET /api/admin/docentes?limit=500`, mapear personas y cuentas, y añadir estados de carga/error/vacío. No fingir fecha de registro. Build validado; no se inició localhost.
- [x] **T014:** Sustituir el texto de carga por skeletons `animation-loading-1` para KPI y filas de tabla/lista móvil; conservar encabezados, siete columnas y hasta 12 filas. Build validado; no se inició localhost.
- [x] **T015:** Exponer listado y CRUD protegido de Docentes enlazando personas, docente y cuenta; hashear contraseñas y desactivar lógicamente al retirar. `npx tsc --noEmit` validado.
- [x] **T016:** Conectar alta, edición y eliminación de Docentes a los formularios actuales y refrescar el listado tras cada operación. `npm run build` validado; no se inició localhost.
- [x] **T017:** Separar el rol fijo Profesor de `docentes.especialidad`; mostrar Profesor en la lista y quitar el selector de cargo para evitar que especialidad “Cursos” parezca un rol. Build y TypeScript validados.
- [x] **T018:** Limitar la consulta de docentes a 100 y reutilizar durante dos minutos la respuesta en memoria; invalidar al guardar cambios o cambiar de sesión. Revisar advisories e índices de Supabase; los logs disponibles muestran timeouts de PostgREST sin URI de solicitud. Build validado; no se inició localhost.
