# Especificación de Calendario de Trámites

## Contexto y objetivo

La aplicación necesita una sección de calendario para consultar visualmente los trámites según su fecha de creación. El calendario utiliza datos simulados mientras no exista una conexión con el backend.

## Requisitos funcionales

- **RF-CA-01:** La ruta `/calendario` debe estar protegida por autenticación y ser accesible desde la navegación.
- **RF-CA-02:** En escritorio, Calendario debe aparecer como una sección del menú principal.
- **RF-CA-03:** En móvil, Calendario debe estar disponible dentro del menú Opciones.
- **RF-CA-04:** La vista debe mostrar un calendario mensual con navegación entre meses.
- **RF-CA-05:** Cada fecha con trámites debe mostrar indicadores visuales según los eventos registrados.
- **RF-CA-06:** Los eventos deben mostrarse dentro de la tarjeta del día correspondiente, con el nombre de la persona solicitante y la hora de creación.
- **RF-CA-07:** Los eventos deben conservar el tipo de trámite, el salón y el estado para su identificación visual y futura interacción.
- **RF-CA-08:** La vista debe adaptarse a escritorio y móvil sin desplazamiento horizontal no deseado.
- **RF-CA-09:** El icono de ampliar de cada fecha debe abrir un modal con los trámites registrados en ese día.
- **RF-CA-10:** El modal de detalle diario debe ofrecer las vistas Lista y Agenda mediante tabs reutilizables y accesibles.
- **RF-CA-11:** El detalle diario debe conservar los estados visuales de los eventos y adaptarse a escritorio y móvil.
- **RF-CA-12:** En móvil, la cuadrícula mensual debe ocupar el ancho disponible con seis filas de celdas redondeadas, mostrar los días de otros meses como espacios vacíos y representar los eventos con puntos compactos; el día actual debe resaltarse como una píldora de color.
- **RF-CA-13:** En escritorio, el número del día actual debe mostrarse dentro de un indicador circular con colores del tema.
- **RF-CA-14:** En móvil, tocar cualquier fecha del mes debe abrir el mismo detalle diario que se abre desde el control de ampliar en escritorio.
- **RF-CA-15:** En escritorio, seleccionar cualquier fecha del mes también debe abrir el detalle diario; el control de ampliar se conserva como acceso alternativo.

## Fuera de alcance

Creación o edición de eventos desde el calendario, recordatorios, filtros avanzados, permisos, sincronización y conexión con servicios externos. Las acciones sobre cada trámite dentro del modal quedan fuera de esta iteración.
