<script setup>
/**
 * MODAL: exportar — index.html createExportModalHTML() (4627-4655).
 * El boton csv en index.html solo hace console.log y cierra; aqui genera el CSV
 * de los tramites que hay en el store (mock) y lo descarga.
 */
import FlipModal from './FlipModal.vue'
import { useStore } from '../stores/data'
import { computed } from 'vue'

const props = defineProps({
  origin: { type: Object, default: null },
  scope: { type: String, default: 'movimientos' },
})

const emit = defineEmits(['close'])

const { filteredTramites, filteredEstudiantes } = useStore()

const isStudents = computed(() => props.scope === 'estudiantes')

const COLUMNS = [
  ['Fecha', (t) => new Date(t.fecha_creacion).toLocaleString('es-PE')],
  ['DNI', (t) => t.dni || ''],
  ['Ciudadano', (t) => t.nombre_ciudadano || ''],
  ['Tramite', (t) => t.tipo_tramite || ''],
  ['Salón y sección', (t) => t.salon_seccion || ''],
  ['Prioridad', (t) => t.prioridad_ia || ''],
  ['Estado', (t) => t.estado || ''],
  ['Resolucion', (t) => t.resolucion_admin || ''],
]

const STUDENT_COLUMNS = [
  ['Código', (student) => student.codigo_alumno || ''],
  ['DNI', (student) => student.dni || ''],
  ['Nombre y apellido', (student) => student.nombres || ''],
  ['Correo Institucional', (student) => student.correo_institucional || ''],
  ['Salón y sección', (student) => student.salon_seccion || ''],
  ['Estado', (student) => student.estado || ''],
]

function cell(value) {
  return `"${String(value).replace(/"/g, '""')}"`
}

function exportCsv(close) {
  const columns = isStudents.value ? STUDENT_COLUMNS : COLUMNS
  const items = isStudents.value ? filteredEstudiantes.value : filteredTramites.value
  const rows = [
    columns.map(([header]) => cell(header)).join(','),
    ...items.map((item) => columns.map(([, get]) => cell(get(item))).join(',')),
  ]
  const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${isStudents.value ? 'estudiantes' : 'tramites'}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  close()
}
</script>

<template>
  <FlipModal
    :origin="origin"
    window-class="semi-mini padding-8"
    content-class="simple-container direction-column gap-4"
    content-data-v="03f119c7 c84aa51e"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <div data-v-03f119c7 class="simple-container align-center gap-4 padding-16">
        <md-icon data-v-03f119c7 data-shared-item="icon" aria-hidden="true">download</md-icon>
        <span
          data-v-03f119c7
          class="title-medium"
          data-shared-split="words"
          data-shared-item="name"
          >Exportar</span
        >
      </div>
      <div
        data-v-03f119c7
        class="content-box padding-16 light-color cursor-pointer export-csv-btn"
        @click="exportCsv(close)"
      >
        <md-ripple data-v-03f119c7 aria-hidden="true"></md-ripple>
        <div data-v-03f119c7 class="simple-container align-center gap-8">
          <md-icon data-v-03f119c7 data-shared-item="icon" aria-hidden="true">table</md-icon>
          <span
            data-v-03f119c7
            class="title-medium"
            data-shared-split="words"
            data-shared-item="name"
            >Exportar csv</span
          >
        </div>
      </div>
    </template>
  </FlipModal>
</template>
