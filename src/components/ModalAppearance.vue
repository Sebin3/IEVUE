<script setup>
/**
 * Modal de Apariencia (index.html: createAppearanceModal, lineas 2745-2843).
 * Bolitas de color = tema; pickers = estilo del nav (solo escritorio).
 */
import FlipModal from './FlipModal.vue'
import { useTheme } from '../composables/useTheme'
import { useNavStyle } from '../composables/useNavStyle'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const { currentTheme, changeTheme, themes } = useTheme()
const { navStyle, setNavStyle, navStyleOptions } = useNavStyle()
</script>

<template>
  <FlipModal
    :origin="origin"
    window-class="slim padding-16 border-radius-40"
    content-class="simple-container direction-column gap-24"
    @close="emit('close')"
  >
    <div class="simple-container direction-column">
      <div class="simple-container direction-column padding-8">
        <div class="simple-container gap-8 align-center text-gradient">
          <md-icon class="filled" aria-hidden="true">palette</md-icon>
          <span class="headline-small weight-600 fit-content">Apariencia</span>
        </div>
      </div>
    </div>

    <div data-v-2c4445b6 class="simple-container direction-column gap-24">
      <div data-v-2c4445b6 class="container">
        <div
          v-for="c in themes"
          :key="c.name"
          data-v-2c4445b6
          class="color-ball"
          :class="{ active: currentTheme === c.name }"
          :data-theme="c.name"
          data-flow-item
          :style="{ background: c.bg, opacity: 1 }"
          @click="changeTheme(c.name)"
        ></div>
      </div>
    </div>

    <div class="simple-container padding-16 direction-column gap-16 hide-on-mobile">
      <span class="title-medium outline-text">Navegación</span>
      <div data-v-99f4a758 class="simple-container gap-8 flex-wrap">
        <div
          v-for="opt in navStyleOptions"
          :key="opt.style"
          data-v-99f4a758
          class="content-box cursor-pointer width-auto nav-picker"
          :class="{ active: navStyle === opt.style }"
          @click="setNavStyle(opt.style)"
        >
          <md-ripple aria-hidden="true"></md-ripple>
          <span class="body-lage weight-500">{{ opt.label }}</span>
        </div>
      </div>
    </div>
  </FlipModal>
</template>
