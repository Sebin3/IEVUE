# Especificación de Asistencias

## Contexto y objetivo

La ruta `/asistencias` permite consultar jornadas escolares de lunes a viernes, filtrar el historial por mes y año, y abrir un detalle centrado con la pestaña Estadística y las secciones escolares. La pestaña Estadística muestra cómo se distribuyeron las entradas a lo largo de la jornada. Por ahora, los registros horarios son datos locales de interfaz y deberán sustituirse por datos del backend cuando exista la integración QR.

## Requisitos funcionales

- **RF-AS-01:** La ruta `/asistencias` debe estar protegida por autenticación y ser accesible desde la navegación.
- **RF-AS-02:** En escritorio, Asistencias debe aparecer en el menú principal.
- **RF-AS-03:** En móvil, Asistencias debe estar disponible dentro del menú Opciones.
- **RF-AS-04:** Las tarjetas de jornada deben abrir un modal centrado con la pestaña Estadística y las secciones escolares.
- **RF-AS-05:** Estadística debe mostrar las asistencias por minuto durante la jornada, con eje de 7:00 a. m. a 4:00 p. m. y variación según la actividad de cada minuto.
- **RF-AS-06:** Al pasar, tocar o enfocar un punto del gráfico, debe mostrarse un tooltip con la hora y minuto (sin segundos) y la cantidad de asistencias de ese minuto.
- **RF-AS-07:** El gráfico debe adaptarse al ancho disponible y mantener una alternativa vacía cuando la jornada no tenga datos horarios.
- **RF-AS-08:** La serie de interfaz debe coincidir con el total mostrado en la tarjeta de la jornada.
- **RF-AS-09:** Las secciones escolares conservan los KPI y la tabla de estados y horas de ingreso.
- **RF-AS-10:** La gráfica no debe mostrar guías horizontales y debe mostrar el eje horario fijo de 7:00 a. m. a 4:00 p. m.
- **RF-AS-11:** La escala vertical debe dar más recorrido a las variaciones por minuto según su cantidad, sin estirar el gráfico ni sus etiquetas.
- **RF-AS-12:** Cuando una fecha no tenga asistencias, mostrar el mensaje vacío de Estadística centrado dentro del panel.
- **RF-AS-13:** En las secciones escolares, mostrar como máximo 10 registros por página y controles de paginación cuando se supere ese límite.
- **RF-AS-14:** El botón de eliminar de cada jornada debe pedir confirmación y retirar la tarjeta tras confirmar.
- **RF-AS-15:** El botón “Ver” de la tarjeta debe abrir el detalle de la jornada seleccionada.
- **RF-AS-16:** El historial solo debe incluir días laborables de lunes a viernes.
- **RF-AS-17:** Los filtros deben permitir elegir mes y año; la lista debe mostrar como máximo seis tarjetas por página y paginar los días restantes del periodo.
- **RF-AS-18:** El detalle de una jornada debe permitir descargar un CSV con la fecha, total y registros por salón.
- **RF-AS-19:** Los filtros del historial deben permitir seleccionar el periodo (mes y año) y ordenar por fecha o por jornadas con más ausentes, tardanzas, presentes o asistencias totales. No mostrar filtros redundantes de resultado o disponibilidad “con/sin asistencias”; los registros representan jornadas laborables de lunes a viernes. Usar los conteos de cada jornada y aplicar todo localmente hasta integrar backend.

## Fuera de alcance

Lectura real del escáner QR, persistencia/backend, filtros temporales de Estadística, informes descargables y edición de asistencias.
