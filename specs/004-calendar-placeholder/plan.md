# Plan de Calendario de Trámites

## Enfoque

Reemplazar la vista placeholder por un calendario mensual de consulta a ancho completo. Se reutilizarán las clases visuales del `DatePicker` y los datos simulados de `state.tramites`, agrupando los registros por `fecha_creacion` y mostrando cada evento dentro de la tarjeta de su día.

## Archivos involucrados

- `src/router/index.js`: ruta protegida `/calendario`.
- `src/components/AppNav.vue`: opción visible en escritorio.
- `src/components/ModalOptions.vue`: acceso desde Opciones en móvil.
- `src/pages/CalendarPage.vue`: calendario mensual, controles de navegación, filtros y eventos dentro de cada día.
- `src/components/CalendarDayModal.vue`: modal contextual de los trámites de una fecha, con tabs Lista y Agenda.
- `src/assets/styles/patches.css`: distribución responsive, tarjetas diarias y chips de eventos.
- Para la cuadrícula móvil, conservar los chips detallados en escritorio y añadir marcadores compactos; ocultar las fechas adyacentes sin colapsar sus espacios.
- Resaltar el día actual con un círculo temático en escritorio y con una píldora de alto completo en móvil, como en la referencia visual.
- Cada fecha del mes ofrece un botón transparente accesible que cubre su celda completa y abre el detalle diario en escritorio y móvil; en escritorio se conserva el control contextual de ampliar como acceso alternativo.
- El título móvil del mes conserva la misma tipografía de encabezado que las demás vistas; el toolbar se mantiene responsive junto al título.

## Validación

Comprobar navegación desde escritorio y móvil, cambio de mes, filtros, apertura y cierre del detalle diario, cambio entre tabs, fechas con eventos y fechas sin eventos. Ejecutar la compilación de producción.
