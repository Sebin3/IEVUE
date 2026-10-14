<script setup>
import { nextTick, ref } from 'vue'
import FlipModal from './FlipModal.vue'
import SelectFlip from './SelectFlip.vue'
import { useStore } from '../stores/data'
import { toast } from 'super-beautiful-toast'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close'])
const { addEstudiante } = useStore()

const form = ref({
  dni: '',
  telefono: '',
  first: '',
  last: '',
  email: '',
  salon: '',
  estado: 'Activo',
})

const salonOptions = [
  { value: '1A', label: '1A' },
  { value: '1B', label: '1B' },
  { value: '2A', label: '2A' },
  { value: '2B', label: '2B' },
  { value: '3A', label: '3A' },
]

const statusOptions = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
]

async function submit(close, event) {
  if (!form.value.dni.trim() || !form.value.first.trim() || !form.value.last.trim()) return
  addEstudiante({
    dni: form.value.dni.trim(),
    telefono: form.value.telefono.trim(),
    first_name: form.value.first.trim(),
    last_name: form.value.last.trim(),
    correo_institucional: form.value.email.trim(),
    salon_seccion: form.value.salon,
    estado: form.value.estado,
  })
  toast.success('Estudiante creado', { icon: null, origin: event?.submitter ?? null })
  await nextTick()
  close()
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
            >
              <md-ripple data-v-6c7476fc aria-hidden="true"></md-ripple>
              <span data-v-6c7476fc>Crear</span>
            </button>
          </div>
        </div>
      </form>
    </template>
  </FlipModal>
</template>
