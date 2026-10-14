<script setup>
import { nextTick, ref } from 'vue'
import FlipModal from './FlipModal.vue'
import SelectFlip from './SelectFlip.vue'
import ModalDeleteStudent from './ModalDeleteStudent.vue'
import { useModal } from '../composables/useModal'
import { toast } from 'super-beautiful-toast'

const props = defineProps({
  origin: { type: Object, default: null },
  student: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save', 'delete'])
const confirmDelete = useModal()
const editModal = useModal()
const studentName = props.student?.nombres || ''
const nameParts = studentName.split(' ')

const form = ref({
  dni: props.student?.dni || '',
  telefono: props.student?.telefono || '',
  first: nameParts[0] || '',
  last: nameParts.slice(1).join(' ') || '',
  email: props.student?.correo_institucional || '',
  salon: props.student?.salon_seccion || '',
  estado: props.student?.estado || 'Activo',
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

function resetForm() {
  const parts = (props.student?.nombres || '').split(' ')
  form.value = {
    dni: props.student?.dni || '',
    telefono: props.student?.telefono || '',
    first: parts[0] || '',
    last: parts.slice(1).join(' ') || '',
    email: props.student?.correo_institucional || '',
    salon: props.student?.salon_seccion || '',
    estado: props.student?.estado || 'Activo',
  }
}

function startEditing(event) {
  resetForm()
  editModal.show(event)
}

async function save(close, event) {
  emit('save', {
    ...props.student,
    dni: form.value.dni.trim(),
    telefono: form.value.telefono.trim(),
    nombres: `${form.value.first.trim()} ${form.value.last.trim()}`.trim(),
    correo_institucional: form.value.email.trim(),
    salon_seccion: form.value.salon,
    estado: form.value.estado,
  })
  toast.success('Estudiante actualizado', { icon: null, origin: event?.submitter ?? null })
  await nextTick()
  close()
}

function onDeleted(close) {
  emit('delete', props.student?.codigo_alumno)
  toast.success('Estudiante eliminado', { icon: null })
  close()
}
</script>

<template>
  <FlipModal
    :origin="origin"
    backdrop-class="no-backdrop"
    window-class="increased side-panel student-side-panel padding-8 border-radius-40 outline-light-1 max-width-600"
    content-class="simple-container direction-column gap-8 grow-1"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <div class="content-box border-radius-32 background outline-light-1 padding-16">
        <div class="simple-container justify-between">
          <button
            type="button"
            class="style-7 for-icon small rounded surface-container-low outline-text"
            aria-label="Cerrar detalles del estudiante"
            @click="close()"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon aria-hidden="true">close</md-icon>
          </button>

          <div class="simple-container gap-4">
            <button
              type="button"
              class="style-7 for-icon small rounded surface-container-low outline-text"
              aria-label="Editar estudiante"
              @click="startEditing($event)"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon aria-hidden="true">edit</md-icon>
            </button>
            <button
              type="button"
              class="style-7 for-icon small rounded surface-container-low outline-text hover-delete"
              aria-label="Eliminar estudiante"
              @click="confirmDelete.show"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon aria-hidden="true">delete</md-icon>
            </button>
          </div>
        </div>

        <div class="simple-container direction-column padding-16 gap-8">
          <span
            class="title-large weight-600 line-height-1"
            data-shared-item="student-name"
            data-shared-split="words"
          >
            {{ student?.nombres }}
          </span>
          <span class="body-large outline-text">Información del estudiante</span>
        </div>
      </div>

      <div class="simple-container direction-column gap-8 grow-1">
        <div class="student-identity-grid">
          <div class="content-box border-radius-32 background outline-light-1 student-qr-card">
            <button
              type="button"
              class="style-7 for-icon small rounded surface-container-low outline-text student-qr-download"
              aria-label="Descargar código QR próximamente"
              title="Descargar código QR próximamente"
              disabled
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon aria-hidden="true">download</md-icon>
            </button>
            <md-icon class="student-qr-icon" aria-hidden="true">qr_code_2</md-icon>
            <span class="label-large outline-text">Código QR</span>
            <span class="body-medium outline-text">Próximamente</span>
          </div>
          <div class="student-identity-stack">
            <div class="content-box border-radius-32 background outline-light-1 student-code-card">
              <span class="label-large outline-text">Código</span>
              <span class="body-large">{{ student?.codigo_alumno }}</span>
            </div>
            <div class="content-box border-radius-32 background outline-light-1 student-dni-card">
              <span class="label-large outline-text">DNI</span>
              <span class="body-large">{{ student?.dni }}</span>
            </div>
            <div class="content-box border-radius-32 background outline-light-1 student-phone-card">
              <span class="label-large outline-text">Teléfono</span>
              <span class="body-large">{{ student?.telefono || 'Sin registrar' }}</span>
            </div>
          </div>
        </div>
        <div class="content-box border-radius-32 background outline-light-1 grow-1">
          <span class="label-large outline-text">Correo Institucional</span>
          <span class="body-large">{{ student?.correo_institucional || 'Sin registrar' }}</span>
        </div>
        <div class="simple-container gap-8 flex-wrap">
          <div class="content-box border-radius-32 background outline-light-1 grow-1 basis-small">
            <span class="label-large outline-text">Salón y sección</span>
            <span class="body-large">{{ student?.salon_seccion || 'Sin asignar' }}</span>
          </div>
          <div class="content-box border-radius-32 background outline-light-1 grow-1 basis-small">
            <span class="label-large outline-text">Estado</span>
            <span class="body-large">{{ student?.estado }}</span>
          </div>
        </div>
      </div>

      <ModalDeleteStudent
        v-if="confirmDelete.open.value"
        :origin="confirmDelete.origin.value"
        :student="student"
        @confirm="onDeleted(close)"
        @close="confirmDelete.hide"
      />
    </template>
  </FlipModal>

  <FlipModal
    v-if="editModal.open.value"
    :origin="editModal.origin.value"
    content-height="520px"
    @close="editModal.hide"
  >
    <template #default="{ close }">
      <div class="content-box background padding-8">
        <div class="simple-container justify-between">
          <button
            type="button"
            class="style-7 for-icon small rounded surface-container outline-text close-edit-modal-btn"
            aria-label="Cerrar edición"
            @click="close()"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon class="filled" aria-hidden="true">close</md-icon>
          </button>
          <button
            type="button"
            class="style-7 for-icon small rounded surface-container outline-text delete-student-btn"
            aria-label="Eliminar estudiante"
            @click="confirmDelete.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon class="filled" aria-hidden="true">delete</md-icon>
          </button>
        </div>
        <div class="simple-container direction-column grow-1 padding-16 text-center">
          <span class="display-medium weight-600 line-height-1 text-gradient">
            Editar estudiante
          </span>
        </div>
      </div>

      <form
        class="simple-container direction-column gap-16"
        autocomplete="off"
        novalidate
        @submit.prevent="save(close, $event)"
      >
        <div data-flow-item data-input-label="Código">
          <input
            :value="student?.codigo_alumno"
            type="text"
            class="style-2"
            name="student-code"
            readonly
            aria-readonly="true"
          />
        </div>
        <div class="student-dni-field" data-flow-item data-input-label="DNI">
          <input v-model="form.dni" type="text" class="style-2" name="student-dni" required />
        </div>

        <div class="simple-container gap-8">
          <div data-flow-item data-input-label="Nombres" style="flex: 1">
            <input v-model="form.first" type="text" class="style-2" name="student-first" />
          </div>
          <div data-flow-item data-input-label="Apellidos" style="flex: 1">
            <input v-model="form.last" type="text" class="style-2" name="student-last" />
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
              placeholder="Selecciona un estado"
              :options="statusOptions"
            />
          </div>
        </div>

        <div
          data-v-6c7476fc
          class="container variant-gradient align-right"
          style="gap: 8px; --gradient-overflow: 16px"
        >
          <div data-v-6c7476fc class="gradient-row" style="gap: 8px">
            <button
              data-v-6c7476fc
              type="button"
              class="style-7 for-icon surface-container outline-text flex-1 rounded big close-edit-modal-btn"
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
              <span data-v-6c7476fc>Guardar</span>
            </button>
          </div>
        </div>
      </form>
    </template>
  </FlipModal>
</template>
