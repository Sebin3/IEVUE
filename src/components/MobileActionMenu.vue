<script setup>
import FlipModal from './FlipModal.vue'
import { useModal } from '../composables/useModal'

defineProps({
  actions: { type: Array, required: true },
})

const emit = defineEmits(['select'])
const menu = useModal()

function selectAction(action, event) {
  emit('select', action.id, event)
}
</script>

<template>
  <div class="mobile-action-menu only-on-mobile">
    <button
      type="button"
      class="style-7 for-icon bigger rounded background outline-text mobile-action-menu-trigger"
      aria-label="Más acciones"
      aria-haspopup="dialog"
      :aria-expanded="menu.open.value"
      @click="menu.show"
    >
      <md-ripple aria-hidden="true"></md-ripple>
      <md-icon aria-hidden="true">more_vert</md-icon>
    </button>

    <FlipModal
      v-if="menu.open.value"
      :origin="menu.origin.value"
      placement="mobile-actions"
      backdrop-class="modal-justify-right modal-align-top"
      window-class="semi-mini padding-8"
      content-class="simple-container direction-column gap-4"
      close-strategy="container-only"
      @close="menu.hide"
    >
      <template #default>
        <div
          v-for="action in actions"
          :key="action.id"
          class="content-box padding-16 light-color cursor-pointer mobile-action-menu-item"
          role="menuitem"
          tabindex="0"
          @click="selectAction(action, $event)"
          @keydown.enter.prevent="selectAction(action, $event)"
          @keydown.space.prevent="selectAction(action, $event)"
        >
          <md-ripple aria-hidden="true"></md-ripple>
          <div class="simple-container align-center gap-8">
            <md-icon data-shared-item="icon" aria-hidden="true">{{ action.icon }}</md-icon>
            <span class="title-medium" data-shared-item="name text">{{ action.label }}</span>
          </div>
        </div>
      </template>
    </FlipModal>
  </div>
</template>

<style scoped>
.mobile-action-menu {
  position: relative;
  z-index: 20;
}

.mobile-action-menu-trigger {
  width: 56px;
  height: 56px;
  padding: 0 !important;
}

.mobile-action-menu-item {
  min-height: 56px;
  gap: 8px;
  border: 0;
  text-align: left;
  cursor: pointer;
}

.mobile-action-menu-item.content-box {
  display: flex;
  flex-direction: row !important;
  align-items: center;
  justify-content: flex-start !important;
}

.mobile-action-menu-item > .simple-container {
  position: relative;
  width: 100%;
  z-index: 2;
  justify-content: flex-start;
}

.mobile-action-menu-item md-icon {
  flex: 0 0 auto;
  color: var(--md-sys-color-outline);
}

.mobile-action-menu-item:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: -2px;
}
</style>
