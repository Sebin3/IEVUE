<script setup>
import { computed, ref } from 'vue'
import { useStore } from '../stores/data'
import { useModal } from '../composables/useModal'
import ModalFilters from '../components/ModalFilters.vue'
import CalendarDayModal from '../components/CalendarDayModal.vue'

const { state, filteredTramites } = useStore()
const filters = useModal()
const dayDetails = useModal()

const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function tramiteDateKey(tramite) {
  return toDateKey(new Date(tramite.fecha_creacion))
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const firstTramite = [...state.tramites].sort(
  (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion),
)[0]
const initialDate = firstTramite ? new Date(firstTramite.fecha_creacion) : new Date()

const viewDate = ref(startOfMonth(initialDate))

const monthLabel = computed(() =>
  capitalizeFirst(
    new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(viewDate.value),
  ),
)

const eventsByDate = computed(() => {
  const grouped = new Map()

  for (const tramite of filteredTramites.value) {
    const key = tramiteDateKey(tramite)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(tramite)
  }

  return grouped
})

const calendarDays = computed(() => {
  const first = startOfMonth(viewDate.value)
  const offset = first.getDay()
  const total = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 0).getDate()
  const previousTotal = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 0).getDate()
  const cells = []

  for (let index = offset - 1; index >= 0; index -= 1) {
    const date = new Date(
      viewDate.value.getFullYear(),
      viewDate.value.getMonth() - 1,
      previousTotal - index,
    )
    cells.push({ date, day: date.getDate(), outside: true })
  }

  for (let day = 1; day <= total; day += 1) {
    const date = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), day)
    cells.push({ date, day, outside: false })
  }

  while (cells.length < 42) {
    const date = new Date(
      viewDate.value.getFullYear(),
      viewDate.value.getMonth() + 1,
      cells.length - offset - total + 1,
    )
    cells.push({ date, day: date.getDate(), outside: true })
  }

  return cells
})

const statusClasses = {
  Pendiente: 'status-pending',
  'En Revision': 'status-review',
  Finalizado: 'status-completed',
  Rechazado: 'status-rejected',
}

function eventsForDay(day) {
  return eventsByDate.value.get(toDateKey(day.date)) || []
}

function visibleEvents(day) {
  return eventsForDay(day).slice(0, 3)
}

function openDayDetails(day, event) {
  const dayCard = event.currentTarget.closest('.calendar-page-day')
  dayDetails.show({ currentTarget: dayCard }, {
    date: day.date,
    events: eventsForDay(day),
  })
}

function isToday(date) {
  return toDateKey(date) === toDateKey(new Date())
}

function changeMonth(amount) {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + amount, 1)
}

function formatTime(value) {
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function capitalizeFirst(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
</script>

<template>
  <div class="app-view">
    <div class="simple-container direction-column gap-24 grow-1">
      <div class="app-header calendar-page-header">
        <h1 class="display-medium weight-500 text-gradient">{{ monthLabel }}</h1>

        <div class="calendar-toolbar">
          <button
            class="style-7 for-icon bigger hover-border-radius-round background outline-light-1 outline-text calendar-filter-button"
            type="button"
            aria-label="Filtrar trámites"
            @click="filters.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon data-shared-item="icon" aria-hidden="true">page_info</md-icon>
          </button>

          <div
            class="calendar-view-switcher background outline-light-1"
            role="group"
            aria-label="Vistas del calendario"
          >
            <button
              class="style-7 for-icon bigger hover-border-radius-round surface-container-low outline-text calendar-view-button"
              type="button"
              disabled
              aria-label="Vista de agenda próximamente"
              title="Vista de agenda próximamente"
            >
              <md-icon aria-hidden="true">view_list</md-icon>
            </button>
            <button
              class="style-7 for-icon bigger hover-border-radius-round surface-container-low outline-text calendar-view-button"
              type="button"
              disabled
              aria-label="Vista semanal próximamente"
              title="Vista semanal próximamente"
            >
              <md-icon aria-hidden="true">view_week</md-icon>
            </button>
            <button
              class="style-7 for-icon bigger hover-border-radius-round primary-container on-primary-container-text calendar-view-button active"
              type="button"
              aria-label="Vista mensual activa"
              aria-pressed="true"
            >
              <md-icon aria-hidden="true">calendar_view_month</md-icon>
            </button>
            <button
              class="style-7 for-icon bigger hover-border-radius-round surface-container-low outline-text calendar-view-button"
              type="button"
              disabled
              aria-label="Vista de cuadrícula próximamente"
              title="Vista de cuadrícula próximamente"
            >
              <md-icon aria-hidden="true">apps</md-icon>
            </button>
          </div>

          <div class="calendar-month-controls">
            <button
              class="nav-btn calendar-month-arrow"
              type="button"
              aria-label="Mes anterior"
              @click="changeMonth(-1)"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon aria-hidden="true">arrow_back</md-icon>
            </button>
            <button
              class="nav-btn calendar-month-arrow"
              type="button"
              aria-label="Mes siguiente"
              @click="changeMonth(1)"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon aria-hidden="true">arrow_forward</md-icon>
            </button>
          </div>
        </div>
      </div>

      <div class="calendar-page-surface" aria-label="Calendario de trámites">
        <div class="calendar calendar-page" data-v-d977793a>
          <div class="calendar-grid calendar-page-grid" data-v-d977793a>
            <span
              v-for="(weekday, index) in weekdays"
              :key="`${weekday}-${index}`"
              class="weekday"
              data-v-d977793a
            >
              <span class="calendar-weekday-label">{{ weekday }}</span>
              <span class="calendar-weekday-label-mobile" aria-hidden="true">
                {{ weekday.slice(0, 1) }}
              </span>
            </span>

            <div
              v-for="day in calendarDays"
              :key="toDateKey(day.date)"
              class="day calendar-page-day"
              data-v-d977793a
              :class="{
                outside: day.outside,
                today: isToday(day.date),
                'has-events': !day.outside && eventsForDay(day).length > 0,
              }"
              :aria-label="
                day.outside
                  ? undefined
                  : `${day.day} de ${monthLabel}, ${eventsForDay(day).length} trámites`
              "
            >
              <button
                v-if="!day.outside"
                type="button"
                class="calendar-day-action"
                :aria-label="`Ver trámites del ${day.day} de ${monthLabel}`"
                @click="openDayDetails(day, $event)"
              ></button>
              <button
                v-if="!day.outside"
                type="button"
                class="calendar-day-expand"
                aria-label="Ver trámites del día"
                title="Ver trámites del día"
                @click.stop="openDayDetails(day, $event)"
              >
                <md-icon>expand_content</md-icon>
              </button>
              <span class="calendar-day-number">{{ day.day }}</span>

              <div
                v-if="!day.outside && eventsForDay(day).length"
                class="calendar-day-mobile-events"
                aria-hidden="true"
              >
                <span
                  v-for="tramite in eventsForDay(day).slice(0, 3)"
                  :key="`mobile-${tramite.id}`"
                  class="calendar-day-mobile-event-dot"
                  :class="statusClasses[tramite.estado]"
                ></span>
              </div>

              <div v-if="!day.outside && eventsForDay(day).length" class="calendar-day-events">
                <button
                  v-for="tramite in visibleEvents(day)"
                  :key="tramite.id"
                  type="button"
                  class="calendar-event-chip variant-bright"
                  :class="statusClasses[tramite.estado]"
                  :aria-label="`${tramite.tipo_tramite} de ${tramite.nombre_ciudadano}, ${formatTime(tramite.fecha_creacion)}`"
                  :title="`${tramite.tipo_tramite} · ${tramite.nombre_ciudadano}`"
                >
                  <md-icon class="calendar-event-chip-dot" aria-hidden="true">circle</md-icon>
                  <span class="calendar-event-chip-name">{{ tramite.nombre_ciudadano }}</span>
                  <span class="calendar-event-chip-time">{{ formatTime(tramite.fecha_creacion) }}</span>
                </button>
                <span v-if="eventsForDay(day).length > 3" class="calendar-more-events">
                  +{{ eventsForDay(day).length - 3 }} más
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalFilters
    v-if="filters.open.value"
    :origin="filters.origin.value"
    @close="filters.hide"
  />

  <CalendarDayModal
    v-if="dayDetails.open.value"
    :origin="dayDetails.origin.value"
    :date="dayDetails.payload.value?.date"
    :events="dayDetails.payload.value?.events || []"
    @close="dayDetails.hide"
  />
</template>
