# Especificación del MVP de empleados

## Estado

En progreso. Esta especificación documenta el área de empleados con datos simulados.

## Contexto y objetivo

La vista debe permitir consultar y administrar empleados del entorno escolar, usando DNI y cargo en lugar de los términos anteriores. Su diseño debe seguir el patrón de trámites y mostrar un detalle al seleccionar un registro.

## Historias de usuario

- **US-EM-01:** Como usuario, quiero consultar la lista de empleados.
- **US-EM-02:** Como usuario autorizado, quiero crear y editar empleados mediante un formulario ordenado.
- **US-EM-03:** Como usuario, quiero eliminar un empleado desde su modal de detalle con confirmación.

## Requisitos funcionales

- **RF-EM-01:** La vista debe mostrar resumen, búsqueda, filtros, exportación y registros simulados.
- **RF-EM-02:** En móvil, cada registro debe priorizar el cargo y presentar la información sin desbordamientos.
- **RF-EM-03:** El formulario de creación debe ordenar DNI, nombres y apellidos, correo institucional, contraseña y cargo.
- **RF-EM-04:** El modal de detalle debe mostrar las acciones de edición y eliminación sin saturar la lista principal.
- **RF-EM-05:** Los cargos deben utilizar un catálogo escolar como profesor, administrador, subdirector o auxiliar.

## Fuera de alcance

Contraseñas reales, autenticación, permisos, correo de notificación y conexión con backend.

## Preguntas abiertas

- [ ] Confirmar el catálogo final de cargos.
- [ ] Definir la ubicación de acciones en escritorio.
- [ ] Definir si la contraseña se manejará en una etapa de activación.
