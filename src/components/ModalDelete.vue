<script setup>
/**
 * MODAL: confirmar borrado de movimiento — index.html createDeleteConfirmModal
 * (3417-3444).
 */
import FlipModal from './FlipModal.vue'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close', 'confirm'])
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
          class="display-small weight-600 title line-height-1"
          data-shared-item="title"
          >Eliminar movimiento</span
        >
        <span data-v-28392b8b class="body-large">
          ¿Estas seguro(a) de que deseas eliminar este movimiento?
        </span>
      </div>
      <div data-v-28392b8b class="simple-container justify-right gap-8">
        <button
          data-v-28392b8b
          class="style-7 rounded surface-container-low outline-text flex-0-1 justify-center close-delete-modal-btn"
          @click="close()"
        >
          Cancelar
        </button>
        <button
          data-v-28392b8b
          class="style-7 rounded flex-0-1 justify-center danger-true error-container error-text with-icon-left confirm-delete-btn"
          @click="emit('confirm'), close()"
        >
          <md-icon data-v-28392b8b class="filled dynamic" aria-hidden="true">delete</md-icon>
          Eliminar
        </button>
      </div>
    </template>
  </FlipModal>
</template>
