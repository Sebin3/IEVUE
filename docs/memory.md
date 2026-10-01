# Memoria del proyecto

Memoria del proyecto entre sesiones. Mantener un máximo de 100 líneas y resumir o eliminar la información que ya no aporte.

## Estado actual

- La tabla de estudiantes conserva la altura estándar de 40px y ahora permite eliminar un registro desde la acción de la tabla, con confirmación.
- La aplicación continúa utilizando datos simulados y la vista de estudiantes mantiene su adaptación para escritorio y móvil.
- El DNI de estudiantes reutiliza la clase `amount plain positive` con un selector compatible con su estructura Vue.
- La tabla de estudiantes incorpora el campo simulado `correo_institucional`, visible también en búsqueda y exportación.
- Los modales de creación y edición de estudiantes permiten registrar y modificar el correo institucional.
- Los modales de creación y edición de empleados muestran el campo `Correo Institucional`, manteniendo internamente la propiedad `email`.
- El modal lateral de detalle de estudiantes utiliza un ancho máximo de 600px en escritorio, manteniendo su comportamiento lateral.
- En escritorio, el modal lateral de estudiantes utiliza `min-height` y `max-height` de 971px para igualar la referencia visual.
- El detalle del modal de estudiantes reserva un contenedor visual de 320px para el QR a la izquierda del DNI en escritorio y lo apila en móvil; el modo edición no muestra el QR.
- El contenedor del DNI no se estira a la altura del QR; conserva una altura automática según su contenido.
- La tabla de estudiantes incorpora Código como primera columna, usa `codigo_alumno` internamente y lo considera en búsqueda y exportación; conserva el icono `tag`.
- El modal de estudiante muestra un contenedor informativo de Código encima del DNI; durante la edición usa el mismo estilo de los inputs y permanece en solo lectura.
- El modelo simulado de estudiantes incorpora `telefono`; se muestra debajo del DNI en el detalle y debajo de nombres y apellidos en creación y edición, sin añadir una columna a la tabla por ahora.
- El contenedor QR incluye un botón de descarga arriba a la derecha; permanece deshabilitado hasta integrar la generación del QR real.
- La edición del estudiante se abre en un segundo `FlipModal` contextual desde el botón Editar; el panel de información permanece abierto y el formulario usa la misma estructura visual que editar empleado.
- La fila inferior del formulario de edición conserva los atributos de estilo del modal de empleados para mantener X y Guardar en la misma línea.
- Se agregó la sección protegida Calendario en escritorio y en Opciones móvil; por ahora reutiliza la vista vacía con el mensaje “Próximamente: Calendario”.
- La sección antes llamada Intenciones ahora se llama Asistencias, usa la ruta `/asistencias` y conserva una vista vacía con el mensaje “Próximamente: Asistencias”.
