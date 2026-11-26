# Tareas de Asistencias

## Prototipo realizado

- [x] **T001:** Renombrar la sección visible de Intenciones a Asistencias.
- [x] **T002:** Registrar la ruta protegida `/asistencias`.
- [x] **T003:** Actualizar el acceso de escritorio y móvil.
- [x] **T004:** Mostrar la vista vacía con el mensaje “Próximamente: Asistencias”.
- [x] **T008:** Agregar a Estadística el gráfico horario SVG con área, tooltip accesible y estado vacío para jornadas sin datos; serie de hoy con 800 registros por intervalos de una hora, gráfico alineado abajo y `npm run build` correcto.
- [x] **T009:** Retirar las guías horizontales y mantener fijas las horas mientras la escala vertical se ajusta a los conteos; `npm run build` completó correctamente.
- [x] **T010:** Extender las etiquetas del eje horario hasta las 4:00 p. m. sin cambiar el tamaño ni el comportamiento del gráfico.
- [x] **T011:** Asignar los 800 registros simulados únicamente a la fecha local de hoy; mantener en cero los días anteriores y mostrar la cantidad de cada minuto en el tooltip, sin segundos.
- [x] **T012:** Dar más altura a los picos de la línea según el conteo por minuto, sin deformar el gráfico ni sus etiquetas; ajuste fino posterior para elevarlos un poco más.
- [x] **T013:** Centrar el estado “No hay asistencias registradas” en el panel de Estadística cuando el día esté vacío.
- [x] **T014:** Mostrar gráfico y datos de salón solo si el día tiene asistencias; con total cero, ocultar KPI/tabla, centrar el estado vacío y reutilizar el fondo `light-color` de Estadística.
- [x] **T015:** Limitar a 10 los registros visibles por sección escolar y reutilizar los controles de paginación existentes cuando se exceda ese límite.
- [x] **T016:** Preparar 20 registros simulados por salón para visualizar la paginación de dos páginas en la vista previa.
- [x] **T017:** Conectar Eliminar en tarjetas de cuadrícula y filas de lista con confirmación y retirada reactiva de la jornada.
- [x] **T018:** Reemplazar “Marcar” por “Ver” en la tarjeta y conectar la acción al detalle de la jornada.
- [x] **T019:** Limitar el historial a lunes–viernes, agregar filtro de mes/año y paginar hasta seis tarjetas para recorrer el periodo.
- [x] **T020:** Añadir al detalle de jornada un botón que descarga el CSV del registro seleccionado.
- [x] **T021:** Ampliar Filtros con estado de asistencia y ordenamiento por ausentes, tardanzas, presentes, total o fecha, manteniendo mes/año, disponibilidad y paginación de seis jornadas. Build validado; no se inició localhost.
- [x] **T022:** Simplificar los filtros del historial: quitar disponibilidad y filtros redundantes por resultado; mantener periodo y ordenar con opciones explícitas “Jornadas con más …” por conteo o fecha. Validado con build; localhost ya estaba abierto y no se inició.

## Pendientes

- [ ] **T005:** Definir la estructura de registros de asistencia.
- [ ] **T006:** Diseñar el flujo de marcación y consulta.
- [ ] **T007:** Definir permisos, reportes y conexión con datos reales.

- [x] **T023:** Conectar el historial a `GET /api/admin/asistencia/historial` y a las secciones de `GET /api/secciones`; eliminar muestras de fechas, salones, estados y horarios; conservar fechas laborables y paginación de seis.
- [x] **T024:** Conectar detalle diario, gráfico por minuto y CSV a `GET /api/admin/asistencia/fecha`; conectar eliminación confirmada a `POST /api/asistencia/eliminar-batch`.
- [x] **T025:** Conectar el resumen de Inicio al endpoint agregado; Semana/Mes consulta rangos y agrega presentes más tardanzas, excluyendo ausentes.
- [x] **T026:** Hacer el chart diario responsivo con ancho medido y mayor altura en móvil; mantener el eje horario y no deformar sus etiquetas.
- [x] **T027:** Manejar expiración del JWT y respuestas HTTP 401 en el guard y en un manejador central para volver a Login sin renderizar Inicio.
- [ ] **T028:** Validación visual en Chromium desktop/móvil pendiente porque el permiso guardado del navegador bloqueó el origen localhost; `npm run build` pasó.
- [ ] **T029:** Confirmar en despliegue que existe la función Supabase `resumen_asistencias_por_rango`; si no está, reemplazar el fallback que lee filas crudas por una agregación SQL en backend.
- [x] **T030:** Reemplazar la franja de carga por skeletons `animation-loading-1`; cuando no hay datos, reutilizar exactamente el placeholder preexistente de `PlaceholderPage.vue` (`content-box light-color`, icono `nest_clock_farsight_analog` y texto “No se encontraron Asistencias”). Usar skeletons para carga de chart/tabla dentro del detalle.
- [x] **T031:** Afinar el responsive de Asistencias: alinear título y menú de tres puntos en una fila sin cambiar la tipografía compartida, ocultar la toolbar vacía en móvil, reducir el botón a 48/44px y asegurar tamaño/ancho útiles del placeholder vacío. Build validado; revisión visual en navegador pendiente por el bloqueo de acceso previo al origen local.
- [x] **T032:** Reenviar el evento de origen desde las acciones del menú móvil de Asistencias a `useModal.show` para que Filtros y Buscar usen el mismo anclaje FLIP que las demás vistas. Build validado; revisión visual en navegador pendiente por el bloqueo de acceso previo al origen local.
- [x] **T033:** Usar el serializador CSV compartido que escapa campos y neutraliza valores con prefijo de fórmula en la descarga diaria. `pnpm build` validado.
- [x] **T034:** Añadir edición contextual del estado en cada fila del detalle para Profesor/Administrador, consumir `PUT /api/asistencia/:id`, permitir Presente/Tardanza/Ausente/Justificado y refrescar conteos. Profesor solo consulta y edita sus secciones; el backend reserva bajas a Administrador. Validado con build frontend y `tsc --noEmit` del backend.
- [x] **T035:** Mostrar por defecto solo jornadas registradas de la semana laboral, navegar semanas previas y conservar consulta mensual sin tarjetas vacías. Rechazar en backend operaciones de escritura de asistencia en sábado/domingo y evitar que el registro manual guarde con una fecha distinta a la sesión. `pnpm build` y `tsc --noEmit` validados; revisión visual autenticada pendiente porque localhost abrió el login y no se pudo usar una sesión válida.
