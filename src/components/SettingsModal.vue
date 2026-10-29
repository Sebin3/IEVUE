<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import FlipModal from './FlipModal.vue'
import { useAuthStore } from '../stores/auth'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close'])
const auth = useAuthStore()
const selectedTab = ref('account')
const isMobile = ref(typeof window !== 'undefined' && window.matchMedia('(max-width: 680px)').matches)
let mobileQuery

const profileEmail = computed(() => auth.user?.email || auth.user?.correo || 'Sin correo vinculado')
const profileName = computed(() => {
  const fullName = [auth.user?.nombres, auth.user?.apellidos].filter(Boolean).join(' ').trim()
  return fullName || auth.user?.nombre_completo || auth.username || 'Sin nombre'
})

const selectedTabOffset = computed(() => {
  let offset = 0

  for (const entry of navEntries) {
    if (entry.type === 'tab' && entry.id === selectedTab.value) return offset
    offset += entry.type === 'heading' ? 32 : 40
  }

  return 0
})

function syncViewport() {
  isMobile.value = mobileQuery?.matches ?? false
}

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 680px)')
  syncViewport()
  mobileQuery.addEventListener('change', syncViewport)
})

onBeforeUnmount(() => mobileQuery?.removeEventListener('change', syncViewport))

const navEntries = [
  { type: 'tab', id: 'account', label: 'Cuenta', icon: 'account_circle' },
  { type: 'heading', id: 'clinic-heading', label: 'Administracion' },
  { type: 'tab', id: 'clinic-profile', label: 'Mi Colegio', icon: 'home_work' },
  { type: 'tab', id: 'members', label: 'Miembros', icon: 'group' },
  { type: 'tab', id: 'roles', label: 'Roles', icon: 'badge' },
  // { type: 'tab', id: 'activity', label: 'Actividad', icon: 'history' },
  { type: 'heading', id: 'agenda-heading', label: 'Asistencias' },
  { type: 'tab', id: 'appointments', label: 'Horarios', icon: 'schedule' },
  { type: 'tab', id: 'availability', label: 'Disponibilidad', icon: 'event_available' },
  // { type: 'heading', id: 'other-heading', label: 'Otras opciones' },
  // { type: 'tab', id: 'subscription', label: 'Suscripción', icon: 'rocket_launch' },
  // { type: 'tab', id: 'general', label: 'General', icon: 'apps' },
  // { type: 'tab', id: 'agent', label: 'Agente', icon: 'cognition_2' },
]

const tabs = navEntries.filter((entry) => entry.type === 'tab')

function moveTab(event, direction) {
  const currentIndex = tabs.findIndex((tab) => tab.id === selectedTab.value)
  const nextIndex = (currentIndex + direction + tabs.length) % tabs.length
  selectedTab.value = tabs[nextIndex].id
  event.currentTarget.parentElement
    ?.querySelector(`[data-tab="${tabs[nextIndex].id}"]`)
    ?.focus()
}
</script>

<template>
  <FlipModal
    :origin="origin"
    placement="center"
    window-class="increased semi-slim padding-0 border-radius-40 settings-window"
    content-class="settings-layout"
    :liquid-animation="true"
    :liquid-origin-style="{ background: 'var(--md-sys-color-on-background)', borderRadius: '64px' }"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <aside class="settings-sidebar">
        <div class="settings-mobile-heading">
          <button
            type="button"
            class="style-7 surface-container-low outline-text for-icon small rounded"
            aria-label="Cerrar configuración"
            @click="close"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon aria-hidden="true">close</md-icon>
          </button>
          <span class="title-large outline-text">Configuración</span>
        </div>

        <div
          class="pretty-tabs size-md variant-plain settings-tabs"
          :class="isMobile ? 'orientation-horizontal' : 'orientation-vertical'"
          role="tablist"
          :aria-orientation="isMobile ? 'horizontal' : 'vertical'"
          aria-label="Secciones de configuración"
          data-no-drag
          :style="{ '--settings-tab-index': tabs.findIndex((tab) => tab.id === selectedTab), '--settings-tab-offset': `${selectedTabOffset}px` }"
        >
          <span class="pretty-tabs__indicator" aria-hidden="true"></span>
          <template v-for="entry in navEntries" :key="entry.id">
            <span v-if="entry.type === 'heading'" class="settings-tab-section-label" aria-hidden="true">
              {{ entry.label }}
            </span>
            <button
              v-else
              :id="`settings-tab-${entry.id}`"
              :data-tab="entry.id"
              type="button"
              role="tab"
              class="pretty-tabs__tab"
              :class="{ active: selectedTab === entry.id }"
              :aria-selected="selectedTab === entry.id"
              :aria-controls="`settings-panel-${entry.id}`"
              :tabindex="selectedTab === entry.id ? 0 : -1"
              @click="selectedTab = entry.id"
              @keydown.left.prevent="moveTab($event, -1)"
              @keydown.right.prevent="moveTab($event, 1)"
              @keydown.home.prevent="selectedTab = tabs[0].id"
              @keydown.end.prevent="selectedTab = tabs[tabs.length - 1].id"
            >
              <md-icon aria-hidden="true">{{ entry.icon }}</md-icon>
              <span>{{ entry.label }}</span>
            </button>
          </template>
        </div>
      </aside>

      <section class="settings-content simple-container direction-column gap-8 padding-16 overflow-auto" aria-label="Contenido de configuración">
        <div
          v-if="selectedTab === 'account'"
          id="settings-panel-account"
          class="settings-account-scroll simple-container direction-column gap-8 grow-1 overflow-auto border-radius-32 padding-1"
          role="tabpanel"
          aria-labelledby="settings-tab-account"
          tabindex="0"
        >
          <div class="settings-account-card content-box padding-8 justify-right background border-radius-32 gap-16 height-100">
            <div
              class="background settings-account-background"
              data-v-32393eee
              style="--v9501004a: 10s; --v4349373e: 0.5; --e43cd9c0: 1; --v49c3eedc: 15s; --v1448d375: 0.3;"
            >
              <div class="noise" data-v-32393eee></div>
            </div>
            <div class="settings-account-details simple-container direction-column gap-16 z-index-1 padding-8 h-padding-24 t-padding-24">
              <div class="simple-container direction-column cursor-default">
                <span class="title-large outline-text opacity-0-5">Correo</span>
                <span class="headline-small max-width-100 text-overflow-ellipsis on-background-text">{{ profileEmail }}</span>
              </div>
              <div class="simple-container direction-column">
                <span class="title-large outline-text cursor-default opacity-0-5">Nombre</span>
                <span class="text-link text-link-translucent text-link-squared display-large max-width-100 width-fit-content text-overflow-ellipsis cursor-default outline-text">{{ profileName }}</span>
              </div>
            </div>
            <!-- <div class="settings-account-status content-box transparent direction-row align-center gap-16 z-index-1">
              <md-icon class="filled outline-text" aria-hidden="true">unsubscribe</md-icon>
              <div class="settings-status-copy simple-container direction-column gap-4 grow-1 cursor-default">
                <span class="headline-small line-height-1 weight-500 opacity-0-8">Correo</span>
                <span class="body-large opacity-0-5">Sin verificar</span>
              </div>
              <button
                type="button"
                class="style-7 primary-container on-primary-container-text rounded small"
                disabled
                title="La verificación estará disponible cuando se conecte una cuenta"
              >
                <md-ripple aria-hidden="true"></md-ripple>
                Verificar
              </button>
            </div> -->
          </div>
        </div>

        <div
          v-else
          :id="`settings-panel-${selectedTab}`"
          class="settings-empty-panel"
          role="tabpanel"
          :aria-labelledby="`settings-tab-${selectedTab}`"
          tabindex="0"
        ></div>
      </section>
    </template>
  </FlipModal>
</template>
