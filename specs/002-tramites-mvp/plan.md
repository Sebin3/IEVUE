# Plan del MVP de trámites

## Enfoque actual

Se conservará la vista de movimientos y se mantendrá “Trámites” como nombre visible. La implementación se centra en el flujo visual con datos simulados y en la consistencia entre escritorio, móvil y los temas disponibles.

## Áreas y componentes

- `src/pages/MovimientosPage.vue`: tabla, lista móvil, tarjetas, filtros y acciones.
- `src/stores/data.js`: datos simulados de trámites y operaciones locales.
- `src/components/ModalCreate.vue`: formulario de creación.
- `src/components/ModalEdit.vue`: revisión y edición de los campos permitidos.
- `src/components/ModalSearch.vue`, `ModalFilters.vue` y `ModalExport.vue`: consulta y salida de datos.
- `src/components/DatePicker.vue` y `TimePicker.vue`: fecha y hora de registro.
- `src/components/SelectFlip.vue` y `FlipModal.vue`: selectores y transiciones compartidas.

## Reglas de presentación

Los estados y prioridades deben usar variables del tema, pero conservar diferencias visuales suficientes entre sí. En móvil se debe evitar el desbordamiento de textos y el desplazamiento horizontal.

## Validación

Revisar los formularios, el buscador unido al DNI, los selectores, la fecha, la hora, la edición y las transiciones en todos los temas. Ejecutar `npm run build`.

## Pendientes

Las reglas automáticas de prioridad, la resolución, los correos y la integración con backend deben permanecer documentados como trabajo futuro.
