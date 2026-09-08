<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useNavStyle } from '../composables/useNavStyle'
import { useModal } from '../composables/useModal'
import { useAuthStore } from '../stores/auth'
import EscudoPeru from './EscudoPeru.vue'
import ModalOptions from './ModalOptions.vue'
import ModalAppearance from './ModalAppearance.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { navStyle } = useNavStyle()

const navItems = [
  { page: 'inicio', icon: 'home', label: 'Inicio' },
  { page: 'movimientos', icon: 'table_rows', label: 'Movimientos' },
  { page: 'sedes', icon: 'domain', label: 'Estudiantes  ' },
  { page: 'empleados', icon: 'badge', label: 'Empleados' },
  { page: 'intenciones', icon: 'next_plan', label: 'Intenciones', desktopOnly: true },
]

const options = useModal()
const appearance = useModal()

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
      <EscudoPeru />
      <span style="flex-grow: 1"></span>
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
    @appearance="appearance.show"
    @logout="logout"
    @close="options.hide"
  />
  <ModalAppearance
    v-if="appearance.open.value"
    :origin="appearance.origin.value"
    @close="appearance.hide"
  />
</template>
