<script setup>
import { computed, ref } from 'vue'
import FlipModal from './FlipModal.vue'

const props = defineProps({
  origin: { type: Object, default: null },
  date: { type: [Date, String, Number], default: null },
  events: { type: Array, default: () => [] },
})

const emit = defineEmits(['close'])
const activeTab = ref('list')

const statusClasses = {
  Pendiente: 'status-pending',
  'En Revision': 'status-review',
  Finalizado: 'status-completed',
  Rechazado: 'status-rejected',
}

const formattedDate = computed(() => {
  if (!props.date) return 'Trámites del día'

  const label = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(props.date))

  return label.charAt(0).toUpperCase() + label.slice(1)
})

const sortedEvents = computed(() =>
  [...props.events].sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion)),
)

function formatTime(value) {
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function statusLabel(status) {
  return status === 'En Revision' ? 'En revisión' : status
}

function onTabKeydown(event) {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return

  event.preventDefault()
  activeTab.value = activeTab.value === 'list' ? 'agenda' : 'list'
}
</script>

<template>
  <FlipModal
    :origin="origin"
    backdrop-class="no-backdrop"
    window-class="increased side-panel calendar-day-side-panel padding-8 border-radius-40 outline-light-1 max-width-600"
    content-class="simple-container direction-column gap-8 grow-1"
    close-strategy="container-only"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <div class="calendar-day-modal">
        <header class="calendar-day-modal-header content-box background outline-light-1 border-radius-32">
          <button
            type="button"
            class="style-7 for-icon small rounded surface-container-low outline-text"
            aria-label="Cerrar detalle del día"
            @click="close()"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon aria-hidden="true">close</md-icon>
          </button>

          <div class="calendar-day-modal-heading">
            <div class="simple-container direction-column gap-4">
              <span class="headline-small weight-600">{{ formattedDate }}</span>
              <span class="body-medium outline-text">
                {{ events.length }} {{ events.length === 1 ? 'trámite registrado' : 'trámites registrados' }}
              </span>
            </div>
          </div>
        </header>

        <div
          class="pretty-tabs size-md orientation-horizontal variant-solid calendar-day-tabs"
          role="tablist"
          aria-orientation="horizontal"
          aria-label="Vista de trámites del día"
        >
          <span
            class="pretty-tabs__indicator"
            :class="{ 'is-agenda': activeTab === 'agenda' }"
            aria-hidden="true"
          ></span>
          <button
            type="button"
            role="tab"
            class="pretty-tabs__tab"
            :class="{ active: activeTab === 'list' }"
            :aria-selected="activeTab === 'list'"
            :tabindex="activeTab === 'list' ? 0 : -1"
            aria-controls="calendar-day-list-panel"
            @click="activeTab = 'list'"
            @keydown="onTabKeydown"
          >
            <md-icon aria-hidden="true">view_list</md-icon>
            <span>Lista</span>
          </button>
          <button
            type="button"
            role="tab"
            class="pretty-tabs__tab"
            :class="{ active: activeTab === 'agenda' }"
            :aria-selected="activeTab === 'agenda'"
            :tabindex="activeTab === 'agenda' ? 0 : -1"
            aria-controls="calendar-day-agenda-panel"
            @click="activeTab = 'agenda'"
            @keydown="onTabKeydown"
          >
            <md-icon aria-hidden="true">event_note</md-icon>
            <span>Agenda</span>
          </button>
        </div>

        <div
          v-if="activeTab === 'list'"
          id="calendar-day-list-panel"
          class="calendar-day-event-list"
          role="tabpanel"
          aria-label="Lista de trámites"
        >
          <article
            v-for="tramite in sortedEvents"
            :key="tramite.id"
            class="calendar-day-event-card"
            :class="statusClasses[tramite.estado]"
          >
            <div class="calendar-day-event-card-top">
              <md-icon class="calendar-day-event-dot" aria-hidden="true">circle</md-icon>
              <span class="body-large weight-600 calendar-day-event-name">
                {{ tramite.nombre_ciudadano }}
              </span>
              <span class="body-medium weight-600 calendar-day-event-time">
                {{ formatTime(tramite.fecha_creacion) }}
              </span>
            </div>
            <div class="calendar-day-event-card-bottom">
              <span class="label-medium calendar-day-event-type">{{ tramite.tipo_tramite }}</span>
              <span class="calendar-day-event-status">{{ statusLabel(tramite.estado) }}</span>
            </div>
          </article>
        </div>

        <div
          v-else
          id="calendar-day-agenda-panel"
          class="calendar-day-agenda"
          role="tabpanel"
          aria-label="Agenda de trámites"
        >
          <div
            v-for="tramite in sortedEvents"
            :key="tramite.id"
            class="calendar-day-agenda-item"
          >
            <span class="label-medium outline-text calendar-day-agenda-time">
              {{ formatTime(tramite.fecha_creacion) }}
            </span>
            <div
              class="calendar-day-agenda-card"
              :class="statusClasses[tramite.estado]"
            >
              <div class="calendar-day-event-card-top">
                <md-icon class="calendar-day-event-dot" aria-hidden="true">circle</md-icon>
                <span class="body-medium weight-600 calendar-day-event-name">
                  {{ tramite.nombre_ciudadano }}
                </span>
              </div>
              <span class="label-medium calendar-day-event-type">{{ tramite.tipo_tramite }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </FlipModal>
</template>
