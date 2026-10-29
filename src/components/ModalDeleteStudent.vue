<script setup>
import { ref } from 'vue'
import FlipModal from './FlipModal.vue'
import { apiDelete } from '../services/api'
import { toast } from 'super-beautiful-toast'

const props = defineProps({
  origin: { type: Object, default: null },
  student: { type: Object, default: null },
})

const emit = defineEmits(['close', 'confirm'])
const deleting = ref(false)
const deleteError = ref('')

async function removeStudent(close) {
  if (deleting.value) return
  deleting.value = true
  deleteError.value = ''

  try {
    await apiDelete(`/api/admin/alumnos/${encodeURIComponent(props.student?.id || '')}`)
    toast.success('Estudiante retirado', { icon: null })
    emit('confirm', props.student?.id)
    close()
  } catch (error) {
    deleteError.value = error.message || 'No se pudo retirar al estudiante.'
    toast.error(deleteError.value, { icon: null })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <FlipModal
    :origin="origin"
    window-class="slim"
    content-class="simple-container direction-column gap-24"
    content-data-v="28392b8b"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <div data-v-28392b8b class="simple-container direction-column gap-16">
        <span class="display-small weight-600 title line-height-1 text-gradient">
          Eliminar estudiante
        </span>
        <span class="body-large">
          ¿Deseas retirar al estudiante con DNI <strong>{{ student?.dni }}</strong>? Se conservará su historial.
        </span>
      </div>
      <span v-if="deleteError" class="body-medium error-text" role="alert">{{ deleteError }}</span>
      <div class="simple-container justify-right gap-8">
        <button
          type="button"
          class="style-7 rounded surface-container-low outline-text flex-0-1 justify-center"
          :disabled="deleting"
          @click="close()"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="style-7 rounded flex-0-1 justify-center danger-true error-container error-text with-icon-left"
          :disabled="deleting"
          @click="removeStudent(close)"
        >
          <md-icon class="filled dynamic" aria-hidden="true">delete</md-icon>
          {{ deleting ? 'Retirando…' : 'Retirar' }}
        </button>
      </div>
    </template>
  </FlipModal>
</template>
