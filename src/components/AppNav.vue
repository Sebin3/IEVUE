<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNavStyle } from '../composables/useNavStyle'
import { useModal } from '../composables/useModal'
import { useAuthStore } from '../stores/auth'
import ModalCreate from './ModalCreate.vue'
import ModalCreateStudent from './ModalCreateStudent.vue'
import ModalCreateEmployee from './ModalCreateEmployee.vue'
import ModalOptions from './ModalOptions.vue'
import ModalAppearance from './ModalAppearance.vue'
import SettingsModal from './SettingsModal.vue'
import FlipModal from './FlipModal.vue'
import { moduleAvailability } from '../config/modules'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { navStyle } = useNavStyle()

const navItems = [
  { page: 'inicio', icon: 'home', label: 'Inicio' },
  ...(moduleAvailability.movimientos ? [{ page: 'movimientos', icon: 'table_rows', label: 'Trámites' }] : []),
  { page: 'estudiantes', icon: 'groups', label: 'Estudiantes' },
  { page: 'empleados', icon: 'groups_3', label: 'Docentes' },
  { page: 'asistencias', icon: 'nest_clock_farsight_analog', label: 'Asistencias', desktopOnly: true },
  ...(moduleAvailability.calendario ? [{ page: 'calendario', icon: 'calendar_view_month', label: 'Calendario', desktopOnly: true }] : []),
]
const isProfessor = computed(() => auth.isWebProfessor())
const visibleNavItems = computed(() => isProfessor.value
  ? [{ page: 'asistencias', icon: 'nest_clock_farsight_analog', label: 'Asistencias' }]
  : navItems)

const options = useModal()
const createTramite = useModal()
const createStudent = useModal()
const createEmployee = useModal()
const appearance = useModal()
const settings = useModal()
const logoutConfirmation = useModal()
let confirmLogoutAfterClose = false

function go(page) {
  if (route.name !== page) router.push({ name: page })
}

function requestLogout(event) {
  logoutConfirmation.show(event)
}

function onOptionsClose() {
  options.hide()
}

function finishLogoutConfirmation() {
  logoutConfirmation.hide()
  if (!confirmLogoutAfterClose) return

  confirmLogoutAfterClose = false
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <nav id="appNav" class="app-nav mobile-style-1" :class="navStyle">
    <button class="nav-button first-button">
      <md-ripple aria-hidden="true"></md-ripple>
      <img class="app-nav-logo" src="/icons/peruano-suizo.png" alt="" width="24" height="24" />
      <span class="nav-name app-nav-brand">Peruano Suizo</span>
      <md-icon class="dynamic" aria-hidden="true">expand_all</md-icon>
    </button>

    <div class="nav-buttons-container">
      <button
        v-for="item in visibleNavItems"
        :key="item.page"
        class="nav-button"
        :class="{ 'hide-on-mobile': item.desktopOnly && !isProfessor }"
        :data-page="item.page"
        :active="route.name === item.page ? 'true' : null"
        @click="go(item.page)"
      >
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon aria-hidden="true">{{ item.icon }}</md-icon>
        <span class="nav-name">{{ item.label }}</span>
      </button>
    </div>

    <div v-if="!isProfessor" class="nav-option-buttons" role="group" aria-labelledby="navQuickActionsLabel">
      <span id="navQuickActionsLabel" class="nav-option-label outline-variant-text">Opciones</span>
      <button
        class="nav-button"
        type="button"
        :disabled="!moduleAvailability.crearTramite"
        title="Disponible más adelante"
        @click="createTramite.show"
      >
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon aria-hidden="true">note_add</md-icon>
        <span class="nav-name">Crear trámite</span>
      </button>
      <button
        class="nav-button"
        type="button"
        @click="createStudent.show"
      >
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon aria-hidden="true">person_add</md-icon>
        <span class="nav-name">Nuevo estudiante</span>
      </button>
      <button class="nav-button" type="button" @click="createEmployee.show">
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon aria-hidden="true">badge</md-icon>
        <span class="nav-name">Nuevo docente</span>
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

  <ModalCreate
    v-if="moduleAvailability.crearTramite && createTramite.open.value"
    :origin="createTramite.origin.value"
    @close="createTramite.hide"
  />
  <ModalCreateStudent
    v-if="createStudent.open.value"
    :origin="createStudent.origin.value"
    @close="createStudent.hide"
  />
  <ModalCreateEmployee
    v-if="createEmployee.open.value"
    :origin="createEmployee.origin.value"
    @close="createEmployee.hide"
  />

  <ModalOptions
    v-if="options.open.value"
    :origin="options.origin.value"
    @settings="settings.show"
    @appearance="appearance.show"
    @logout="requestLogout"
    @close="onOptionsClose"
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

  <FlipModal
    v-if="logoutConfirmation.open.value"
    :origin="logoutConfirmation.origin.value"
    window-class="slim"
    content-class="simple-container direction-column gap-24"
    content-data-v="4aea44fd"
    @close="finishLogoutConfirmation"
  >
    <template #default="{ close }">
      <div data-v-4aea44fd class="simple-container direction-column gap-16">
        <span
          data-v-4aea44fd
          class="display-small weight-600 title line-height-1"
          data-shared-item="title"
        >
          Cerrar Sesión
        </span>
        <span data-v-4aea44fd class="body-large">
          ¿Estás seguro(a) de que deseas cerrar sesión?
        </span>
      </div>
      <div data-v-4aea44fd class="simple-container justify-right gap-8">
        <button
          data-v-4aea44fd
          type="button"
          class="style-7 rounded variant-glass outline-text flex-0-1 justify-center"
          @click="close()"
        >
          <span data-v-4aea44fd>Cancelar</span>
        </button>
        <button
          data-v-4aea44fd
          type="button"
          class="style-7 rounded flex-0-1 justify-center text-wrap-nowrap danger-true error-container error-text with-icon-left"
          @click="confirmLogoutAfterClose = true, close()"
        >
          <md-icon data-v-4aea44fd class="filled dynamic" aria-hidden="true">delete</md-icon>
          Cerrar Sesión
        </button>
      </div>
    </template>
  </FlipModal>
</template>
