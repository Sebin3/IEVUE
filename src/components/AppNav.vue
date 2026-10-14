<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useNavStyle } from '../composables/useNavStyle'
import { useModal } from '../composables/useModal'
import { useAuthStore } from '../stores/auth'
import ModalOptions from './ModalOptions.vue'
import ModalAppearance from './ModalAppearance.vue'
import SettingsModal from './SettingsModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { navStyle } = useNavStyle()

const navItems = [
  { page: 'inicio', icon: 'home', label: 'Inicio' },
  { page: 'movimientos', icon: 'table_rows', label: 'Trámites' },
  { page: 'estudiantes', icon: 'groups', label: 'Estudiantes' },
  { page: 'empleados', icon: 'badge', label: 'Empleados' },
  { page: 'asistencias', icon: 'assignment_ind', label: 'Asistencias', desktopOnly: true },
  { page: 'calendario', icon: 'calendar_view_month', label: 'Calendario', desktopOnly: true },
]

const options = useModal()
const appearance = useModal()
const settings = useModal()

function go(page) {
  if (route.name !== page) router.push({ name: page })
}

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav id="appNav" class="app-nav mobile-style-1" :class="navStyle">
    <button class="nav-button first-button">
      <md-ripple aria-hidden="true"></md-ripple>
      <img class="app-nav-logo" src="/icons/S-nav.svg?v=2" alt="" width="24" height="24" />
      <span class="nav-name app-nav-brand">Peruano Suizo</span>
      <md-icon class="dynamic" aria-hidden="true">expand_all</md-icon>
    </button>

    <div class="nav-buttons-container">
      <button
        v-for="item in navItems"
        :key="item.page"
        class="nav-button"
        :class="{ 'hide-on-mobile': item.desktopOnly }"
        :data-page="item.page"
        :active="route.name === item.page ? 'true' : null"
        @click="go(item.page)"
      >
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon aria-hidden="true">{{ item.icon }}</md-icon>
        <span class="nav-name">{{ item.label }}</span>
      </button>
    </div>

    <div class="action-buttons-container">
      <button id="optionsBtn" class="nav-button action-button" @click="options.show">
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon aria-hidden="true">apps</md-icon>
        <span class="nav-name" data-shared-item="word">Opciones</span>
      </button>
    </div>
  </nav>

  <ModalOptions
    v-if="options.open.value"
    :origin="options.origin.value"
    @settings="settings.show"
    @appearance="appearance.show"
    @logout="logout"
    @close="options.hide"
  />
  <ModalAppearance
    v-if="appearance.open.value"
    :origin="appearance.origin.value"
    @close="appearance.hide"
  />
  <SettingsModal
    v-if="settings.open.value"
    :origin="settings.origin.value"
    @close="settings.hide"
  />
</template>
