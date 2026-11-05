<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useModal } from '../composables/useModal'
import { useAuthStore } from '../stores/auth'
import ModalCreate from '../components/ModalCreate.vue'
import SelectFlip from '../components/SelectFlip.vue'
import { moduleAvailability } from '../config/modules'
import { apiGetCached } from '../services/api'

const create = useModal()
const auth = useAuthStore()
const selectedGroup = ref('pending')

function onRecentTabKeydown(event) {
  const tabs = ['pending', 'completed']
  const currentIndex = tabs.indexOf(selectedGroup.value)
  let nextIndex = currentIndex

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (currentIndex + 1) % tabs.length
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = tabs.length - 1
  } else {
    return
  }

  event.preventDefault()
  selectedGroup.value = tabs[nextIndex]
  document.getElementById(`home-recent-tab-${tabs[nextIndex]}`)?.focus()
}

const todayLabel = new Intl.DateTimeFormat('es-PE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date()).replace(/^./, (letter) => letter.toLocaleUpperCase('es-PE'))

const attendancePreview = ref([
  { label: 'Lun', total: 0 },
  { label: 'Mar', total: 0 },
  { label: 'Mié', total: 0 },
  { label: 'Jue', total: 0 },
  { label: 'Vie', total: 0 },
])
const attendancePeriod = ref('week')
const attendanceSummaryLoading = ref(true)
const attendanceSummaryError = ref('')
let attendanceSummaryController
const hasAttendanceSummary = computed(() => attendancePreview.value.some(({ total }) => total > 0))
const attendancePeriodOptions = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
]

const attendanceScaleMax = 800
const weeklyChartElement = ref(null)
const weeklyChartSize = ref({ width: 720, height: 360 })
const weeklyTooltip = ref(null)
let weeklyChartObserver

const weekChart = computed(() => {
  const width = weeklyChartSize.value.width
  const height = weeklyChartSize.value.height
  const top = 28
  const bottom = 32
  const plotWidth = Math.min(width * 0.82, 900)
  const left = (width - plotWidth) / 2
  const plotHeight = height - top - bottom
  const slot = plotWidth / attendancePreview.value.length
  const maxBarHeight = plotHeight * 0.9

  return {
    width,
    height,
    left,
    max: Math.max(1, ...attendancePreview.value.map(({ total }) => total)),
    scaleMax: attendanceScaleMax,
    baseline: height - bottom,
    maxBarHeight,
    slot,
    barWidth: Math.min(slot * 0.82, 136),
  }
})

function localDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function homeAttendanceRange() {
  const today = new Date()
  if (attendancePeriod.value === 'month') {
    return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today }
  }
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const weekday = monday.getDay() || 7
  monday.setDate(monday.getDate() - weekday + 1 - (weekday > 5 ? 7 : 0))
  const friday = new Date(monday)
  friday.setDate(friday.getDate() + 4)
  return { start: monday, end: friday }
}

async function loadHomeAttendance() {
  attendanceSummaryController?.abort()
  const controller = new AbortController()
  attendanceSummaryController = controller
  attendanceSummaryLoading.value = true
  attendanceSummaryError.value = ''
  const { start, end } = homeAttendanceRange()
  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

  try {
    const rows = await apiGetCached(
      `/api/admin/asistencia/historial?desde=${localDateKey(start)}&hasta=${localDateKey(end)}`,
      { signal: controller.signal, ttlMs: 30_000 },
    )
    if (controller.signal.aborted) return
    const totals = [0, 0, 0, 0, 0]
    ;(Array.isArray(rows) ? rows : []).forEach((row) => {
      const [year, month, day] = String(row.fecha).slice(0, 10).split('-').map(Number)
      const weekday = new Date(year, month - 1, day).getDay()
      if (weekday >= 1 && weekday <= 5) {
        totals[weekday - 1] += (Number(row.presentes) || 0) + (Number(row.tardanzas) || 0)
      }
    })
    attendancePreview.value = labels.map((label, index) => ({ label, total: totals[index] }))
  } catch (error) {
    if (error.name === 'AbortError') return
    attendancePreview.value = labels.map((label) => ({ label, total: 0 }))
    attendanceSummaryError.value = error.message || 'No se pudo cargar el resumen de asistencias.'
  } finally {
    if (!controller.signal.aborted) attendanceSummaryLoading.value = false
  }
}

watch(attendancePeriod, loadHomeAttendance)

onMounted(() => {
  if (weeklyChartElement.value && typeof ResizeObserver !== 'undefined') {
    weeklyChartObserver = new ResizeObserver(([entry]) => {
      weeklyChartSize.value = {
        width: Math.max(1, entry.contentRect.width),
        height: Math.max(220, entry.contentRect.height),
      }
    })
    weeklyChartObserver.observe(weeklyChartElement.value)
  }
  loadHomeAttendance()
})

onBeforeUnmount(() => {
  weeklyChartObserver?.disconnect()
  attendanceSummaryController?.abort()
})

function weekBarX(index) {
  const chart = weekChart.value
  return chart.left + index * chart.slot + (chart.slot - chart.barWidth) / 2
}

function weekBarY(total) {
  const chart = weekChart.value
  return chart.baseline - weekBarHeight(total)
}

function weekBarHeight(total) {
  const chart = weekChart.value
  if (total <= 0) return 0

  const boundedTotal = Math.min(total, chart.scaleMax)
  const minimumHeight = Math.min(chart.barWidth, chart.maxBarHeight)
  const growthRange = chart.maxBarHeight - minimumHeight
  const weekScaleMax = Math.min(chart.max, chart.scaleMax)
  return minimumHeight + (boundedTotal / weekScaleMax) * growthRange
}

function showWeeklyTooltip(day, event) {
  const bounds = weeklyChartElement.value?.getBoundingClientRect()
  if (!bounds) return

  const pointerX = event.clientX || bounds.left + bounds.width / 2
  const pointerY = event.clientY || bounds.top + bounds.height / 2
  const tooltipWidth = Math.min(144, bounds.width - 16)

  weeklyTooltip.value = {
    x: Math.min(Math.max(tooltipWidth / 2, pointerX - bounds.left), bounds.width - tooltipWidth / 2),
    y: Math.max(40, pointerY - bounds.top),
    total: day.total,
  }
}

function hideWeeklyTooltip() {
  weeklyTooltip.value = null
}
</script>

<template>
  <main class="app-view home-dashboard">
    <header class="app-header home-header">
      <h1 class="display-medium weight-500 text-gradient">Inicio</h1>
      <button
        :disabled="!moduleAvailability.crearTramite"
        title="Disponible más adelante"
        class="style-7 rounded surface-container-low on-background-text for-icon only-on-mobile"
        type="button"
        aria-label="Crear trámite"
        @click="create.show"
      >
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon data-shared-item="addIcon" aria-hidden="true">add</md-icon>
      </button>
      <button
        :disabled="!moduleAvailability.crearTramite"
        title="Disponible más adelante"
        class="style-7 rounded surface-container-low on-background-text with-icon-left hide-on-mobile"
        type="button"
        @click="create.show"
      >
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon data-shared-item="addIcon" aria-hidden="true">add</md-icon>
        <span>Crear trámite</span>
      </button>
    </header>

    <div class="app-view-content">
      <section class="dashboard-grid" aria-label="Resumen de trámites">
        <div class="simple-container direction-column gap-0 area-greeting">
          <div class="simple-container direction-column padding-16 only-on-mobile">
            <span class="headline-small weight-600">Hola{{ auth.username ? ` ${auth.username}` : '' }}</span>
            <span class="body-medium outline-text">{{ todayLabel }}</span>
          </div>

          <article class="greeting-card content-box light-color gap-24 position-relative overflow-hidden grow-1">
            <div class="simple-container direction-column hide-on-mobile">
              <span class="headline-small weight-600">Hola{{ auth.username ? ` ${auth.username}` : '' }}</span>
              <span class="body-medium outline-text">{{ todayLabel }}</span>
            </div>

            <div class="simple-container direction-column gap-8">
              <span class="body-large weight-500 opacity-0-8 line-height-1">Hoy tienes</span>
              <span class="display-medium weight-600 line-height-1 simple-container align-center gap-8">
                <span>0</span>
                <span>Trámites</span>
              </span>
            </div>

            <div class="simple-container position-absolute bottom-16 right-16">
              <button
                :disabled="!moduleAvailability.crearTramite"
                title="Disponible más adelante"
                class="style-7 for-icon big rounded variant-bright primary-container on-primary-container-text greeting-add"
                type="button"
                aria-label="Crear trámite"
                @click="create.show"
              >
                <md-ripple aria-hidden="true"></md-ripple>
                <md-icon class="filled" aria-hidden="true">note_add</md-icon>
              </button>
            </div>
          </article>
        </div>

        <article class="content-box background outline-light-1 gap-0 justify-center area-today">
          <span class="headline-small outline-text">Hoy:</span>
          <span class="headline-small weight-600">Sin trámites hoy</span>
        </article>

        <article class="content-box background outline-light-1 gap-0 justify-center area-next">
          <span class="headline-small outline-text">Tu próximo trámite:</span>
          <span class="headline-small weight-600 outline-text">No tienes ninguno</span>
        </article>

        <article class="content-box background outline-light-1 padding-8 gap-8 overflow-hidden area-events">
          <div class="simple-container direction-column gap-8 padding-16 b-padding-0">
            <h2 class="headline-small weight-500">Trámites recientes</h2>
            <div
              class="pretty-tabs size-md orientation-horizontal variant-solid home-recent-tabs"
              role="tablist"
              aria-orientation="horizontal"
              aria-label="Estado de los trámites"
            >
              <span
                class="pretty-tabs__indicator"
                :class="{ 'is-completed': selectedGroup === 'completed' }"
                aria-hidden="true"
              ></span>
              <button
                type="button"
                role="tab"
                id="home-recent-tab-pending"
                class="pretty-tabs__tab"
                :class="{ active: selectedGroup === 'pending' }"
                :aria-selected="selectedGroup === 'pending'"
                :aria-controls="'home-recent-panel'"
                :tabindex="selectedGroup === 'pending' ? 0 : -1"
                @click="selectedGroup = 'pending'"
                @keydown="onRecentTabKeydown"
              >
                <span>Pendientes</span>
              </button>
              <button
                type="button"
                role="tab"
                id="home-recent-tab-completed"
                class="pretty-tabs__tab"
                :class="{ active: selectedGroup === 'completed' }"
                :aria-selected="selectedGroup === 'completed'"
                :aria-controls="'home-recent-panel'"
                :tabindex="selectedGroup === 'completed' ? 0 : -1"
                @click="selectedGroup = 'completed'"
                @keydown="onRecentTabKeydown"
              >
                <span>Completados</span>
              </button>
            </div>
          </div>

          <div class="simple-container direction-column grow-1 overflow-auto scrollbar-hidden h-padding-8">
            <div class="simple-container grow-1">
              <div
                id="home-recent-panel"
                class="simple-container direction-column grow-1 vh-center gap-8"
                role="tabpanel"
                :aria-labelledby="`home-recent-tab-${selectedGroup}`"
                tabindex="0"
              >
                <md-icon class="pretty-minimal outline-text" aria-hidden="true">person_celebrate</md-icon>
                <span class="body-large weight-500 outline-text text-center">No hay trámites</span>
              </div>
            </div>
          </div>
        </article>

        <article class="content-box background outline-light-1 padding-8 gap-8 area-requests">
          <div class="attendance-chart-header simple-container direction-row align-center justify-between gap-8 padding-16 b-padding-0">
            <h2 class="headline-small weight-500">Resumen de asistencias</h2>
            <div class="attendance-period-select">
              <SelectFlip
                v-model="attendancePeriod"
                name="attendance-period"
                aria-label="Periodo del resumen de asistencias"
                :options="attendancePeriodOptions"
                :width="176"
                :option-height="48"
              />
            </div>
          </div>

          <div
            ref="weeklyChartElement"
            class="weekly-attendance-chart simple-container direction-column grow-1"
            role="group"
            :aria-label="`Resumen de presentes y tardanzas de lunes a viernes para el periodo ${attendancePeriod === 'week' ? 'semanal' : 'mensual'}.`"
          >
            <svg
              class="weekly-attendance-svg"
              :viewBox="`0 0 ${weekChart.width} ${weekChart.height}`"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <g v-for="(day, index) in attendancePreview" :key="day.label">
                <rect
                  class="weekly-bar"
                  :x="weekBarX(index)"
                  :y="weekBarY(day.total)"
                  :width="weekChart.barWidth"
                  :height="weekBarHeight(day.total)"
                  :rx="weekChart.barWidth / 2"
                  @pointerenter="showWeeklyTooltip(day, $event)"
                  @pointermove="showWeeklyTooltip(day, $event)"
                  @pointerleave="hideWeeklyTooltip"
                >
                </rect>
                <text
                  class="weekly-day-label"
                  :x="weekBarX(index) + weekChart.barWidth / 2"
                  :y="weekChart.height - 8"
                  text-anchor="middle"
                >
                  {{ day.label }}
                </text>
              </g>
            </svg>
            <div v-if="attendanceSummaryLoading" class="weekly-attendance-state body-medium outline-text" role="status">
              Cargando resumen…
            </div>
            <div v-else-if="attendanceSummaryError" class="weekly-attendance-state body-medium outline-text" role="alert">
              <span>{{ attendanceSummaryError }}</span>
              <button type="button" class="style-7 rounded background on-background-text" @click="loadHomeAttendance">
                Reintentar
              </button>
            </div>
            <div v-else-if="!hasAttendanceSummary" class="weekly-attendance-state body-medium outline-text" role="status">
              Sin ingresos registrados en este periodo
            </div>
            <div
              v-if="weeklyTooltip"
              class="weekly-attendance-tooltip"
              role="tooltip"
              :aria-label="`${weeklyTooltip.total} asistencias`"
              :style="{ left: `${weeklyTooltip.x}px`, top: `${weeklyTooltip.y}px` }"
            >
              <span class="weekly-tooltip-value">{{ weeklyTooltip.total }}</span>
            </div>
          </div>
        </article>
      </section>
    </div>
    <ModalCreate
      v-if="moduleAvailability.crearTramite && create.open.value"
      :origin="create.origin.value"
      @close="create.hide"
    />
  </main>

</template>

<style scoped>
.home-dashboard {
  min-width: 0;
}

.home-header {
  flex: 0 0 auto;
}

.home-header h1,
.area-events h2,
.area-requests h2 {
  margin: 0;
}

.attendance-chart-header {
  flex-wrap: wrap;
}

.attendance-period-select {
  flex: 0 0 144px;
  width: 144px;
  max-width: 45%;
  margin-left: auto;
}

.app-view-content {
  display: flex;
  container-name: home-content;
  container-type: inline-size;
  min-width: 0;
  min-height: 0;
  flex: 1 1 0;
}

.dashboard-grid {
  display: grid;
  width: 100%;
  min-width: 0;
  min-height: 0;
  flex: 1 1 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    'greeting today next'
    'events requests requests';
  gap: 8px;
}

.area-greeting {
  grid-area: greeting;
}

.area-today {
  grid-area: today;
}

.area-next {
  grid-area: next;
}

.area-events {
  grid-area: events;
}

.area-requests {
  grid-area: requests;
}

.greeting-card {
  justify-content: center;
}

.greeting-add {
  flex: 0 0 auto;
}

.area-events,
.area-requests {
  min-width: 0;
  min-height: 0;
}

.area-events > .simple-container:last-child,
.area-requests > .simple-container:last-child {
  min-height: 0;
}

.weekly-attendance-chart {
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 220px;
  align-self: stretch;
}

.weekly-attendance-svg {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: visible;
}

.weekly-attendance-state {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
  pointer-events: none;
}

.weekly-attendance-state button {
  pointer-events: auto;
}

.weekly-day-label {
  fill: var(--md-sys-color-outline);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.weekly-bar {
  fill: var(--md-sys-color-primary);
  opacity: 0.82;
  transition: opacity 160ms ease;
}

.weekly-bar:hover {
  opacity: 1;
}

.weekly-attendance-tooltip {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 4px 8px;
  border-radius: 8px;
  background: var(--md-sys-color-inverse-surface);
  color: var(--md-sys-color-inverse-on-surface);
  font-size: 0.7rem;
  line-height: 1.2;
  white-space: nowrap;
  box-shadow: 0 2px 8px #00000026;
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 8px));
  animation: weekly-tooltip-in 120ms ease both;
}

.weekly-tooltip-value {
  font-size: 1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

@keyframes weekly-tooltip-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.home-recent-tabs {
  position: relative;
  display: flex;
  width: max-content;
  max-width: 100%;
  gap: 4px;
  padding: 4px;
  border-radius: 64px;
  background: var(--md-sys-color-surface-container-low);
  overflow: hidden;
}

.home-recent-tabs .pretty-tabs__indicator {
  position: absolute;
  z-index: 0;
  top: 4px;
  left: 4px;
  width: calc((100% - 12px) / 2);
  height: 36px;
  border-radius: 99em;
  background: var(--md-sys-color-surface);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--md-sys-color-outline) 8%, transparent);
  pointer-events: none;
  transition: transform 225ms cubic-bezier(0.48, 0, 0, 1);
}

.home-recent-tabs .pretty-tabs__indicator.is-completed {
  transform: translateX(calc(100% + 4px));
}

.home-recent-tabs .pretty-tabs__tab {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex: 1 1 50%;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  min-width: 112px;
  padding: 0 12px;
  border: 0;
  border-radius: 99em;
  appearance: none;
  background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  font: 500 14px/1 var(--app-main-font, sans-serif);
  white-space: nowrap;
  cursor: pointer;
  transition: color 200ms ease, background-color 200ms ease;
}

.home-recent-tabs .pretty-tabs__tab.active {
  color: var(--md-sys-color-on-surface);
}

.home-recent-tabs .pretty-tabs__tab:not(.active):hover {
  background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 5%, transparent);
}

.home-recent-tabs .pretty-tabs__tab:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: -2px;
}

@container home-content (max-width: 960px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: auto auto minmax(320px, 1fr);
    grid-template-areas:
      'greeting greeting'
      'today next'
      'events requests';
  }

  .area-greeting,
  .area-today,
  .area-next,
  .area-events,
  .area-requests {
    min-width: 0;
  }

  .area-events,
  .area-requests {
    min-height: 320px;
  }
}

@container home-content (max-width: 600px) {
  .dashboard-grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    grid-template-areas:
      'greeting'
      'today'
      'next'
      'events'
      'requests';
  }
}

@media (max-width: 680px) {
  .home-dashboard {
    flex: 0 0 auto;
  }

  .home-header {
    display: none;
  }

  .app-view-content {
    display: block;
    min-height: auto;
    flex: 0 0 auto;
  }

  .dashboard-grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    grid-template-areas:
      'greeting'
      'today'
      'next'
      'events'
      'requests';
  }

  .area-events,
  .area-requests {
    min-height: 320px;
  }

  .greeting-card {
    border-radius: 40px;
    padding: 32px;
    background: var(--md-sys-color-primary-container) !important;
    color: var(--md-sys-color-on-primary-container);
    box-shadow:
      0 0 0 0.5px color-mix(in srgb, var(--md-sys-color-primary-container), transparent 88%),
      0 1px 2.5px color-mix(in srgb, var(--md-sys-color-primary-container), transparent 76%);
  }

  .greeting-card::before {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(180deg, rgb(255 255 255 / 17%) 0%, transparent 100%);
    content: '';
    pointer-events: none;
  }

  .greeting-add {
    background-color: var(--md-sys-color-on-primary-container);
    color: var(--md-sys-color-primary-container);
  }
}
</style>
