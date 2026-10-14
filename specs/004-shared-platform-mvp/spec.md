# Especificación del MVP de plataforma compartida

## Estado

En progreso. Este documento reúne las capacidades comunes a las vistas de trámites, empleados y estudiantes.

## Contexto y objetivo

La aplicación necesita una base visual y de interacción consistente: navegación, temas, responsividad, modales, controles de fecha y hora y capacidad de instalación como PWA.

## Requisitos funcionales

- **RF-SP-01:** Mantener rutas y navegación coherentes entre las vistas principales.
- **RF-SP-02:** Permitir cambiar entre los temas disponibles sin perder la diferencia visual entre estados y prioridades.
- **RF-SP-03:** Reutilizar modales con animaciones de apertura y cierre consistentes.
- **RF-SP-04:** Proporcionar selectores, calendario y reloj con una presentación integrada al modal principal.
- **RF-SP-05:** Mantener una experiencia usable en escritorio y móvil.
- **RF-SP-06:** Conservar metadatos, iconos, manifest y service worker de la PWA en `public/` durante el prototipo.
- **RF-SP-07:** Permitir seleccionar el estilo de navegación Simple en escritorio sin alterar la navegación móvil existente.
- **RF-SP-08:** Utilizar el logotipo `S.svg` en el encabezado de navegación y conservar los iconos PWA independientes.
- **RF-SP-09:** Proporcionar notificaciones globales para confirmar las operaciones principales, adaptadas al tema visual activo.
- **RF-SP-10:** Mostrar un asistente flotante accesible desde las vistas internas. Su panel aparece abajo a la derecha y nace del botón que lo abre usando el FLIP compartido. En escritorio/tablet se puede arrastrar desde la barra superior para moverlo o acoplarlo de vuelta a su posición, y redimensionar desde las esquinas; su geometría flotante se conserva entre aperturas. Estos controles no aparecen en móvil, donde se mantiene el diseño a pantalla completa. Al cerrar, solo el contenedor externo se transforma al botón; la ventana y el fondo animado quedan dentro del contenedor y se desvanecen, evitando el doble escalado que proyectaba los blobs fuera del modal. El resto de modales conserva su cierre FLIP estándar. El panel reproduce la estructura visual y los estilos del scope f0318d9e; los controles de cierre/nueva conversación y micrófono mantienen su capa superior. El campo de escritura y el flujo de conversación siguen el chat de Inicio, con respuesta simulada local mientras no exista conexión a un servicio. Nueva conversación muestra una confirmación `FlipModal` superpuesta y alineada al panel, sin oscurecerlo de nuevo. Cancelar conserva el chat y Empezar de nuevo lo limpia sin cerrar el asistente. Escape cierra primero esta confirmación mediante la pila común de modales.
- **RF-SP-11:** En móvil, alinear el botón del asistente sobre Opciones y copiar sus dimensiones; en tablet, conservarlo abajo a la derecha y evitar que se superponga con Opciones. Los controles de cerrar y nueva conversación deben permanecer visibles e interactivos encima de las capas del chat.
- **RF-SP-12:** En móvil, el modal del asistente ocupa todo el viewport sin margen ni radio exterior; el chat visual interior conserva un margen de 8px y radio de 40px. En tablet mantiene el panel flotante de escritorio, con radios visibles y contenido recortado dentro de ellos.
- **RF-SP-13:** Abrir Configuración como modal anidado desde Opciones, conservar el menú inferior mientras esté activo y permitir volver a él al cerrar. El panel usa un sidebar con pestañas accesibles `pretty-tabs`, indicador compartido y orientación vertical en escritorio/horizontal en móvil, siguiendo las reglas de la referencia; su transición líquida es opcional y exclusiva de este modal. Cuenta presenta el estado disponible de la sesión con la composición de la referencia, sin inventar correo o nombre; Suscripción, General y Agente conservan sus pestañas pero permanecen vacías hasta definir su contenido.

## Fuera de alcance

Aplicación nativa con Electron o Tauri, sincronización offline completa, notificaciones push y backend.

## Preguntas abiertas

- [ ] Confirmar nombre y descripción definitivos de la PWA.
- [ ] Definir el comportamiento offline.
- [ ] Confirmar si el modal tendrá gesto de deslizamiento para cerrar en móvil.
