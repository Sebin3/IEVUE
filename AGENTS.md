# Guía del repositorio

## Estructura del proyecto y organización de módulos

Este repositorio es una aplicación de una sola página desarrollada con Vue 3 y Vite. El código principal está en `src/`:

- `src/pages/` contiene las vistas de cada ruta, como `MovimientosPage.vue`, `EmpleadosPage.vue` y `EstudiantesPage.vue`.
- `src/components/` contiene modales, selectores, calendarios, relojes, navegación y componentes visuales reutilizables.
- `src/stores/` contiene el estado de Pinia y los datos simulados actuales.
- `src/composables/` contiene la lógica reutilizable para temas, navegación, modales y animaciones GSAP.
- `src/assets/styles/` contiene las hojas de estilo principales y las fuentes.
- `public/` contiene archivos estáticos, recursos PWA, iconos y temas.
- `scripts/` contiene utilidades del proyecto. La carpeta `tests/` queda reservada para futuras pruebas automatizadas.

## Comandos de desarrollo y compilación

```sh
npm install
npm run dev
npm run build
npm run preview
```

`npm run dev` inicia el servidor local, `npm run build` genera la versión de producción y `npm run preview` permite revisar dicha compilación. Todavía no hay un comando de pruebas o lint configurado.

## Estilo y convenciones

Usa dos espacios de indentación en Vue, JavaScript y CSS. Nombra los componentes en PascalCase (`ModalEditStudent.vue`), las vistas con el sufijo `Page.vue` y los composables con el prefijo `use` (`useTheme.js`). Prefiere Composition API con `<script setup>`, variables CSS existentes y clases reutilizables. Conserva los temas, puntos de quiebre responsivos, etiquetas de accesibilidad y animaciones actuales.

## Validación

Comprueba las rutas afectadas en un navegador basado en Chromium, tanto en escritorio como en móvil. Revisa modales, formularios, selectores y tablas sin desplazamiento horizontal no deseado. Ejecuta `npm run build` antes de finalizar un cambio.

## Memoria

- Al empezar, lee `docs/memory.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea importante, actualízalo con el estado actual, las decisiones importantes y los errores que deben evitarse.
- Mantenlo breve, con un máximo de 100 líneas. Resume o elimina la información que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` o a la documentación correspondiente en lugar de dejarlo solo en la memoria.
- No guardes nunca datos sensibles, como claves, tokens o datos personales.

## Límites

- No agregues dependencias, frameworks ni pasos de compilación sin una justificación y aprobación previa.
- Antes de crear archivos nuevos o modificar archivos fuera del alcance solicitado, confirma la necesidad del cambio.


## Commits y solicitudes de cambio

Usa mensajes de Conventional Commits, por ejemplo `feat: add student management view` o `fix: correct mobile modal layout`. Una solicitud de cambio debe explicar el efecto visible, indicar las rutas o archivos afectados, incluir capturas cuando corresponda y mencionar la validación realizada.

## Configuración y datos

La aplicación usa datos simulados y todavía no tiene integración con backend. No agregues información real de estudiantes o empleados, credenciales ni secretos. Mantén los metadatos e iconos de la PWA en `public/` hasta que se apruebe una reorganización.

## Desarrollo guiado por especificaciones

Las funcionalidades importantes siguen el flujo SDD documentado en `docs/constitution.md` y `specs/`. Antes de implementar un cambio relevante, revisa o actualiza su `spec.md`, define el enfoque en `plan.md` y registra el trabajo en `tasks.md`.

## Trazabilidad de cambios en el SDD

Toda modificación del proyecto debe quedar reflejada en la documentación SDD correspondiente antes de finalizar la tarea:

- Nueva funcionalidad: actualizar `spec.md`, `plan.md` y `tasks.md` de la vista o módulo afectado.
- Funcionalidad implementada: marcar su tarea como realizada en `tasks.md` después de validarla.
- Ajuste visual, corrección o cambio pequeño: registrar la tarea o el resultado en `tasks.md` y anotar en `docs/memory.md` cualquier decisión que deba conservarse.
- Trabajo pendiente, limitación o decisión no resuelta: registrarlo como pendiente o pregunta abierta en `tasks.md`, `spec.md` o `docs/memory.md`, según corresponda.

No se debe finalizar un cambio de código sin actualizar al menos el artefacto SDD relacionado. No es necesario crear una especificación nueva para cada ajuste si ya existe una especificación para la vista o módulo involucrado.
