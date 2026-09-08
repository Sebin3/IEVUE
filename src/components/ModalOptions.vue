<script setup>
/**
 * Modal de Opciones (index.html: createOptionsModal, lineas 2460-2507).
 * Nace del boton #optionsBtn del nav; usa `no-backdrop` + ventana `mini
 * style-translucent-inverted`, no la ventana grande de los demas modales.
 */
import FlipModal from './FlipModal.vue'
import { useRouter } from 'vue-router'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close', 'appearance', 'logout'])

const router = useRouter()

function reloadApp() {
  window.location.reload()
}
</script>

<template>
  <FlipModal
    :origin="origin"
    window-class="mini style-translucent-inverted"
    backdrop-class="no-backdrop"
    content-class="simple-container direction-column gap-24"
    content-data-v="396f88b5"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <div data-v-396f88b5 class="h-padding-16" style="padding-top: 8px">
        <span data-v-396f88b5 class="headline-small weight-600 outline-text" tabindex="-1">
          Opciones
        </span>
      </div>

      <div data-v-396f88b5 class="simple-container direction-column">
        <button
          data-v-396f88b5
          class="only-on-mobile style-7 transparent justify-left outline-text h-padding-16 big rounded"
          @click="router.push({ name: 'intenciones' }), close()"
        >
          <md-ripple aria-hidden="true"></md-ripple>
          <span class="body-large">
            <md-icon class="dynamic filled" aria-hidden="true">next_plan</md-icon>
          </span>
          <span class="button-label">Intenciones</span>
        </button>

        <button
          data-v-396f88b5
          class="style-7 transparent justify-left outline-text h-padding-16 big rounded"
          @click="close()"
        >
          <md-ripple aria-hidden="true"></md-ripple>
          <span class="body-large">
            <md-icon class="dynamic filled" aria-hidden="true">settings</md-icon>
          </span>
          <span class="button-label">Configuración</span>
        </button>

        <button
          data-v-396f88b5
          class="style-7 transparent justify-left outline-text h-padding-16 big rounded"
          @click="reloadApp"
        >
          <md-ripple aria-hidden="true"></md-ripple>
          <span class="body-large">
            <md-icon class="dynamic filled" aria-hidden="true">restart_alt</md-icon>
          </span>
          <span class="button-label">Recargar App</span>
        </button>

        <button
          data-v-396f88b5
          class="style-7 transparent justify-left outline-text h-padding-16 big rounded"
          @click.stop="emit('appearance', $event)"
        >
          <md-ripple aria-hidden="true"></md-ripple>
          <span class="body-large">
            <md-icon class="dynamic filled" aria-hidden="true">palette</md-icon>
          </span>
          <span class="button-label">Apariencia</span>
        </button>

        <button
          data-v-396f88b5
          class="style-7 transparent justify-left outline-text h-padding-16 big rounded close-options-btn"
          @click="emit('logout'), close()"
        >
          <md-ripple aria-hidden="true"></md-ripple>
          <span class="body-large">
            <md-icon class="dynamic filled" aria-hidden="true">logout</md-icon>
          </span>
          <span class="button-label">Cerrar Sesión</span>
        </button>
      </div>
    </template>
  </FlipModal>
</template>
