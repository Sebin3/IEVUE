<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import FlipModal from './FlipModal.vue'
import SelectFlip from './SelectFlip.vue'
import { useStore } from '../stores/data'
import { toast } from 'super-beautiful-toast'
import { apiGet, apiPost } from '../services/api'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close'])
const { state, addEstudiante } = useStore()
const route = useRoute()
const saving = ref(false)
const loadingSections = ref(true)
const saveError = ref('')
const availableSections = ref([])

const form = ref({
  dni: '',
  telefono: '',
  first: '',
  last: '',
  email: '',
  salon: '',
  estado: 'Activo',
})

const salonOptions = computed(() => availableSections.value.map((section) => {
  const gradeNumber = String(section.grado || section.nombre).match(/\d+/)?.[0]
  const letter = section.seccion || section.nombre.match(/\b([A-E])$/i)?.[1]
  const groups = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto']
  return {
    value: section.id,
    label: gradeNumber && letter ? `${gradeNumber}${letter.toUpperCase()}` : section.nombre,
    group: gradeNumber ? groups[Number(gradeNumber) - 1] || `Grado ${gradeNumber}` : 'Otros salones',
  }
}))

async function loadSections() {
  try {
    const sections = await apiGet('/api/secciones')
    availableSections.value = (Array.isArray(sections) ? sections : [])
      .filter((section) => section.id && section.nombre)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }))
  } catch (error) {
    saveError.value = error.message || 'No se pudieron cargar los salones.'
  } finally {
    loadingSections.value = false
  }
}

onMounted(loadSections)

const statusOptions = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
]

async function submit(close, event) {
  if (saving.value) return
  saveError.value = ''
  if (!form.value.dni.trim() || !form.value.first.trim() || !form.value.last.trim() || !form.value.salon) {
    saveError.value = 'Completa DNI, nombres, apellidos y salón.'
    return
  }

  saving.value = true
  try {
    const created = await apiPost('/api/admin/alumnos', {
      dni: form.value.dni.trim(),
      telefono: form.value.telefono.trim(),
      nombres: form.value.first.trim(),
      apellidos: form.value.last.trim(),
      correo: form.value.email.trim(),
      seccion_id: form.value.salon,
      estado: form.value.estado === 'Inactivo' ? 'inactivo' : 'activo',
    })
    if (String(created.estado || '').toLowerCase() === 'activo') {
      if (route.name === 'estudiantes' && created.seccion) {
        state.studentFilters.salon = created.seccion
      }
      addEstudiante({
        ...created,
        correo_institucional: created.email || '',
        salon_seccion: created.seccion || '',
        estado: 'Activo',
      })
    }
    toast.success('Estudiante creado', { icon: null, origin: event?.submitter ?? null })
    await nextTick()
    close()
  } catch (error) {
    saveError.value = error.message || 'No se pudo crear al estudiante.'
    toast.error(saveError.value, { icon: null, origin: event?.submitter ?? null })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <FlipModal
    :origin="origin"
    content-height="520px"
    close-strategy="container-only"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <div class="content-box background padding-8 text-center">
        <div class="simple-container justify-between">
          <button
            type="button"
            class="style-7 for-icon small rounded surface-container outline-text"
            @click="close()"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon class="filled" aria-hidden="true">close</md-icon>
          </button>
        </div>
        <div class="simple-container direction-column grow-1 padding-16">
          <span class="display-medium weight-600 line-height-1 text-gradient">Nuevo estudiante</span>
        </div>
      </div>

  <form class="simple-container direction-column gap-16" autocomplete="off" novalidate @submit.prevent="submit(close, $event)">
        <div data-flow-item data-input-label="DNI">
          <input v-model="form.dni" type="text" class="style-2" name="student-dni" required />
        </div>

        <div class="simple-container gap-8">
          <div data-flow-item data-input-label="Nombres" style="flex: 1">
            <input v-model="form.first" type="text" class="style-2" name="student-first" required />
          </div>
          <div data-flow-item data-input-label="Apellidos" style="flex: 1">
            <input v-model="form.last" type="text" class="style-2" name="student-last" required />
          </div>
        </div>

        <div data-flow-item data-input-label="Teléfono">
          <input v-model="form.telefono" type="tel" class="style-2" name="student-phone" />
        </div>

        <div data-flow-item data-input-label="Correo Institucional">
          <input
            v-model="form.email"
            type="email"
            class="style-2"
            name="student-email"
            autocomplete="email"
          />
        </div>

        <div data-flow-item data-input-label="Salón y sección">
          <div class="asyncstate-data">
            <SelectFlip
              v-model="form.salon"
              name="student-section"
              placeholder="Selecciona un salón"
              :options="salonOptions"
              :disabled="loadingSections || !salonOptions.length"
              :searchable="true"
              :grouped="true"
              :max-popup-height="480"
            />
          </div>
        </div>

        <div data-flow-item data-input-label="Estado">
          <div class="asyncstate-data">
            <SelectFlip
              v-model="form.estado"
              name="student-status"
              :options="statusOptions"
            />
          </div>
        </div>

        <div v-if="saveError" class="body-medium error-text" role="alert">
          {{ saveError }}
        </div>

        <div
          data-v-6c7476fc
          class="container variant-gradient align-right"
          style="--buttons-container-gap: 0px; gap: 8px; --gradient-overflow: 16px"
        >
          <div data-v-6c7476fc class="gradient-row" style="gap: 8px">
            <button
              data-v-6c7476fc
              type="button"
              class="style-7 for-icon surface-container outline-text flex-1 rounded big close-modal-btn"
              @click="close()"
            >
              <md-ripple data-v-6c7476fc aria-hidden="true"></md-ripple>
              <md-icon data-v-6c7476fc aria-hidden="true">close</md-icon>
            </button>
            <button
              data-v-6c7476fc
              type="submit"
              class="style-7 primary-container on-primary-container-text flex-1 rounded big"
              :disabled="saving || loadingSections || !salonOptions.length"
            >
              <md-ripple data-v-6c7476fc aria-hidden="true"></md-ripple>
              <span data-v-6c7476fc>{{ saving ? 'Creando…' : 'Crear' }}</span>
            </button>
          </div>
        </div>
      </form>
    </template>
  </FlipModal>
</template>
