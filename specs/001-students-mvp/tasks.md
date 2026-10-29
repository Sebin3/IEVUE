# Tareas del MVP de estudiantes

## Prototipo realizado

- [x] **T001:** Crear la vista de estudiantes con tarjetas de resumen.
- [x] **T002:** Incorporar la tabla para escritorio con la altura estándar de 40px.
- [x] **T003:** Adaptar los registros a una presentación móvil sin desplazamiento horizontal.
- [x] **T004:** Abrir el detalle seleccionado con la transición modal existente.
- [x] **T005:** Permitir revisar, editar, guardar y cancelar desde el modal de estudiante.
- [x] **T006:** Incorporar eliminación desde el detalle y la tabla, con confirmación.
- [x] **T007:** Integrar búsqueda, filtros, exportación y creación siguiendo el patrón de trámites.
- [x] **T008:** Agregar el campo Correo Institucional a la tabla, la búsqueda y la exportación.
- [x] **T009:** Agregar el campo de correo institucional a los modales de creación y edición.
- [x] **T010:** Ajustar el modal lateral de estudiantes al ancho de referencia de 600px en escritorio.
- [x] **T011:** Ajustar el modal lateral de estudiantes a una altura de referencia de 971px en escritorio.
- [x] **T012:** Integrar el contenedor visual del código QR a la izquierda del DNI solo en el detalle informativo.
- [x] **T013:** Mantener el contenedor del DNI con altura automática independiente del QR.
- [x] **T014:** Agregar el campo Código a la tabla, la búsqueda y la exportación de estudiantes, usando `codigo_alumno` como propiedad interna.
- [x] **T015:** Mostrar el Código en un contenedor informativo encima del DNI en el modal de estudiante, también visible durante la edición sin permitir modificarlo.
- [x] **T016:** Presentar el Código en modo edición con el mismo estilo visual de los demás inputs, manteniéndolo de solo lectura.
- [x] **T017:** Agregar el campo Teléfono al modelo simulado, mostrarlo debajo del DNI en el detalle y debajo de nombres y apellidos en los formularios de creación y edición.
- [x] **T018:** Agregar el botón visual de descarga en la esquina superior derecha del contenedor QR y mantenerlo deshabilitado hasta generar un QR real.
- [x] **T019:** Separar el formulario de edición en un modal contextual anclado al botón Editar, sin desplazar el panel de información y usando la estructura visual del modal de empleados.
- [x] **T020:** Corregir la fila inferior de acciones para mantener X y Guardar en una misma línea, igual que en el modal de edición de empleados.
- [x] **T028:** En móvil, abrir Nuevo estudiante, Buscar, Filtros y Exportar desde el modal FLIP del botón de tres puntos; apilar los modales de destino sobre el menú y mantener la barra de escritorio.

## Pendientes de decisión

- [ ] **T021 [USUARIO]:** Confirmar los campos definitivos del estudiante.
- [ ] **T022 [USUARIO]:** Confirmar los estados y sus colores.
- [x] **T023 [USUARIO]:** Definir paginación de 12 estudiantes por página.

## Trabajo posterior

- [ ] **T024:** Incorporar pruebas automatizadas cuando se estabilice la lógica.
- [x] **T025:** Definir el contrato del backend para consulta, edición y retiro lógico.
- [x] **T026:** Restringir las mutaciones al middleware de administrador existente.
- [ ] **T027:** Ejecutar una nueva validación visual después de las decisiones pendientes.
- [x] **T029:** Mostrar 14 estudiantes por página inicialmente en escritorio y móvil con paginación compartida; mantener búsqueda, filtros, KPI y exportación sobre el conjunto completo. Build validado; no se inició localhost.
- [x] **T030:** Sustituir el listado simulado por `GET /api/admin/alumnos?limit=500` con Bearer token, mapear el esquema a la vista y añadir estados de carga/error/vacío; las altas, edición y retiro se conectan a rutas CRUD. Build validado; no se inició localhost.
- [x] **T031:** Seleccionar 1A por defecto, permitir cambiar de salón desde el modal Filtros, cargar opciones con `GET /api/secciones` y consultar solo la sección elegida. Build validado; no se inició localhost.
- [x] **T032:** Reducir a 13 el máximo de estudiantes por página; mantener los controles ocultos hasta superar el límite. Build validado; no se inició localhost.
- [x] **T033:** Mantener el rótulo del KPI como “Alumnos” sin añadir el salón seleccionado. Build validado; no se inició localhost.
- [x] **T034:** Reemplazar el texto del estado de carga por `animation-loading-1`, sin texto visible. Build validado; no se inició localhost.
- [x] **T035:** Mostrar skeletons para KPI y registros de tabla/lista móvil; la tabla conserva sus encabezados, siete columnas y hasta 13 filas. Build validado; no se inició localhost.
- [x] **T036:** Agregar `PATCH /api/admin/alumnos/:id` para actualizar DNI, nombres, apellidos, correo, teléfono y sección activa; conectar formulario, mostrar errores y refrescar el listado.
- [x] **T037:** Agregar `DELETE /api/admin/alumnos/:id` como retiro lógico de matrícula, alumno y usuario relacionado, y conectarlo a la confirmación existente.
- [x] **T038:** Validar `npx tsc --noEmit` en backend y `npm run build` en frontend; no iniciar localhost ni borrar físicamente historial académico.
- [x] **T039:** Ajustar a 12 filas por página y skeleton en Estudiantes; mostrar y habilitar descarga del QR entregado por backend en el detalle. Build validado; no se inició localhost.
- [x] **T040:** Mejorar los selectores de salón con búsqueda, agrupación por grado y alto limitado con scroll interno; usar input `style-2` compacto con radio de 24px a juego con las opciones SelectFlip, integrado al popup, y ocultar la barra de scroll sin desactivar el desplazamiento. Build validado; no se inició localhost.
- [x] **T041:** Al abrir la edición, resolver el salón actual del estudiante por ID o, si el ID no coincide con el catálogo, por nombre normalizado (`1ro A`/`1A`); conservar el ID real para guardar. Build validado; no se inició localhost.
- [x] **T042:** El KPI Inactivos de Estudiantes calcula el total real y muestra `0` cuando no hay registros inactivos, sin guion. Build validado; no se inició localhost.
- [x] **T043:** Crear estudiantes con `POST /api/admin/alumnos`: validar datos/sección del año activo, generar código/QR, crear matrícula y conectar el modal existente. `npm run build` y `npx tsc --noEmit` validados; no se inició localhost.
- [x] **T044:** Completar CRUD de Docentes con endpoints administrativos, hash bcrypt y formularios existentes; mantener baja lógica para preservar historial. `npm run build` y `npx tsc --noEmit` validados; no se inició localhost.
- [x] **T045:** Reducir consultas de directorio a 100 registros y cachear en memoria secciones, estudiantes por salón y docentes durante dos minutos; invalidar la caché al escribir o cambiar de sesión. La revisión de Supabase confirma índices existentes para las relaciones usadas; sus logs recientes muestran timeouts de PostgREST sin ruta identificable, por lo que no se atribuye el 500 a una consulta concreta.
