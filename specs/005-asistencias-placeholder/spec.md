# Especificación de Asistencias

## Contexto y objetivo

La ruta `/asistencias` permite consultar jornadas escolares reales de lunes a viernes, filtrar el historial por mes y año, y abrir un detalle centrado con la pestaña Estadística y las secciones activas del backend. El historial usa los conteos agregados por fecha; el detalle obtiene los registros de esa fecha y calcula el gráfico por minuto con sus horas reales de ingreso. No se generan estudiantes, fechas ni asistencias de muestra.

## Requisitos funcionales

- **RF-AS-01:** La ruta `/asistencias` debe estar protegida por autenticación y ser accesible desde la navegación.
- **RF-AS-02:** En escritorio, Asistencias debe aparecer en el menú principal.
- **RF-AS-03:** En móvil, Asistencias debe estar disponible dentro del menú Opciones.
- **RF-AS-04:** Las tarjetas de jornada deben abrir un modal centrado con la pestaña Estadística y las secciones escolares.
- **RF-AS-05:** Estadística debe mostrar las asistencias reales por minuto durante la jornada, con eje de 7:00 a. m. a 4:00 p. m. y variación según la actividad de cada minuto.
- **RF-AS-06:** Al pasar, tocar o enfocar un punto del gráfico, debe mostrarse un tooltip con la hora y minuto (sin segundos) y la cantidad de asistencias de ese minuto.
- **RF-AS-07:** El gráfico debe adaptarse al ancho disponible y mantener una alternativa vacía cuando la jornada no tenga datos horarios.
- **RF-AS-08:** Las tarjetas y filtros usan los conteos agregados por fecha del backend; el gráfico usa las horas del detalle diario. El resumen de Inicio agrega presentes y tardanzas y excluye ausentes.
- **RF-AS-09:** Las secciones se obtienen del catálogo del backend y la tabla muestra los registros reales y conteos de estado entregados para la jornada.
- **RF-AS-10:** La gráfica no debe mostrar guías horizontales y debe mostrar el eje horario fijo de 7:00 a. m. a 4:00 p. m.
- **RF-AS-11:** La escala vertical debe dar más recorrido a las variaciones por minuto según su cantidad, sin estirar el gráfico ni sus etiquetas.
- **RF-AS-12:** Cuando una fecha no tenga asistencias, mostrar el mensaje vacío de Estadística centrado dentro del panel.
- **RF-AS-13:** En las secciones escolares, mostrar como máximo 10 registros por página y controles de paginación cuando se supere ese límite.
- **RF-AS-14:** El botón de eliminar de cada jornada debe pedir confirmación y retirar la tarjeta tras confirmar.
- **RF-AS-15:** El botón “Ver” de la tarjeta debe abrir el detalle de la jornada seleccionada.
- **RF-AS-16:** El historial solo debe incluir días laborables de lunes a viernes.
- **RF-AS-17:** Los filtros deben permitir elegir mes y año; la lista debe mostrar como máximo seis tarjetas por página y paginar los días restantes del periodo.
- **RF-AS-18:** El detalle de una jornada debe permitir descargar un CSV con la fecha, total y registros por salón.
- **RF-AS-19:** Los filtros del historial deben permitir seleccionar el periodo (mes y año) y ordenar por fecha o por jornadas con más ausentes, tardanzas, presentes o asistencias totales. No mostrar filtros redundantes de resultado o disponibilidad “con/sin asistencias”; los registros representan jornadas laborables de lunes a viernes. Aplicar la ordenación local sobre los conteos reales recibidos.
- **RF-AS-20:** Consultar el historial con `GET /api/admin/asistencia/historial?desde=&hasta=` usando un solo rango por filtro y una caché corta en memoria separada por sesión.
- **RF-AS-21:** Consultar el detalle solo al abrir una jornada con `GET /api/admin/asistencia/fecha?fecha=`; no descargar registros por salón por adelantado.
- **RF-AS-22:** Al vencer el token o responder el backend `401`, limpiar la sesión y volver a Login sin renderizar Inicio como vista de paso.
- **RF-AS-23:** El gráfico por minuto se adapta al ancho real de su panel y aumenta su espacio vertical en móvil sin deformar el eje horario.
- **RF-AS-24:** Mientras se consulta el historial, mostrar skeletons animados del mismo tamaño que las tarjetas; si el rango no tiene registros, mostrar el contenedor vacío amplio y centrado, sin una franja con texto de carga.

- **RF-AS-25:** Profesor y Administrador pueden corregir el estado de un registro desde la fila del alumno en el detalle diario: Presente, Tardanza, Ausente o Justificado. Profesor consulta y corrige únicamente las secciones que tiene asignadas; solo Administrador puede eliminar registros. Guardar mediante `PUT /api/asistencia/:id`, validar rol, alcance y estado en backend, y actualizar conteos e historial. Justificado cuenta como ausencia en el resumen de jornadas.
- **RF-AS-26:** El historial abre en la semana laboral actual (lunes a viernes), permite navegar a semanas anteriores y alternar a consulta mensual. Solo mostrar días con registros reales; no generar tarjetas vacías. Sábado y domingo no son días válidos para crear sesiones, registrar asistencia QR/manual, registrar ausentes o cerrar una sesión que genere ausencias. Validar la regla en frontend para el flujo de consulta y en backend para cada operación de escritura, usando fecha de Lima.
## Fuera de alcance

Lectura en vivo del escáner QR, nuevos informes o exportaciones agregadas y filtros temporales dentro de Estadística.
