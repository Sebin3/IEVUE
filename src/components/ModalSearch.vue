<script setup>
/**
 * MODAL: buscador — index.html createSearchModal() (3675-3696), abierto desde
 * openSearchModal (3743) en Movimientos y openSearchEmpleadosModal (5216) en
 * Empleados. El markup es el mismo; solo cambia sobre que lista busca.
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import FlipModal from './FlipModal.vue'
import { useStore } from '../stores/data'

const props = defineProps({
  origin: { type: Object, default: null },
  // 'movimientos' | 'empleados' | 'estudiantes'
  scope: { type: String, default: 'movimientos' },
})

const emit = defineEmits(['close'])

const { state, setQuery, setEmpQuery, setStudentQuery } = useStore()

const isEmpleados = computed(() => props.scope === 'empleados')
const isEstudiantes = computed(() => props.scope === 'estudiantes')

const query = computed({
  get: () => (isEmpleados.value ? state.empQuery : isEstudiantes.value ? state.studentQuery : state.query),
  set: (v) => {
    if (isEmpleados.value) setEmpQuery(v)
    else if (isEstudiantes.value) setStudentQuery(v)
    else setQuery(v)
  },
})

const placeholder = computed(() =>
  isEmpleados.value ? 'Busca un empleado' : isEstudiantes.value ? 'Busca un estudiante' : 'Busca un trámite',
)

const inputEl = ref(null)

// index.html enfoca el input al terminar el flip y limpia la busqueda al cerrar.
onMounted(() => {
  window.setTimeout(() => inputEl.value?.focus(), 700)
})
onUnmounted(() => { query.value = '' })
</script>

<template>
  <FlipModal
    :origin="origin"
    backdrop-class="no-backdrop"
    window-class="semi-mini padding-16 border-radius-24 outline-light-3"
    content-class="simple-container gap-0 align-center"
    content-data-v="4341c8dd c84aa51e"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <div data-v-4341c8dd class="simple-container align-center" style="padding-left: 4px">
        <md-icon data-v-4341c8dd class="outline-text" data-shared-item="icon" aria-hidden="true">
          search
        </md-icon>
      </div>
      <input
        ref="inputEl"
        v-model="query"
        data-v-4341c8dd
        type="text"
        class="background outline-1 focus-primary"
        :placeholder="placeholder"
        maxlength="100"
        @keydown.enter.prevent="close()"
      />
    </template>
  </FlipModal>
</template>
