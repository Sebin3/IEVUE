# Especificación del MVP de estudiantes

## Estado

En progreso. Esta especificación documenta la vista de estudiantes durante la etapa de prototipado.

## Contexto y objetivo

La aplicación necesita una vista para consultar y administrar estudiantes con el mismo lenguaje visual utilizado en trámites y empleados. La vista debe funcionar con datos simulados y permitir validar el flujo antes de conectar servicios reales.

## Usuarios

- Personal autorizado que consulta la información de estudiantes.
- Personal encargado de registrar, actualizar o retirar estudiantes del prototipo.

## Historias de usuario

- **US-ST-01:** Como usuario, quiero abrir la vista de estudiantes desde la navegación para consultar el registro.
- **US-ST-02:** Como usuario, quiero revisar un resumen y una tabla de estudiantes para conocer el estado general.
- **US-ST-03:** Como usuario, quiero seleccionar un estudiante para ver su información en un panel o modal lateral.
- **US-ST-04:** Como usuario autorizado, quiero crear, editar y eliminar un estudiante mediante formularios claros.

## Requisitos funcionales

- **RF-ST-01:** La ruta de estudiantes debe mostrar tarjetas de resumen y una tabla en escritorio con Código, DNI, nombre, correo institucional, salón y sección, estado y acciones.
- **RF-ST-02:** En móvil, los registros deben presentarse como una lista o tarjetas legibles sin desplazamiento horizontal.
- **RF-ST-03:** Al seleccionar un registro, debe abrirse el detalle usando la transición modal existente.
- **RF-ST-04:** El detalle debe permitir editar, guardar o cancelar los cambios.
- **RF-ST-05:** Los formularios de creación y edición deben permitir registrar y actualizar el correo institucional.
- **RF-ST-06:** La eliminación debe solicitar confirmación antes de retirar el registro simulado.
- **RF-ST-07:** La vista debe reutilizar búsqueda, filtros, exportación y creación con el patrón visual existente.
- **RF-ST-08:** El prototipo debe usar datos simulados y no debe afirmar que existe una conexión con backend.
- **RF-ST-09:** El correo institucional debe poder visualizarse en el detalle, la tabla y la exportación de estudiantes.
- **RF-ST-10:** El detalle del estudiante debe reservar un contenedor informativo para el código QR a la izquierda del DNI en escritorio; el QR no forma parte de los campos editables.
- **RF-ST-11:** El Código del estudiante debe visualizarse en la tabla, permitir búsqueda y formar parte de la exportación.
- **RF-ST-12:** El Código del estudiante debe mostrarse en un contenedor informativo encima del DNI en el modal, sin formar parte de los campos editables.
- **RF-ST-13:** El teléfono del estudiante debe registrarse en los datos simulados, mostrarse debajo del DNI en el detalle, debajo de nombres y apellidos en los formularios de creación y edición.
- **RF-ST-14:** El contenedor del código QR debe mostrar un botón de descarga en la esquina superior derecha, deshabilitado mientras el QR real no esté disponible.
- **RF-ST-15:** Al seleccionar Editar desde el detalle, debe abrirse un modal contextual anclado al botón de edición, conservando visible el panel informativo y evitando el desplazamiento del detalle.

## Requisitos no funcionales

La vista debe respetar los temas disponibles, ser usable en escritorio y móvil, mantener los estados de foco y conservar las animaciones de apertura y cierre existentes.

## Fuera de alcance

Base de datos, autenticación real, permisos, importación masiva y definición definitiva de paginación.

## Preguntas abiertas

- [ ] Definir los campos definitivos del estudiante.
- [ ] Definir el catálogo de estados y sus reglas.
- [ ] Definir si la paginación será necesaria y cuál será el tamaño de página.
