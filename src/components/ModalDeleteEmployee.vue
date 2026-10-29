<script setup>
import { ref } from 'vue'
import FlipModal from './FlipModal.vue'
import { toast } from 'super-beautiful-toast'
import { apiDelete } from '../services/api'

const props = defineProps({
  origin: { type: Object, default: null },
  empleado: { type: Object, default: null },
})

const emit = defineEmits(['close', 'confirm'])

const deleting = ref(false)
const deleteError = ref('')

async function confirm(close) {
  if (deleting.value || !props.empleado) return
  deleting.value = true
  deleteError.value = ''
  try {
    await apiDelete(`/api/admin/docentes/${encodeURIComponent(props.empleado.id)}`)
    emit('confirm', props.empleado.id)
    toast.success('Docente desactivado', { icon: null })
    close()
  } catch (error) {
    deleteError.value = error.message || 'No se pudo desactivar al docente.'
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
        <span
          data-v-28392b8b
          class="display-small weight-600 title line-height-1 text-gradient"
          data-shared-item="title"
          >Desactivar docente</span
        >
        <span data-v-28392b8b class="body-large">
          ¿Estás seguro(a) de que deseas desactivar al docente con DNI
          <strong>{{ empleado?.dni }}</strong>?
          Su historial se conservará.
        </span>
      </div>
      <span v-if="deleteError" class="body-medium error-text" role="alert">{{ deleteError }}</span>
      <div data-v-28392b8b class="simple-container justify-right gap-8">
        <button
          data-v-28392b8b
          class="style-7 rounded surface-container-low outline-text flex-0-1 justify-center close-delete-emp-btn"
          :disabled="deleting"
          @click="close()"
        >
          Cancelar
        </button>
        <button
          data-v-28392b8b
          class="style-7 rounded flex-0-1 justify-center danger-true error-container error-text with-icon-left confirm-delete-emp-btn"
          :disabled="deleting"
          @click="confirm(close)"
        >
          <md-icon data-v-28392b8b class="filled dynamic" aria-hidden="true">delete</md-icon>
          {{ deleting ? 'Desactivando…' : 'Desactivar' }}
        </button>
      </div>
    </template>
  </FlipModal>
</template>
