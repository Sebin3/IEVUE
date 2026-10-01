<script setup>
import FlipModal from './FlipModal.vue'

defineProps({
  origin: { type: Object, default: null },
  student: { type: Object, default: null },
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
        <span class="display-small weight-600 title line-height-1 text-gradient">
          Eliminar estudiante
        </span>
        <span class="body-large">
          ¿Estás seguro de que deseas eliminar al estudiante con DNI
          <strong>{{ student?.dni }}</strong>?
        </span>
      </div>
      <div class="simple-container justify-right gap-8">
        <button
          type="button"
          class="style-7 rounded surface-container-low outline-text flex-0-1 justify-center"
          @click="close()"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="style-7 rounded flex-0-1 justify-center danger-true error-container error-text with-icon-left"
          @click="emit('confirm'), close()"
        >
          <md-icon class="filled dynamic" aria-hidden="true">delete</md-icon>
          Eliminar
        </button>
      </div>
    </template>
  </FlipModal>
</template>
