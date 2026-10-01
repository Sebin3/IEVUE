# Especificación del MVP de trámites

## Estado

En progreso. La ruta técnica actual continúa siendo `/movimientos`, aunque la interfaz utiliza el nombre “Trámites”.

## Contexto y objetivo

La vista permite registrar, consultar y actualizar solicitudes escolares durante la etapa de prototipado. Debe conservar la presentación de escritorio y la adaptación móvil ya definida para los registros.

## Historias de usuario

- **US-TR-01:** Como usuario, quiero consultar los trámites registrados.
- **US-TR-02:** Como usuario, quiero crear un trámite con los datos de la persona y de la solicitud.
- **US-TR-03:** Como usuario, quiero buscar y filtrar trámites.
- **US-TR-04:** Como usuario autorizado, quiero revisar un trámite y actualizar los campos permitidos.
- **US-TR-05:** Como usuario, quiero distinguir prioridad y estado mediante etiquetas claras y compatibles con el tema visual.

## Requisitos funcionales

- **RF-TR-01:** Mostrar los trámites en tabla de escritorio y en una lista legible para móvil.
- **RF-TR-02:** El formulario de creación debe ordenar DNI, nombres y apellidos, salón y sección, tipo de trámite y descripción.
- **RF-TR-03:** El campo DNI debe incorporar el botón de búsqueda unido visualmente al input.
- **RF-TR-04:** La búsqueda del DNI debe rellenar los nombres cuando encuentre un empleado o registro simulado.
- **RF-TR-05:** Salón y sección y tipo de trámite deben utilizar selectores desplegables.
- **RF-TR-06:** En la edición, tipo de trámite, salón y sección y descripción no deben ser editables.
- **RF-TR-07:** La edición debe permitir gestionar prioridad, estado y resolución según las reglas aprobadas.
- **RF-TR-08:** Los tipos actuales son justificación de inasistencia, solicitud de permiso por un día y solicitud de reunión con un profesor.

## Fuera de alcance

Base de datos, correo electrónico, inteligencia artificial, resolución automática y paginación definitiva.

## Preguntas abiertas

- [ ] Confirmar reglas para asignar prioridad y estado.
- [ ] Definir cómo se registrarán fecha y hora.
- [ ] Definir el flujo de resolución y notificación futura.
