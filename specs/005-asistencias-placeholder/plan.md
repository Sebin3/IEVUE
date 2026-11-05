# Plan de Asistencias

## Enfoque

Conectar la vista con las rutas existentes del Express, sin modificar el backend ni agregar dependencias:

- `GET /api/admin/asistencia/historial?desde=&hasta=` para una consulta agregada por periodo. Generar localmente solo las fechas laborables del rango y completar conteos ausentes con cero para conservar la vista vacía por fecha.
- `GET /api/admin/asistencia/fecha?fecha=` únicamente al abrir una jornada; usar sus registros reales para tabla, estados, horas, gráfico y CSV.
- `GET /api/secciones` para crear la navegación por salones disponibles.
- `POST /api/asistencia/eliminar-batch` después de recuperar los IDs de la fecha; actualizar el historial al confirmar.
- Inicio consulta el mismo endpoint agregado. Semana muestra lunes–viernes de la semana actual (o la última semana completa durante fin de semana); Mes suma presentes y tardanzas por día laborable del mes actual. Ausentes no se incluyen en ese gráfico.

La caché en memoria de los resúmenes dura 30 segundos y se separa por sesión; catálogo de secciones usa la caché compartida existente. Detalle y mutaciones no se cachean. Abortar solicitudes obsoletas al cambiar de rango, cerrar el detalle o desmontar la vista.

El gráfico de detalle conserva SVG, tooltip y eje de 7 a. m. a 4 p. m.; mide el ancho del panel y reserva 340px en móvil para que no se comprima el trazado. No inventar actividad, horarios, días o alumnos.

Los estados de carga usan `animation-loading-1` con skeletons de seis tarjetas, el chart o la tabla según la vista. Si el endpoint confirma un rango vacío, mostrar el panel vacío amplio `light-color` con icono y mensaje centrados; no mostrar una tarjeta angosta con “Cargando asistencias”.

Autenticación: validar `exp` del JWT durante navegación, programar expiración activa y manejar los `401` de API en un solo evento que limpia el store y navega a Login; no redirigir a Inicio durante el vencimiento.

## Archivos involucrados

- `src/pages/AsistenciasPage.vue`: historial, detalle, gráfico, estados de carga/error/vacío, descarga y eliminación conectados.
- `src/pages/InicioPage.vue`: resumen semanal/mensual conectado.
- `src/services/api.js`: caché TTL configurable y señal común de sesión expirada.
- `src/stores/auth.js`, `src/router/index.js`, `src/main.js`: expiración de token y redirección centralizada.
- `specs/005-asistencias-placeholder/{spec.md,plan.md,tasks.md}` y `docs/memory.md`: trazabilidad.

## Validación

Ejecutar `npm run build`. Comprobar en Chromium Inicio, filtros, detalle, chart responsive, CSV, eliminación y expiración de sesión en escritorio y móvil. La prueba visual de localhost queda pendiente si el navegador bloquea el permiso de origen.
