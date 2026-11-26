<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import FlipModal from './FlipModal.vue'
import SettingsMembersPanel from './SettingsMembersPanel.vue'
import SettingsRolesPanel from './SettingsRolesPanel.vue'
import { useAuthStore } from '../stores/auth'
import { useModal } from '../composables/useModal'
import { toast } from 'super-beautiful-toast'
import { apiGet } from '../services/api'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close'])
const auth = useAuthStore()
const selectedTab = ref('account')
const nameEditor = useModal()
const editedName = ref('')
const nameInput = ref(null)
const schoolName = ref(localStorage.getItem('ievue_school_name') || 'Institución Pública Peruano Suizo')
const webSession = ref(null)
const webSessionLoading = ref(false)
const webSessionError = ref('')
const isMobile = ref(typeof window !== 'undefined' && window.matchMedia('(max-width: 680px)').matches)
let mobileQuery
let webSessionRequest

const profileEmail = computed(() => auth.user?.email || auth.user?.correo || 'Sin correo vinculado')
const profileName = computed(() => {
  const fullName = [auth.user?.nombres, auth.user?.apellidos].filter(Boolean).join(' ').trim()
  return fullName || auth.user?.nombre_completo || auth.username || 'Sin nombre'
})

const selectedTabOffset = computed(() => {
  let offset = 0

  for (const entry of visibleNavEntries.value) {
    if (entry.type === 'tab' && entry.id === selectedTab.value) return offset
    offset += entry.type === 'heading' ? 32 : 40
  }

  return 0
})

function syncViewport() {
  isMobile.value = mobileQuery?.matches ?? false
}

async function openNameEditor(event, target = 'account') {
  editedName.value = target === 'school'
    ? schoolName.value
    : profileName.value === 'Sin nombre'
      ? ''
      : profileName.value
  nameEditor.show(event, target)
  await nextTick()
  nameInput.value?.focus()
}

function saveName(close, event) {
  const nextName = editedName.value.trim().replace(/\s+/g, ' ')
  if (nextName.length < 2) {
    nameInput.value?.focus()
    return
  }

  if (nameEditor.payload.value === 'school') {
    schoolName.value = nextName
    localStorage.setItem('ievue_school_name', nextName)
    toast.success('Nombre institucional actualizado en este dispositivo', { icon: null, origin: event?.submitter ?? null })
  } else {
    // El perfil del backend todavía no ofrece una operación para cambiar nombres.
    // Guardamos el cambio en la sesión local hasta que exista ese endpoint.
    auth.user = {
      ...auth.user,
      nombres: nextName,
      apellidos: '',
      nombre_completo: nextName,
    }
    auth.username = nextName
    localStorage.setItem('auth_user', JSON.stringify(auth.user))
    localStorage.setItem('auth_username', nextName)
    toast.success('Nombre actualizado en este dispositivo', { icon: null, origin: event?.submitter ?? null })
  }
  close()
}

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 680px)')
  syncViewport()
  mobileQuery.addEventListener('change', syncViewport)
})

onBeforeUnmount(() => mobileQuery?.removeEventListener('change', syncViewport))
onBeforeUnmount(() => webSessionRequest?.abort())

const navEntries = [
  { type: 'tab', id: 'account', label: 'Cuenta', icon: 'account_circle' },
  { type: 'heading', id: 'clinic-heading', label: 'Administracion' },
  { type: 'tab', id: 'ieps-profile', label: 'Mi IEPS', icon: 'school' },
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

const isWebProfessor = computed(() => auth.isWebProfessor())
const visibleNavEntries = computed(() => isWebProfessor.value
  ? navEntries.filter((entry) => entry.id === 'account')
  : navEntries)
const tabs = computed(() => visibleNavEntries.value.filter((entry) => entry.type === 'tab'))

async function loadWebSession() {
  if (webSession.value || webSessionLoading.value) return
  webSessionLoading.value = true
  webSessionError.value = ''
  webSessionRequest = new AbortController()
  try {
    webSession.value = await apiGet('/api/web/session', { signal: webSessionRequest.signal })
  } catch (error) {
    if (error.name !== 'AbortError') {
      webSessionError.value = error.message === 'No se pudo completar la operación.'
        ? 'No se pudo validar el acceso web. Despliega la versión del backend con la administración de miembros y roles.'
        : error.message || 'No se pudo validar tu acceso al equipo web.'
    }
  } finally {
    if (!webSessionRequest.signal.aborted) webSessionLoading.value = false
  }
}

watch(selectedTab, (tab) => {
  if (tab === 'members' || tab === 'roles') loadWebSession()
})

function moveTab(event, direction) {
  const currentIndex = tabs.value.findIndex((tab) => tab.id === selectedTab.value)
  const nextIndex = (currentIndex + direction + tabs.value.length) % tabs.value.length
  selectedTab.value = tabs.value[nextIndex].id
  event.currentTarget.parentElement
    ?.querySelector(`[data-tab="${tabs.value[nextIndex].id}"]`)
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
          <template v-for="entry in visibleNavEntries" :key="entry.id">
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
            <div class="settings-account-details settings-school-details simple-container direction-column gap-16 z-index-1 padding-8 h-padding-24 t-padding-24">
              <div class="simple-container direction-column cursor-default">
                <span class="title-large outline-text opacity-0-5">Correo</span>
                <span class="headline-small max-width-100 text-overflow-ellipsis on-background-text">{{ profileEmail }}</span>
              </div>
              <div class="simple-container direction-column">
                <span class="title-large outline-text cursor-default opacity-0-5">Nombre</span>
                <button
                  type="button"
                  class="text-link text-link-translucent text-link-squared display-large max-width-100 width-fit-content text-overflow-ellipsis outline-text settings-name-trigger"
                  aria-label="Editar nombre"
                  @click="openNameEditor"
                >
                  {{ profileName }}
                </button>
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
          v-else-if="selectedTab === 'ieps-profile'"
          id="settings-panel-ieps-profile"
          class="settings-account-scroll simple-container direction-column gap-8 grow-1 overflow-auto border-radius-32 padding-1"
          role="tabpanel"
          aria-labelledby="settings-tab-ieps-profile"
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

            <img
              class="settings-school-logo"
              src="/icons/peruano-suizo.png"
              alt="Emblema de la Institución Educativa Peruano Suizo"
              width="112"
              height="140"
            />

            <div class="settings-account-details simple-container direction-column gap-16 z-index-1 padding-8 h-padding-24 t-padding-24">
              <div class="settings-school-name-block simple-container direction-column">
                <span class="title-large outline-text cursor-default opacity-0-5">Nombre</span>
                <button
                  type="button"
                  class="text-link text-link-translucent text-link-squared headline-small max-width-100 width-fit-content outline-text settings-name-trigger settings-school-name"
                  aria-label="Editar nombre de la institución"
                  @click="openNameEditor($event, 'school')"
                >
                  {{ schoolName }}
                </button>
              </div>
              <div class="simple-container direction-column cursor-default">
                <span class="title-large outline-text opacity-0-5">Ubicación</span>
                <span class="headline-small max-width-100 outline-text">
                  Comas, Lima, Perú
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="selectedTab === 'members' || selectedTab === 'roles'"
          :id="`settings-panel-${selectedTab}`"
          class="settings-management-scroll simple-container direction-column grow-1 overflow-auto"
          role="tabpanel"
          :aria-labelledby="`settings-tab-${selectedTab}`"
          tabindex="0"
        >
          <div v-if="webSessionLoading" class="settings-access-placeholder content-box background outline-light-1 border-radius-32 padding-24 animation-loading-1" aria-busy="true"></div>
          <div v-else-if="webSessionError" class="settings-access-placeholder content-box background outline-light-1 border-radius-32 padding-24" role="alert">
            <md-icon aria-hidden="true">lock</md-icon>
            <span class="body-large">{{ webSessionError }}</span>
          </div>
          <SettingsMembersPanel v-else-if="selectedTab === 'members' && webSession" :session="webSession" />
          <SettingsRolesPanel v-else-if="selectedTab === 'roles' && webSession" :session="webSession" />
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

      <FlipModal
        v-if="nameEditor.open.value"
        :origin="nameEditor.origin.value"
        placement="bottom-left"
        backdrop-class="modal-justify-left modal-align-bottom"
        window-class="slim style-translucent-inverted padding-16 settings-name-editor"
        content-class="simple-container direction-column gap-16"
        @close="nameEditor.hide"
      >
        <template #default="{ close }">
          <form
            class="simple-container direction-column gap-8 settings-name-form"
            autocomplete="off"
            novalidate
            @submit.prevent="saveName(close, $event)"
          >
            <div data-input-label="Nombre">
              <input
                ref="nameInput"
                v-model="editedName"
                type="text"
                class="style-6 settings-name-input"
                name="name"
                required
                minlength="2"
                maxlength="120"
                placeholder="Ana García"
                autocomplete="name"
              />
            </div>
            <div class="simple-container gap-8">
              <button
                type="button"
                class="style-7 flex-1 for-icon small outline-text transparent rounded"
                aria-label="Cancelar edición del nombre"
                @click="close()"
              >
                <md-ripple aria-hidden="true"></md-ripple>
                <md-icon aria-hidden="true">close</md-icon>
              </button>
              <button
                type="submit"
                class="style-7 flex-1 transparent primary-text rounded variant-bright"
                aria-label="Guardar nombre"
              >
                <md-ripple aria-hidden="true"></md-ripple>
                <md-icon aria-hidden="true">check</md-icon>
              </button>
            </div>
          </form>
        </template>
      </FlipModal>
    </template>
  </FlipModal>
</template>

<style scoped>
.settings-name-trigger {
  max-width: 100%;
  padding: 2px 8px;
  margin: -2px -8px;
  border: 0;
  border-radius: 16px;
  box-sizing: border-box;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 200ms ease;
}

.settings-name-trigger:hover {
  background: rgba(var(--md-sys-color-neutral-on-background), 0.1);
}

.settings-name-trigger:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.settings-name-form,
.settings-name-form > div:first-child,
.settings-name-form input {
  width: 100%;
}

.settings-management-scroll {
  flex: 1 1 auto;
  min-height: 0;
}

.settings-access-placeholder {
  display: flex;
  flex: 1 1 auto;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--md-sys-color-outline);
  text-align: center;
}

.settings-access-placeholder md-icon {
  --md-icon-size: 32px;
}

</style>
