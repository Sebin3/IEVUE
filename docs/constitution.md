# Constitución del proyecto IEVUE

## Estado

Activa. Esta constitución aplica a la aplicación web de gestión escolar y a sus documentos SDD.

## Principios

### 1. Prototipar antes de integrar

El producto actual es un prototipo visual y funcional. Los datos simulados son válidos durante esta etapa. La base de datos, el correo electrónico, la inteligencia artificial y los servicios externos no deben incorporarse sin actualizar y aprobar la especificación correspondiente.

### 2. Especificar antes de implementar

Toda funcionalidad importante comienza con una especificación revisada. Los requisitos describen el comportamiento esperado y sus criterios de aceptación; el plan explica el enfoque de implementación y las tareas detallan el trabajo pendiente.

### 3. Conservar el sistema visual

Las nuevas vistas y componentes deben reutilizar los temas, variables CSS, puntos de quiebre responsivos, animaciones de modales, tipografías e iconos Material existentes. Evita duplicar estilos cuando pueda reutilizarse un componente o una clase.

### 4. Responsividad y accesibilidad desde el inicio

Cada vista debe revisarse en tamaños de escritorio y móvil. Las tablas no deben provocar desplazamiento horizontal no deseado. Los controles interactivos requieren etiquetas claras, comportamiento de teclado predecible y retroalimentación visible.

### 5. Verificar antes de finalizar

Una tarea termina cuando se comprueban sus criterios de aceptación. Como mínimo, se debe ejecutar `npm run build` y revisar manualmente las rutas, formularios, modales y diseños responsivos afectados. Las pruebas automatizadas se incorporarán cuando exista lógica de negocio estable.

### 6. Proteger los datos y mantener el alcance explícito

Solo deben utilizarse datos personales simulados. Nunca se deben subir credenciales, información real de estudiantes o empleados ni configuraciones privadas. El comportamiento futuro del backend debe registrarse como pendiente, sin presentarlo como una función ya disponible.

### 7. Mantener actualizadas las especificaciones

Cuando cambie un requisito aprobado, primero debe actualizarse el `spec.md` correspondiente. Las decisiones pendientes deben registrarse como preguntas abiertas, en lugar de definir silenciosamente un comportamiento que afecte el trabajo futuro.

### 8. Mantener la trazabilidad de cada cambio

Toda modificación del código debe quedar reflejada en el artefacto SDD que corresponda. Las nuevas funcionalidades actualizan `spec.md`, `plan.md` y `tasks.md`; las tareas terminadas se marcan después de su validación; y los ajustes pequeños, limitaciones o decisiones visuales se registran en `tasks.md` o `docs/memory.md`. La documentación debe indicar qué se hizo, qué falta y qué decisiones siguen pendientes.
