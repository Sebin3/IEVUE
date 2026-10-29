<script setup>
import { nextTick, ref } from 'vue'
import FlipModal from './FlipModal.vue'
import SelectFlip from './SelectFlip.vue'
import ModalDeleteStudent from './ModalDeleteStudent.vue'
import { useModal } from '../composables/useModal'
import { toast } from 'super-beautiful-toast'
import { apiPatch } from '../services/api'

const props = defineProps({
  origin: { type: Object, default: null },
  student: { type: Object, default: null },
  salonOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'save', 'delete'])
const confirmDelete = useModal()
const editModal = useModal()
const saving = ref(false)
const saveError = ref('')

function getStudentSectionId() {
  const sectionId = props.student?.seccion_id
  if (sectionId && props.salonOptions.some((option) => String(option.value) === String(sectionId))) {
    return sectionId
  }

  const currentSection = String(props.student?.salon_seccion || '').trim()
  if (!currentSection) return sectionId || ''

  const normalize = (value) => {
    const compact = String(value || '')
      .toLocaleLowerCase('es-PE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s-]+/g, '')
    const classroom = compact.match(/^(\d+)(?:ro|do|er|to)?([a-e])$/)
    return classroom ? `${classroom[1]}${classroom[2]}` : compact
  }
  const normalizedCurrentSection = normalize(currentSection)
  const matchingOption = props.salonOptions.find((option) =>
    normalize(option.label) === normalizedCurrentSection,
  )

  return matchingOption?.value || sectionId || ''
}

const form = ref({
  dni: props.student?.dni || '',
  telefono: props.student?.telefono || '',
  first: props.student?.nombres || '',
  last: props.student?.apellidos || '',
  email: props.student?.correo_institucional || '',
  salon: getStudentSectionId(),
})

function resetForm() {
  saveError.value = ''
  form.value = {
    dni: props.student?.dni || '',
    telefono: props.student?.telefono || '',
    first: props.student?.nombres || '',
    last: props.student?.apellidos || '',
    email: props.student?.correo_institucional || '',
    salon: getStudentSectionId(),
  }
}

function startEditing(event) {
  resetForm()
  editModal.show(event)
}

async function save(close, event) {
  if (saving.value) return
  saving.value = true
  saveError.value = ''
  const changes = {
    dni: form.value.dni.trim(),
    telefono: form.value.telefono.trim(),
    nombres: form.value.first.trim(),
    apellidos: form.value.last.trim(),
    correo: form.value.email.trim(),
    seccion_id: form.value.salon,
  }

  try {
    await apiPatch(`/api/admin/alumnos/${encodeURIComponent(props.student?.id || '')}`, changes)
    emit('save', { ...props.student, ...changes })
    toast.success('Estudiante actualizado', { icon: null, origin: event?.submitter ?? null })
    await nextTick()
    close()
  } catch (error) {
    saveError.value = error.message || 'No se pudo actualizar al estudiante.'
    toast.error(saveError.value, { icon: null, origin: event?.submitter ?? null })
  } finally {
    saving.value = false
  }
}

function onDeleted(close) {
  emit('delete', props.student?.id)
  close()
}

function downloadQr() {
  if (!props.student?.qr_image) return

  const link = document.createElement('a')
  link.href = props.student.qr_image
  link.download = `codigo-qr-${props.student.codigo_alumno || props.student.id}.png`
  link.click()
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
            {{ student?.nombre_completo || `${student?.nombres || ''} ${student?.apellidos || ''}`.trim() }}
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
              :aria-label="student?.qr_image ? 'Descargar código QR' : 'Código QR no disponible'"
              :title="student?.qr_image ? 'Descargar código QR' : 'Código QR no disponible'"
              :disabled="!student?.qr_image"
              @click="downloadQr"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon aria-hidden="true">download</md-icon>
            </button>
            <img
              v-if="student?.qr_image"
              class="student-qr-image"
              :src="student.qr_image"
              :alt="`Código QR de ${student?.nombre_completo || student?.codigo_alumno || 'estudiante'}`"
            />
            <template v-else>
              <md-icon class="student-qr-icon" aria-hidden="true">qr_code_2</md-icon>
              <span class="label-large outline-text">Código QR</span>
              <span class="body-medium outline-text">QR no disponible</span>
            </template>
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
              aria-label="salón y sección"
              :options="salonOptions"
              :searchable="true"
              :grouped="true"
              :max-popup-height="480"
            />
          </div>
        </div>

        <div v-if="saveError" class="body-medium error-text" role="alert">
          {{ saveError }}
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
              :disabled="saving"
            >
              <md-ripple data-v-6c7476fc aria-hidden="true"></md-ripple>
              <span data-v-6c7476fc>{{ saving ? 'Guardando…' : 'Guardar' }}</span>
            </button>
          </div>
        </div>
      </form>
    </template>
  </FlipModal>
</template>
