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
