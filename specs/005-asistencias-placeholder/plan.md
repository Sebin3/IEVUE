# Plan de Asistencias

## Enfoque

Mantener el detalle de jornada en `AsistenciasPage.vue` y dibujar las asistencias por minuto con SVG, sin añadir dependencias. Distribuir las 800 lecturas simuladas de forma variable en los minutos de la jornada y conservar su total. El tooltip muestra hora y minuto, sin segundos. Mantener el eje de 7:00 a. m. a 4:00 p. m. y ampliar solo la escala vertical del trazado según sus cantidades, sin cambiar dimensiones ni tipografía.

Los registros del historial se limitan a lunes–viernes; el filtro local permite elegir mes, año, disponibilidad de registros y orden por ausentes, tardanzas, presentes o total. Las tarjetas se paginan en grupos de hasta seis. La fecha actual conserva la serie simulada; las fechas restantes mantienen cero hasta conectar QR. Las secciones escolares mantienen sus KPI y tabla de datos temporales solo para jornadas con registros.

## Archivos involucrados

- `src/pages/AsistenciasPage.vue`: datos del historial laboral, filtros y ordenamiento local, paginación, detalle, geometría SVG, tooltip, estado vacío y estilos responsive.
- `src/components/ModalFilters.vue`: selectores locales de mes/año, disponibilidad y orden por conteo para Asistencias.
- `specs/005-asistencias-placeholder/spec.md`: requisitos vigentes del detalle y el gráfico.
- `specs/005-asistencias-placeholder/tasks.md`: seguimiento de implementación.
- `docs/memory.md`: decisión de diseño que debe conservarse.

## Validación

Ejecutar `npm run build`. La verificación visual local es manual y no debe iniciar el servidor sin que el usuario lo solicite.
