# Especificación del MVP de estudiantes

## Estado

En progreso. La vista conserva el diseño aprobado y consulta el listado real del backend autenticado.

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
- **RF-ST-08:** La tabla y el resumen deben usar los alumnos devueltos por el backend autenticado, sin sustituir errores de carga por datos simulados.
- **RF-ST-09:** El correo institucional debe poder visualizarse en el detalle, la tabla y la exportación de estudiantes.
- **RF-ST-10:** El detalle del estudiante debe reservar un contenedor informativo para el código QR a la izquierda del DNI en escritorio; el QR no forma parte de los campos editables.
- **RF-ST-11:** El Código del estudiante debe visualizarse en la tabla, permitir búsqueda y formar parte de la exportación.
- **RF-ST-12:** El Código del estudiante debe mostrarse en un contenedor informativo encima del DNI en el modal, sin formar parte de los campos editables.
- **RF-ST-13:** El teléfono del estudiante debe registrarse en los datos simulados, mostrarse debajo del DNI en el detalle, debajo de nombres y apellidos en los formularios de creación y edición.
- **RF-ST-14:** El contenedor de identidad muestra el QR real que devuelve el backend y permite descargarlo; si el backend no entrega un QR, muestra “QR no disponible” y deja la descarga deshabilitada.
- **RF-ST-15:** Al seleccionar Editar desde el detalle, debe abrirse un modal contextual anclado al botón de edición, conservando visible el panel informativo y evitando el desplazamiento del detalle.
- **RF-ST-16:** La tabla de escritorio y la lista móvil muestran hasta 12 estudiantes por página. Los controles aparecen cuando hay más de 12 resultados (más de una página). Búsqueda y filtros se aplican antes de paginar; los resúmenes y la exportación siguen considerando todos los resultados filtrados.
- **RF-ST-17:** Consultar secciones con `GET /api/secciones` y mostrar 1A seleccionado inicialmente. Al cambiar de salón, consultar `GET /api/admin/alumnos?seccion=<sección>&limit=100` con el JWT; el servidor limita cada respuesta a 100 registros. Adaptar los resultados al modelo visual y mostrar skeletons `animation-loading-1` con los mismos encabezados, siete columnas y hasta 12 filas de la tabla de escritorio, y la estructura de lista móvil, sin texto ni datos simulados, además de error recuperable y estado vacío. Las respuestas de secciones y salones ya consultados se conservan en memoria por dos minutos y se invalidan después de una mutación o al cambiar de sesión.
- **RF-ST-18:** El administrador puede actualizar DNI, nombres, apellidos, correo, teléfono y sección del estudiante activo con `PATCH /api/admin/alumnos/:id`; el cambio persiste en las tablas correspondientes y la lista se refresca desde el backend.
- **RF-ST-19:** El administrador puede crear un estudiante activo con `POST /api/admin/alumnos`, asignando una sección del año lectivo vigente, generando su código y QR, y guardando persona, estudiante y matrícula sin contraseñas en texto plano.
- **RF-ST-20:** La acción Eliminar conserva el retiro lógico existente con `DELETE /api/admin/alumnos/:id`, desactivando alumno, matrícula y cuenta vinculada sin borrar historial.
- **RF-ST-19:** El administrador puede retirar un estudiante con `DELETE /api/admin/alumnos/:id` después de confirmar. El retiro es lógico: desactiva alumno, matrícula activa y cuenta vinculada para conservar calificaciones y asistencias históricas.
- **RF-ST-20:** Las mutaciones requieren JWT de administrador, validan identificadores y campos permitidos, y muestran errores del servidor sin cerrar los modales ni presentar cambios ficticios como guardados.
- **RF-ST-21:** Los selectores de salón agrupan las secciones por grado, permiten buscar por nombre o clave (por ejemplo, 3B) y limitan el alto del menú para desplazar sus opciones dentro del popup.

## Requisitos no funcionales

La vista debe respetar los temas disponibles, ser usable en escritorio y móvil, mantener los estados de foco y conservar las animaciones de apertura y cierre existentes.

## Fuera de alcance

Alta de estudiantes; el endpoint actual de listado devuelve únicamente alumnos activos. El borrado físico queda fuera de alcance para preservar asistencias, calificaciones y relaciones históricas.

## Preguntas abiertas

- [ ] Definir los campos definitivos del estudiante.
- [ ] Definir el catálogo de estados y sus reglas.
