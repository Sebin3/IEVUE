# Especificación del MVP de empleados

## Estado

En progreso. La vista se presenta como Docentes y consulta y administra profesores mediante el backend autenticado.

## Contexto y objetivo

La vista debe permitir consultar y administrar docentes del entorno escolar por DNI. El rol de cuenta de todos los registros de esta vista es Profesor; no se debe inferir el rol desde la especialidad académica.

## Historias de usuario

- **US-EM-01:** Como usuario, quiero consultar la lista de empleados.
- **US-EM-02:** Como usuario autorizado, quiero crear y editar empleados mediante un formulario ordenado.
- **US-EM-03:** Como usuario, quiero eliminar un empleado desde su modal de detalle con confirmación.

## Requisitos funcionales

- **RF-EM-01:** La vista debe mostrar resumen, búsqueda, filtros y los docentes devueltos por el backend autenticado.
- **RF-EM-02:** En móvil, cada registro debe mostrar el rol Profesor y presentar la información sin desbordamientos.
- **RF-EM-03:** El formulario de creación debe ordenar DNI, nombres y apellidos, correo institucional y contraseña. El backend asigna el rol Profesor.
- **RF-EM-04:** El modal de detalle debe mostrar las acciones de edición y eliminación sin saturar la lista principal.
- **RF-EM-05:** El listado muestra el rol de cuenta Profesor. Una especialidad académica no sustituye ni modifica el rol.
- **RF-EM-06:** La tabla de escritorio y la lista móvil muestran hasta 12 docentes por página. Los controles aparecen cuando hay más de 12 resultados (más de una página). La búsqueda se aplica antes de paginar y el resumen conserva el total de todos los resultados filtrados.
- **RF-EM-07:** Consultar `GET /api/admin/docentes?limit=100` con el JWT de sesión; el servidor limita cada respuesta a 100 registros. Adaptar el rol de cuenta al modelo visual. Mostrar carga, error recuperable y estado vacío; no inventar fecha de registro que el backend no devuelve. Conservar la respuesta en caché de memoria por dos minutos, invalidándola después de una mutación o al cambiar de sesión.
- **RF-EM-08:** Mostrar skeletons `animation-loading-1` para KPI y filas de tabla/lista móvil, sin texto ni datos simulados. La tabla mantiene sus encabezados, siete columnas y hasta 12 filas mientras carga.
- **RF-EM-09:** Crear, editar y desactivar lógicamente docentes mediante endpoints administrativos protegidos; los datos personales se actualizan en `personas`, los académicos en `docentes` y la cuenta asociada en `usuarios`.
- **RF-EM-10:** La creación requiere DNI, nombres, apellidos, correo y contraseña. El servidor asigna rol Profesor, valida duplicados, guarda la contraseña con bcrypt y no la devuelve en respuestas.
- **RF-EM-11:** La edición permite actualizar datos personales y contraseña opcional, sin cambiar el rol ni la especialidad académica. La acción Eliminar desactiva docente y cuenta asociada para conservar historial.
- **RF-EM-12:** La respuesta del listado incluye el ID del docente y el ID de su cuenta, para que las mutaciones se dirijan al registro académico correcto.
- **RF-EM-13:** La respuesta del listado incluye `rol: profesor`; la vista muestra “Profesor” y no presenta `docentes.especialidad` como cargo.

## Fuera de alcance

Correo de invitación/activación y borrado físico de personas, docentes o cuentas. La API no devuelve fecha de registro.

## Preguntas abiertas

- [ ] Definir la ubicación de acciones en escritorio.
- [x] La contraseña inicial se recibe en el formulario existente y se almacena con bcrypt; una activación/invitación por correo queda fuera de alcance.
