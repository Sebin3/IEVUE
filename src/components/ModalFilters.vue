<script setup>
import { computed } from 'vue'
import FlipModal from './FlipModal.vue'
import SelectFlip from './SelectFlip.vue'
import { useStore } from '../stores/data'

const props = defineProps({
  origin: { type: Object, default: null },
  scope: { type: String, default: 'movimientos' },
  modelValue: { type: String, default: '' },
  attendanceSort: { type: String, default: 'date-desc' },
  attendancePeriod: { type: String, default: 'week' },
  attendanceMonth: { type: String, default: '' },
  attendanceYear: { type: String, default: '' },
  studentSalonOptions: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'close',
  'update:modelValue',
  'update:attendance-sort',
  'update:attendance-period',
  'update:attendance-month',
  'update:attendance-year',
])

const { state, setFilter, setStudentFilter } = useStore()

const isStudents = computed(() => props.scope === 'estudiantes')
const isAttendance = computed(() => props.scope === 'asistencias')

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const monthOptions = [
  { value: '', label: 'Todos' },
  ...MESES.map((m, i) => ({ value: String(i + 1), label: m })),
]

const yearOptions = (() => {
  const y = new Date().getFullYear()
  return [
    { value: '', label: 'Todos' },
    ...Array.from({ length: 11 }, (_, i) => ({ value: String(y - i), label: String(y - i) })),
  ]
})()

const prioridadOptions = [
  { value: '', label: 'Todos' },
  { value: 'Critica', label: 'Critica' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Media', label: 'Media' },
  { value: 'Baja', label: 'Baja' },
]

const estadoOptions = [
  { value: '', label: 'Todos' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'En Revision', label: 'En Revision' },
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'Rechazado', label: 'Rechazado' },
]

// v-model de dos vias contra el store.
function bind(key) {
  return computed({
    get: () => state.filters[key],
    set: (v) => setFilter(key, v),
  })
}

const month = bind('month')
const year = bind('year')
const prioridad = bind('prioridad')
const estado = bind('estado')

function bindStudent(key) {
  return computed({
    get: () => state.studentFilters[key],
    set: (v) => setStudentFilter(key, v),
  })
}

const studentEstado = bindStudent('estado')
const studentSalon = bindStudent('salon')

const studentEstadoOptions = [
  { value: '', label: 'Todos' },
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
]

const attendanceSortFilter = computed({
  get: () => props.attendanceSort,
  set: (value) => emit('update:attendance-sort', value),
})
const attendancePeriodFilter = computed({
  get: () => props.attendancePeriod,
  set: (value) => emit('update:attendance-period', value),
})
const attendanceMonthFilter = computed({
  get: () => props.attendanceMonth,
  set: (value) => emit('update:attendance-month', value),
})
const attendanceYearFilter = computed({
  get: () => props.attendanceYear,
  set: (value) => emit('update:attendance-year', value),
})

const attendanceSortOptions = [
  { value: 'absent-desc', label: 'Jornadas con más ausentes' },
  { value: 'late-desc', label: 'Jornadas con más tardanzas' },
  { value: 'present-desc', label: 'Jornadas con más presentes' },
  { value: 'total-desc', label: 'Jornadas con más asistencias' },
  { value: 'date-desc', label: 'Jornadas más recientes' },
  { value: 'date-asc', label: 'Jornadas más antiguas' },
]
const attendancePeriodOptions = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
]
</script>

<template>
  <FlipModal
    :origin="origin"
    window-class="semi-mini h-auto padding-8"
    content-class="simple-container direction-column"
    close-strategy="container-only"
    shared-items="icon text"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <div class="content-box" style="padding-top: 64px">
        <div class="simple-container z-index-1 position-absolute left-8 top-8">
          <button class="style-7 variant-glass for-icon small rounded" @click="close()">
            <md-icon aria-hidden="true">close</md-icon>
          </button>
        </div>
        <div class="simple-container align-center gap-8">
          <md-icon data-shared-item="icon" aria-hidden="true">filter_list</md-icon>
          <span class="headline-small weight-500" data-shared-item="text">Filtros</span>
        </div>
      </div>

      <div class="simple-container direction-column gap-8 padding-16">
        <div v-if="isAttendance" class="simple-container direction-column gap-16">
          <div class="simple-container direction-column gap-8">
            <span class="label-large outline-text">Periodo</span>
            <SelectFlip
              v-model="attendancePeriodFilter"
              name="attendance-period-select"
              scope="3020d431"
              :options="attendancePeriodOptions"
              :width="312"
            />
          </div>
          <div v-if="attendancePeriodFilter === 'month'" class="simple-container direction-column gap-8">
            <span class="label-large outline-text">Mes y año</span>
            <div class="simple-container gap-8">
              <SelectFlip
                v-model="attendanceMonthFilter"
                class="hover-scale-small"
                style="max-width: 150px"
                name="attendance-month-select"
                scope="3020d431"
                :options="monthOptions"
                :width="150"
              />
              <SelectFlip
                v-model="attendanceYearFilter"
                class="hover-scale-small"
                style="max-width: 100px"
                name="attendance-year-select"
                scope="3020d431"
                :options="yearOptions"
                :width="100"
              />
            </div>
          </div>
          <div class="simple-container direction-column gap-8">
            <span class="label-large outline-text">Ordenar jornadas por</span>
            <SelectFlip
              v-model="attendanceSortFilter"
              name="attendance-sort-filter"
              scope="3020d431"
              :options="attendanceSortOptions"
              :width="312"
            />
          </div>
        </div>
        <div v-else-if="!isStudents" class="simple-container direction-column gap-16">
          <div class="simple-container direction-column gap-8">
            <span class="label-large outline-text">Fecha</span>
            <div class="simple-container gap-8">
              <SelectFlip
                v-model="month"
                class="hover-scale-small"
                style="max-width: 130px"
                name="month-select"
                scope="3020d431"
                :options="monthOptions"
                :width="130"
              />
              <SelectFlip
                v-model="year"
                class="hover-scale-small"
                style="max-width: 90px"
                name="year-select"
                scope="3020d431"
                :options="yearOptions"
                :width="130"
              />
            </div>
          </div>
          <div class="simple-container direction-column gap-8">
            <span class="label-large outline-text">Prioridad</span>
            <SelectFlip
              v-model="prioridad"
              name="prioridad-filter"
              scope="3020d431"
              :options="prioridadOptions"
              :width="312"
            />
          </div>
          <div class="simple-container direction-column gap-8">
            <span class="label-large outline-text">Estado</span>
            <SelectFlip
              v-model="estado"
              name="estado-filter"
              scope="3020d431"
              :options="estadoOptions"
              :width="312"
            />
          </div>
        </div>
        <div v-else class="simple-container direction-column gap-16">
            <div class="simple-container direction-column gap-8">
              <span class="label-large outline-text">Salón y sección</span>
              <SelectFlip
                v-model="studentSalon"
                name="student-salon-filter"
                scope="3020d431"
                aria-label="salón y sección"
                :options="studentSalonOptions"
                :searchable="true"
                :grouped="true"
                :max-popup-height="480"
                :width="312"
              />
            </div>
            <div class="simple-container direction-column gap-8">
              <span class="label-large outline-text">Estado</span>
              <SelectFlip
                v-model="studentEstado"
                name="student-status-filter"
                scope="3020d431"
                :options="studentEstadoOptions"
                :width="312"
              />
            </div>
        </div>
      </div>
    </template>
  </FlipModal>
</template>
