<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useModal } from '../composables/useModal'
import { usePagination } from '../composables/usePagination'
import FlipModal from '../components/FlipModal.vue'
import ModalSearch from '../components/ModalSearch.vue'
import ModalFilters from '../components/ModalFilters.vue'
import MobileActionMenu from '../components/MobileActionMenu.vue'
import PaginationControls from '../components/PaginationControls.vue'
import SelectFlip from '../components/SelectFlip.vue'
import { apiGet, apiGetCached, apiPost, apiPut } from '../services/api'
import { useAuthStore } from '../stores/auth'
import { toast } from 'super-beautiful-toast'
import { serializeCsvRows } from '../utils/csv'

const viewMode = ref('grid')
const searchQuery = ref('')
const attendanceSort = ref('date-desc')
const attendancePeriod = ref('week')
const attendanceWeekOffset = ref(0)
const attendanceMonth = ref('')
const attendanceYear = ref('')
const search = useModal()
const filters = useModal()
const details = useModal()
const removeAttendance = useModal()
const editAttendance = useModal()
const auth = useAuthStore()
const attendanceRecords = ref([])
const attendanceSections = ref([])
const attendanceSectionsError = ref('')
const attendanceDetailRows = ref([])
const attendanceLoading = ref(true)
const attendanceLoadError = ref('')
const attendanceDetailLoading = ref(false)
const attendanceDetailError = ref('')
const attendanceDeleteLoading = ref(false)
const attendanceEditLoading = ref(false)
const attendanceEditError = ref('')
const attendanceEditState = ref('')
const isMobileDetailNav = ref(false)
const activeDetailSection = ref('statistics')
const selectedAttendancePointIndex = ref(null)
const selectedAttendanceTooltipPosition = ref(null)
const attendanceHourlyChartElement = ref(null)
const attendanceHourlySvgElement = ref(null)
const attendanceChartSize = ref({ width: 720, height: 380 })
const attendanceChartLoadingBars = [24, 38, 31, 66, 44, 82, 58, 36, 48, 27, 55, 40]
let attendanceDetailMediaQuery
let attendanceDetailController
let attendanceHistoryController
let attendanceChartObserver

const canEditAttendance = computed(() => ['profesor', 'administrador', 'admin'].includes(
  String(auth.user?.rol || '').trim().toLocaleLowerCase('es-PE'),
))
const isProfessor = computed(() => auth.isWebProfessor())
const canDeleteAttendance = computed(() => !isProfessor.value && canEditAttendance.value)
const attendanceStateOptions = [
  { value: 'presente', label: 'Presente' },
  { value: 'tardanza', label: 'Tardanza' },
  { value: 'falta', label: 'Ausente' },
  { value: 'justificado', label: 'Justificado' },
]

function toLocalDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function currentDateKey() {
  return toLocalDateKey(new Date())
}

function gradeNumber(value) {
  const text = String(value || '').toLocaleLowerCase('es-PE')
  const number = text.match(/\d+/)?.[0]
  if (number) return number
  const wordGrades = [
    ['primero', 'primer'], ['segundo', 'segun'], ['tercero', 'tercer'],
    ['cuarto'], ['quinto'],
  ]
  const matchIndex = wordGrades.findIndex((words) => words.some((word) => text.includes(word)))
  return matchIndex >= 0 ? String(matchIndex + 1) : ''
}

function sectionTabLabel(section) {
  const grade = gradeNumber(section.grado) || gradeNumber(section.nombre)
  const letter = String(section.seccion || section.nombre || '').match(/[A-E]\s*$/i)?.[0]?.trim()
  return grade && letter ? `${grade}${letter.toUpperCase()}` : String(section.nombre || '')
}

function gradeLabel(section) {
  const grade = Number(gradeNumber(section.grado) || gradeNumber(section.nombre))
  return ['','Primero','Segundo','Tercero','Cuarto','Quinto'][grade] || String(section.grado || 'Secciones')
}

const attendanceGradeGroups = computed(() => {
  const groups = new Map()
  attendanceSections.value
    .map((section) => ({ ...section, tabLabel: sectionTabLabel(section) }))
    .sort((left, right) => left.tabLabel.localeCompare(right.tabLabel, 'es-PE', { numeric: true }))
    .forEach((section) => {
      const grade = gradeLabel(section)
      if (!groups.has(grade)) groups.set(grade, [])
      groups.get(grade).push(section)
    })
  return [...groups.entries()].map(([grade, sections]) => ({ grade, sections }))
})

const attendanceDetailTabs = computed(() => [
  { id: 'statistics', label: 'Estadística', icon: 'monitoring' },
  ...attendanceGradeGroups.value.flatMap(({ sections }) =>
    sections.map((section) => ({ id: String(section.id), label: section.tabLabel, icon: 'groups' })),
  ),
])

function normalizeStatus(rawStatus) {
  const status = String(rawStatus || '').trim().toLocaleLowerCase('es-PE')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (status === 'presente') return 'Presente'
  if (status === 'tardanza' || status === 'tarde') return 'Tardanza'
  if (status === 'falta' || status === 'ausente') return 'Ausente'
  if (status === 'justificado') return 'Justificado'
  return status ? status.charAt(0).toLocaleUpperCase('es-PE') + status.slice(1) : '—'
}

function normalizeSalon(value) {
  return String(value || '').trim().toLocaleLowerCase('es-PE')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ')
}

function attendanceSectionKey(value) {
  const normalized = normalizeSalon(value)
  const grade = gradeNumber(normalized)
  const section = normalized.match(/\b([a-e])\b/i)?.[1]?.toUpperCase()
  return grade && section ? `${grade}${section}` : ''
}

function formatAttendanceTime(rawTime) {
  if (!rawTime) return '—'
  const value = String(rawTime).trim()
  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(a\.?\s*m\.?|p\.?\s*m\.?)?$/i)
  if (!match) return value
  let hour = Number(match[1])
  const minute = match[2]
  const suffix = match[3]?.toLocaleLowerCase('es-PE').replace(/\s+/g, '')
  let isAfternoon = suffix?.startsWith('p') || false
  if (!suffix && hour >= 12) isAfternoon = true
  if (suffix) {
    if (hour === 12) hour = 0
    if (isAfternoon) hour += 12
  }
  const displayHour = hour % 12 || 12
  return `${String(displayHour).padStart(2, '0')}:${minute} ${hour < 12 ? 'a. m.' : 'p. m.'}`
}

function attendanceMinuteOfDay(value) {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(a\.?\s*m\.?|p\.?\s*m\.?)?$/i)
  if (!match) return null
  let hour = Number(match[1])
  const minute = Number(match[2])
  const suffix = match[3]?.toLocaleLowerCase('es-PE').replace(/\s+/g, '')
  if (suffix) {
    const afternoon = suffix.startsWith('p')
    if (hour === 12) hour = 0
    if (afternoon) hour += 12
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return hour * 60 + minute
}

const attendanceChartGeometry = computed(() => {
  const rows = attendanceDetailRows.value
  const width = Math.max(320, attendanceChartSize.value.width)
  const height = 380
  const plot = { left: 16, right: width - 16, top: 22, bottom: 306 }
  const plotWidth = plot.right - plot.left
  const plotHeight = plot.bottom - plot.top
  const countsByMinute = new Map()
  rows.forEach((row) => {
    if (row.estado === 'Ausente' || row.estado === 'Justificado') return
    const minute = attendanceMinuteOfDay(row.horaRaw)
    if (minute === null || minute < 7 * 60 || minute > 16 * 60) return
    countsByMinute.set(minute, (countsByMinute.get(minute) || 0) + 1)
  })
  const points = Array.from({ length: 541 }, (_, index) => {
    const minuteOfDay = 7 * 60 + index
    const count = countsByMinute.get(minuteOfDay) || 0
    return {
      minuteOfDay,
      count,
      interval: formatAttendanceTime(`${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}:${String(minuteOfDay % 60).padStart(2, '0')}`),
      timeLabel: formatAttendanceTime(`${String(Math.floor(minuteOfDay / 60)).padStart(2, '0')}:${String(minuteOfDay % 60).padStart(2, '0')}`),
    }
  })
  const maxCount = Math.max(0, ...points.map(({ count }) => count))
  const scaleMax = Math.max(1, Math.ceil(maxCount * 1.18))
  points.forEach((point) => {
    point.x = plot.left + ((point.minuteOfDay - 7 * 60) / (9 * 60)) * plotWidth
    point.y = plot.bottom - point.count / scaleMax * plotHeight
  })
  const linePath = points.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
  const areaPath = `${linePath} L ${points.at(-1).x} ${plot.bottom} L ${points[0].x} ${plot.bottom} Z`
  const hourTicks = Array.from({ length: 10 }, (_, index) => {
    const hour = index + 7
    return {
      label: `${hour > 12 ? hour - 12 : hour}${hour < 12 ? 'am' : 'pm'}`,
      x: plot.left + index * plotWidth / 9,
    }
  })
  const peak = points.reduce((best, point) => point.count > best.count ? point : best, points[0])

  return { width, height, plot, points, hourTicks, linePath, areaPath, peak: peak.count ? peak : null }
})

const selectedAttendancePoint = computed(() => {
  if (selectedAttendancePointIndex.value === null) return null
  const point = attendanceChartGeometry.value.points[selectedAttendancePointIndex.value]
  if (!point || !selectedAttendanceTooltipPosition.value) return null
  return { ...point, ...selectedAttendanceTooltipPosition.value }
})

function getSectionAttendanceRows(sectionId) {
  const section = attendanceSections.value.find((item) => String(item.id) === String(sectionId))
  if (!section) return []
  const expectedKey = sectionTabLabel(section)
  return attendanceDetailRows.value
    .filter((row) => row.sectionKey === expectedKey)
    .map((row) => ({
      id: row.id,
      nombre: row.nombre,
      apellido: row.apellido,
      estado: row.estado,
      horaIngreso: row.horaIngreso,
    }))
}

const sectionAttendanceRows = computed(() => (
  activeDetailSection.value === 'statistics' ? [] : getSectionAttendanceRows(activeDetailSection.value)
))
const sectionAttendanceSummary = computed(() => sectionAttendanceRows.value.reduce((counts, student) => {
  if (student.estado === 'Presente') counts.present += 1
  else if (student.estado === 'Tardanza') counts.late += 1
  else if (student.estado === 'Ausente' || student.estado === 'Justificado') counts.absent += 1
  return counts
}, { present: 0, late: 0, absent: 0 }))
const ATTENDANCE_SECTION_PAGE_SIZE = 10
const {
  currentPage: attendanceSectionPage,
  paginatedItems: paginatedSectionAttendanceRows,
  setPage: setAttendanceSectionPage,
} = usePagination(sectionAttendanceRows, ATTENDANCE_SECTION_PAGE_SIZE)
watch(
  [activeDetailSection, () => details.payload.value?.date],
  () => { attendanceSectionPage.value = 1 },
)
const activeDetailTabOffset = computed(() => {
  if (activeDetailSection.value === 'statistics') return 0
  const tab = attendanceDetailTabs.value.find((item) => item.id === activeDetailSection.value)
  const grade = Number(tab?.label.match(/^\d/)?.[0] || 1)
  const sectionOffset = Math.max(0, (tab?.label.charCodeAt(1) || 65) - 65) * 40
  return 72 + (grade - 1) * 232 + sectionOffset
})

function syncAttendanceDetailViewport(event) {
  isMobileDetailNav.value = event.matches
}

function setAttendanceChartSize(element) {
  attendanceChartObserver?.disconnect()
  attendanceChartObserver = null
  if (!element || typeof ResizeObserver === 'undefined') return
  attendanceChartObserver = new ResizeObserver(([entry]) => {
    attendanceChartSize.value = {
      width: Math.max(320, entry.contentRect.width),
      height: Math.max(320, entry.contentRect.height),
    }
  })
  attendanceChartObserver.observe(element)
}

watch(attendanceHourlyChartElement, setAttendanceChartSize, { flush: 'post' })
watch(() => details.open.value, (isOpen) => {
  if (!isOpen) attendanceDetailController?.abort()
})

const today = new Date()
attendanceMonth.value = String(today.getMonth() + 1)
attendanceYear.value = String(today.getFullYear())

function attendanceRange() {
  const now = new Date()
  if (attendancePeriod.value === 'week') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const daysSinceMonday = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - daysSinceMonday - attendanceWeekOffset.value * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 4)
    if (attendanceWeekOffset.value === 0 && end > now) {
      end.setTime(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime())
    }
    return { start, end }
  }

  const year = Number(attendanceYear.value || now.getFullYear())
  const month = Number(attendanceMonth.value)
  const start = month
    ? new Date(year, month - 1, 1)
    : new Date(year, 0, 1)
  const selectedEnd = month
    ? new Date(year, month, 0)
    : new Date(year, 11, 31)
  const end = selectedEnd > now ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : selectedEnd
  return { start, end }
}

function createWeekdayRecords(start, end, summaryRows) {
  if (start > end || !Array.isArray(summaryRows) || summaryRows.length === 0) return []
  return summaryRows.map((row) => {
    const dateKey = String(row.fecha || '').slice(0, 10)
    const [year, month, day] = dateKey.split('-').map(Number)
    const dateValue = new Date(year, month - 1, day)
    if (!year || !month || !day || Number.isNaN(dateValue.getTime())) return null
    if (dateValue < start || dateValue > end || dateValue.getDay() === 0 || dateValue.getDay() === 6) return null
    const present = Number(row.presentes) || 0
    const late = Number(row.tardanzas) || 0
    const absent = Number(row.ausentes) || 0
    const registeredTotal = present + late + absent
    if (!registeredTotal) return null
    return {
      id: dateKey,
      date: dateKey,
      present,
      late,
      absent,
      total: present + late,
      registeredTotal,
    }
  }).filter(Boolean).sort((left, right) => right.date.localeCompare(left.date))
}

const attendanceWeekLabel = computed(() => {
  const { start, end } = attendanceRange()
  const formatter = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long' })
  return `${formatter.format(start)} – ${formatter.format(end)}`
})

function changeAttendanceWeek(direction) {
  attendanceWeekOffset.value = Math.max(0, attendanceWeekOffset.value + direction)
}

function setAttendancePeriod(period) {
  attendancePeriod.value = period
  if (period === 'week') attendanceWeekOffset.value = 0
}

async function loadAttendanceRecords() {
  attendanceHistoryController?.abort()
  const controller = new AbortController()
  attendanceHistoryController = controller
  attendanceLoading.value = true
  attendanceLoadError.value = ''
  const { start, end } = attendanceRange()
  try {
    if (start > end) {
      attendanceRecords.value = []
      return
    }
    const from = toLocalDateKey(start)
    const to = toLocalDateKey(end)
    const historyPath = isProfessor.value ? '/api/asistencia/web/historial' : '/api/admin/asistencia/historial'
    const rows = await apiGetCached(
      `${historyPath}?desde=${from}&hasta=${to}`,
      { signal: controller.signal, ttlMs: 30_000 },
    )
    if (controller.signal.aborted) return
    attendanceRecords.value = createWeekdayRecords(start, end, rows)
  } catch (error) {
    if (error.name === 'AbortError') return
    attendanceRecords.value = []
    attendanceLoadError.value = error.message || 'No se pudo cargar el historial de asistencias.'
  } finally {
    if (!controller.signal.aborted) attendanceLoading.value = false
  }
}

async function loadAttendanceSections() {
  try {
    const sections = await apiGetCached('/api/secciones')
    attendanceSections.value = Array.isArray(sections) ? sections : []
  } catch (error) {
    attendanceSectionsError.value = error.message || 'No se pudieron cargar las secciones.'
  }
}

watch([attendancePeriod, attendanceWeekOffset], () => {
  attendanceCurrentPage.value = 1
  loadAttendanceRecords()
})

watch([attendanceMonth, attendanceYear], () => {
  if (attendancePeriod.value !== 'month') return
  attendanceCurrentPage.value = 1
  loadAttendanceRecords()
})

onMounted(() => {
  attendanceDetailMediaQuery = window.matchMedia('(max-width: 680px)')
  syncAttendanceDetailViewport(attendanceDetailMediaQuery)
  attendanceDetailMediaQuery.addEventListener('change', syncAttendanceDetailViewport)
  loadAttendanceRecords()
  loadAttendanceSections()
})

onBeforeUnmount(() => {
  attendanceDetailMediaQuery?.removeEventListener('change', syncAttendanceDetailViewport)
  attendanceDetailController?.abort()
  attendanceHistoryController?.abort()
  attendanceChartObserver?.disconnect()
})

function attendanceDateLabel(record) {
  if (record.date === currentDateKey()) return 'Hoy'
  const date = new Date(`${record.date}T00:00:00`)
  const parts = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).formatToParts(date)
  const part = (type) => parts.find((item) => item.type === type)?.value ?? ''
  const capitalize = (value) => value.charAt(0).toLocaleUpperCase('es-PE') + value.slice(1)
  return `${capitalize(part('weekday'))} ${part('day')} de ${capitalize(part('month'))}`
}

function attendanceTitle(record) {
  const dateLabel = attendanceDateLabel(record)
  return dateLabel === 'Hoy' ? 'Asistencia de Hoy' : `Asistencia del ${dateLabel}`
}

function getAttendanceCounts(record) {
  return { present: record?.present || 0, late: record?.late || 0, absent: record?.absent || 0 }
}

async function loadAttendanceDetail(record) {
  attendanceDetailController?.abort()
  const controller = new AbortController()
  attendanceDetailController = controller
  attendanceDetailLoading.value = true
  attendanceDetailError.value = ''
  attendanceDetailRows.value = []
  try {
    const detailPath = isProfessor.value ? '/api/asistencia/web/fecha' : '/api/admin/asistencia/fecha'
    const rows = await apiGet(`${detailPath}?fecha=${encodeURIComponent(record.date)}`, {
      signal: controller.signal,
    })
    if (controller.signal.aborted) return
    attendanceDetailRows.value = (Array.isArray(rows) ? rows : []).map((row) => {
      const name = String(row.nombre_completo || '').trim().split(/\s+/)
      const salon = String(row.salon || '')
      return {
        id: row.id,
        personaId: row.persona_id,
        nombre: name.shift() || '—',
        apellido: name.join(' ') || '—',
        salon,
        sectionKey: attendanceSectionKey(salon),
        estado: normalizeStatus(row.estado_entrada),
        horaRaw: row.hora_registro || '',
        horaIngreso: formatAttendanceTime(row.hora_registro),
      }
    })
  } catch (error) {
    if (error.name === 'AbortError') return
    attendanceDetailError.value = error.message || 'No se pudo cargar el detalle de esta jornada.'
  } finally {
    if (!controller.signal.aborted) attendanceDetailLoading.value = false
  }
}

function openAttendanceEdit(event, student) {
  if (!canEditAttendance.value || !student?.id) return
  attendanceEditError.value = ''
  attendanceEditState.value = attendanceStateOptions.find((option) => option.label === student.estado)?.value || 'presente'
  editAttendance.show(event, student)
}

async function saveAttendanceEdit(close) {
  const student = editAttendance.payload.value
  if (!student?.id || !canEditAttendance.value || attendanceEditLoading.value) return
  attendanceEditLoading.value = true
  attendanceEditError.value = ''
  try {
    await apiPut(`/api/asistencia/${encodeURIComponent(student.id)}`, { estado: attendanceEditState.value })
    const record = details.payload.value
    close()
    toast.success('Asistencia actualizada', { icon: null })
    if (record) await Promise.all([loadAttendanceDetail(record), loadAttendanceRecords()])
  } catch (error) {
    attendanceEditError.value = error.message || 'No se pudo actualizar la asistencia.'
  } finally {
    attendanceEditLoading.value = false
  }
}

function downloadAttendanceRecord(record) {
  const columns = ['Fecha', 'Total de asistencias', 'Salón y sección', 'Nombre', 'Apellido', 'Estado', 'Hora de ingreso']
  const rows = attendanceDetailRows.value.map((student) => [
    record.date,
    record.total,
    student.salon,
    student.nombre,
    student.apellido,
    student.estado,
    student.horaIngreso,
  ])
  const csvRows = [columns, ...(rows.length ? rows : [[record.date, record.total, '', '', '', '', '']])]
  const csv = serializeCsvRows(csvRows)
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `asistencias-${record.date}.csv`
  link.click()
  URL.revokeObjectURL(url)
  toast.success('Registro descargado', { icon: null })
}

function openAttendanceDetails(event, record) {
  activeDetailSection.value = 'statistics'
  selectedAttendancePointIndex.value = null
  selectedAttendanceTooltipPosition.value = null
  details.show(event, record)
  loadAttendanceDetail(record)
}

async function confirmDeleteAttendance(close) {
  const record = removeAttendance.payload.value
  if (!record || attendanceDeleteLoading.value) return
  attendanceDeleteLoading.value = true
  try {
    const rows = await apiGet(`/api/admin/asistencia/fecha?fecha=${encodeURIComponent(record.date)}`)
    const ids = (Array.isArray(rows) ? rows : []).map((row) => row.id).filter(Boolean)
    if (ids.length) {
      await apiPost('/api/asistencia/eliminar-batch', { ids })
      toast.success('Asistencia eliminada', { icon: null })
    } else {
      toast.success('La jornada no tiene registros que eliminar', { icon: null })
    }
    await loadAttendanceRecords()
    close()
  } catch (error) {
    toast.error(error.message || 'No se pudo eliminar la asistencia', { icon: null })
  } finally {
    attendanceDeleteLoading.value = false
  }
}

function selectAttendanceDetailTab(tabId) {
  activeDetailSection.value = tabId
  selectedAttendancePointIndex.value = null
  selectedAttendanceTooltipPosition.value = null
}

function selectAttendanceChartPoint(index, event) {
  selectedAttendancePointIndex.value = index
  const chart = attendanceHourlyChartElement.value
  const svg = event.currentTarget?.ownerSVGElement ?? attendanceHourlySvgElement.value
  const point = attendanceChartGeometry.value.points[index]
  if (!chart || !svg || !point) return
  const svgPoint = svg.createSVGPoint()
  svgPoint.x = point.x
  svgPoint.y = point.y
  const screenPoint = svgPoint.matrixTransform(svg.getScreenCTM())
  const chartBounds = chart.getBoundingClientRect()
  selectedAttendanceTooltipPosition.value = {
    tooltipX: Math.max(9, Math.min(91, (screenPoint.x - chartBounds.left) / chartBounds.width * 100)),
    tooltipY: (screenPoint.y - chartBounds.top) / chartBounds.height * 100,
  }
}

function selectAttendanceChartAtPointer(event) {
  const svg = attendanceHourlySvgElement.value
  const points = attendanceChartGeometry.value.points
  if (!svg || !points.length) return
  const bounds = svg.getBoundingClientRect()
  const x = Math.max(0, Math.min(attendanceChartGeometry.value.width,
    (event.clientX - bounds.left) / bounds.width * attendanceChartGeometry.value.width))
  let nearestIndex = 0
  let nearestDistance = Infinity
  points.forEach((point, index) => {
    const distance = Math.abs(point.x - x)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestIndex = index
    }
  })
  selectAttendanceChartPoint(nearestIndex, { currentTarget: { ownerSVGElement: svg } })
}

function moveAttendanceChartPoint(event, direction) {
  const points = attendanceChartGeometry.value.points
  if (!points.length) return
  const currentIndex = selectedAttendancePointIndex.value ?? 0
  const nextIndex = Math.max(0, Math.min(points.length - 1, currentIndex + direction))
  selectAttendanceChartPoint(nextIndex, { currentTarget: { ownerSVGElement: attendanceHourlySvgElement.value } })
}

function focusAttendanceChart() {
  selectAttendanceChartPoint(0, { currentTarget: { ownerSVGElement: attendanceHourlySvgElement.value } })
}

function clearAttendanceChartPoint() {
  selectedAttendancePointIndex.value = null
  selectedAttendanceTooltipPosition.value = null
}

function moveAttendanceDetailTab(event, direction) {
  const currentIndex = attendanceDetailTabs.value.findIndex((tab) => tab.id === activeDetailSection.value)
  const nextIndex = (currentIndex + direction + attendanceDetailTabs.value.length) % attendanceDetailTabs.value.length
  const nextTab = attendanceDetailTabs.value[nextIndex]
  activeDetailSection.value = nextTab.id
  event.currentTarget.parentElement
    ?.querySelector(`[data-attendance-tab="${nextTab.id}"]`)
    ?.focus()
}

const filteredAttendanceRecords = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('es-PE')
  const records = attendanceRecords.value.filter((record) => {
    const date = new Date(`${record.date}T00:00:00`)
    const matchesSearch = attendanceTitle(record).toLocaleLowerCase('es-PE').includes(query)
    const matchesMonth = attendancePeriod.value === 'week'
      || attendanceMonth.value === '' || date.getMonth() + 1 === Number(attendanceMonth.value)
    const matchesYear = attendancePeriod.value === 'week'
      || attendanceYear.value === '' || date.getFullYear() === Number(attendanceYear.value)
    return matchesSearch && matchesMonth && matchesYear
  })
  if (attendanceSort.value === 'date-asc') return records.sort((left, right) => left.date.localeCompare(right.date))
  if (attendanceSort.value === 'date-desc') return records.sort((left, right) => right.date.localeCompare(left.date))
  const countKey = {
    'absent-desc': 'absent',
    'late-desc': 'late',
    'present-desc': 'present',
    'total-desc': 'total',
  }[attendanceSort.value]
  return records.sort((left, right) => right[countKey] - left[countKey] || right.date.localeCompare(left.date))
})

const ATTENDANCE_PAGE_SIZE = 6
const {
  currentPage: attendanceCurrentPage,
  paginatedItems: paginatedAttendanceRecords,
  setPage,
} = usePagination(filteredAttendanceRecords, ATTENDANCE_PAGE_SIZE)
watch([searchQuery, attendanceSort], () => { attendanceCurrentPage.value = 1 })

const mobileActions = [
  { id: 'search', label: 'Buscar', icon: 'search' },
  { id: 'filters', label: 'Filtros', icon: 'page_info' },
]

function handleMobileAction(action, event) {
  if (action === 'search') search.show(event)
  if (action === 'filters') filters.show(event)
}
</script>

<template>
  <main class="app-view attendance-view" :class="{ 'align-center': viewMode === 'grid' }">
    <div
      class="simple-container direction-column gap-24"
      :class="viewMode === 'grid' ? 'width-100 max-width-1000 grow-1' : 'grow-1'"
    >
      <header class="app-header">
        <h1 class="display-medium weight-500 text-gradient">Asistencias</h1>
        <MobileActionMenu
          class="attendance-mobile-menu"
          :actions="mobileActions"
          @select="handleMobileAction"
        />

        <div class="attendance-toolbar">
          <div class="simple-container gap-8 hide-on-mobile">
            <button
              class="style-7 for-icon bigger hover-border-radius-round background outline-light-1 outline-text attendance-search-btn"
              @click="search.show"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon data-shared-item="icon" aria-hidden="true">search</md-icon>
            </button>
            <button
              class="style-7 for-icon bigger hover-border-radius-round background outline-light-1 outline-text attendance-filters-btn"
              @click="filters.show"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon data-shared-item="icon" aria-hidden="true">filter_list</md-icon>
            </button>
          </div>

        </div>
      </header>

      <div v-if="attendancePeriod === 'week'" class="attendance-week-navigation">
        <button
          type="button"
          class="style-7 for-icon small rounded background outline-text"
          aria-label="Ver semana anterior"
          title="Ver semana anterior"
          @click="changeAttendanceWeek(1)"
        >
          <md-ripple aria-hidden="true"></md-ripple>
          <md-icon aria-hidden="true">chevron_left</md-icon>
        </button>
        <span class="body-medium outline-text" aria-live="polite">{{ attendanceWeekLabel }}</span>
        <button
          type="button"
          class="style-7 for-icon small rounded background outline-text"
          aria-label="Ver semana siguiente"
          title="Ver semana siguiente"
          :disabled="attendanceWeekOffset === 0"
          @click="changeAttendanceWeek(-1)"
        >
          <md-ripple aria-hidden="true"></md-ripple>
          <md-icon aria-hidden="true">chevron_right</md-icon>
        </button>
      </div>

      <section
        v-if="attendanceLoading"
        class="attendance-records attendance-grid attendance-grid-loading"
        role="status"
        aria-label="Cargando jornadas de asistencia"
      >
        <article v-for="skeleton in (attendancePeriod === 'week' ? 5 : 6)" :key="skeleton" class="attendance-card-section" aria-hidden="true">
          <div class="simple-container align-center attendance-date-heading">
            <span class="attendance-skeleton-block animation-loading-1" style="width: 132px; height: 16px; border-radius: 8px"></span>
          </div>
          <div class="content-box light-color aspect-ratio-1-1 justify-between border-radius-40 padding-24 direction-column gap-16 overflow-hidden">
            <div class="simple-container justify-between width-100">
              <div class="simple-container direction-column gap-8">
                <span class="attendance-skeleton-block animation-loading-1" style="width: 112px; height: 16px; border-radius: 8px"></span>
                <span class="attendance-skeleton-block animation-loading-1" style="width: 148px; height: 16px; border-radius: 8px"></span>
              </div>
              <span class="attendance-skeleton-block animation-loading-1" style="width: 24px; height: 24px; border-radius: 50%"></span>
            </div>
            <div class="simple-container justify-right gap-8 attendance-grid-actions">
              <span class="attendance-skeleton-block animation-loading-1" style="width: 82px; height: 40px; border-radius: 24px"></span>
              <span class="attendance-skeleton-block animation-loading-1" style="width: 40px; height: 40px; border-radius: 50%"></span>
            </div>
          </div>
        </article>
      </section>
      <div v-else-if="attendanceLoadError" class="content-box light-color border-radius-32 attendance-list-empty" role="alert">
        <div class="simple-container direction-column align-center gap-8 attendance-detail-message">
          <md-icon class="pretty-minimal outline-text" aria-hidden="true">cloud_off</md-icon>
          <span class="title-medium weight-500">No se pudo cargar el historial</span>
          <span class="body-medium outline-text">{{ attendanceLoadError }}</span>
          <button type="button" class="style-7 rounded background on-background-text" @click="loadAttendanceRecords">
            <md-ripple aria-hidden="true"></md-ripple>
            Reintentar
          </button>
        </div>
      </div>

      <section
        v-else-if="filteredAttendanceRecords.length > 0"
        class="attendance-records"
        :class="viewMode === 'grid' ? 'attendance-grid' : 'attendance-list'"
        :aria-label="viewMode === 'grid' ? 'Asistencias en cuadrícula' : 'Asistencias en lista'"
      >
        <article
          v-for="record in paginatedAttendanceRecords"
          :key="record.id"
          class="attendance-card-section"
        >
          <div
            v-if="viewMode === 'grid'"
            class="simple-container align-center attendance-date-heading"
          >
            <span class="headline-small outline-text">{{ attendanceDateLabel(record) }}</span>
          </div>

          <div
            class="content-box"
            :class="viewMode === 'grid'
              ? 'light-color aspect-ratio-1-1 justify-between border-radius-40 padding-24 direction-column gap-16 cursor-pointer overflow-hidden item-card attendance-grid-card'
              : 'background outline-light-1 attendance-record attendance-list-row'"
          >
            <template v-if="viewMode === 'grid'">
              <button
                type="button"
                class="attendance-card-open"
                :aria-label="`Ver ${attendanceTitle(record).toLocaleLowerCase('es-PE')}`"
                :title="`Ver ${attendanceTitle(record).toLocaleLowerCase('es-PE')}`"
                @click="openAttendanceDetails($event, record)"
              ></button>
              <div class="simple-container justify-between attendance-card-heading">
                <div class="simple-container direction-column gap-0">
                  <span class="body-large width-fit-content" data-shared-item="name" data-shared-split="words">
                    Asistencia
                  </span>
                  <span class="body-large width-fit-content weight-500 primary-text" data-shared-item="amount">
                    {{ record.total }} asistencias
                  </span>
                </div>
                <div class="simple-container align-center gap-4">
                  <md-icon class="outline-text" aria-hidden="true">arrow_outward</md-icon>
                </div>
              </div>
              <div class="simple-container justify-right gap-8 attendance-grid-actions">
                <button
                  type="button"
                  class="style-7 rounded background on-background-text with-icon-left attendance-grid-view-button"
                  :aria-label="`Ver ${attendanceTitle(record).toLocaleLowerCase('es-PE')}`"
                  :title="`Ver ${attendanceTitle(record).toLocaleLowerCase('es-PE')}`"
                  @click.stop="openAttendanceDetails($event, record)"
                >
                  <md-ripple aria-hidden="true"></md-ripple>
                  <md-icon class="dynamic" aria-hidden="true">visibility</md-icon>
                  <span>Ver</span>
                </button>
                <button
                  v-if="canDeleteAttendance"
                  type="button"
                  class="style-7 for-icon small hover-error-container background outline-text"
                  :aria-label="`Eliminar ${attendanceTitle(record).toLocaleLowerCase('es-PE')}`"
                  :title="record.registeredTotal
                    ? `Eliminar ${attendanceTitle(record).toLocaleLowerCase('es-PE')}`
                    : 'No hay registros para eliminar'"
                  :disabled="record.registeredTotal === 0"
                  @click.stop="removeAttendance.show($event, record)"
                >
                  <md-ripple aria-hidden="true"></md-ripple>
                  <md-icon aria-hidden="true">delete</md-icon>
                </button>
              </div>
              <md-ripple aria-hidden="true"></md-ripple>
            </template>

            <template v-else>
              <h2 class="title-medium weight-500">{{ attendanceTitle(record) }}</h2>

              <div class="attendance-list-actions">
                <span class="body-large weight-500 attendance-list-total">
                  {{ record.total }}
                  <span class="body-medium outline-text">asistencias</span>
                </span>
                <button
                  type="button"
                  class="style-7 for-icon small hover-primary-container background outline-text"
                  :aria-label="`Ver ${attendanceTitle(record).toLocaleLowerCase('es-PE')}`"
                  :title="`Ver ${attendanceTitle(record).toLocaleLowerCase('es-PE')}`"
                  @click="openAttendanceDetails($event, record)"
                >
                  <md-ripple aria-hidden="true"></md-ripple>
                  <md-icon aria-hidden="true">arrow_outward</md-icon>
                </button>

                <button
                  v-if="canDeleteAttendance"
                  type="button"
                  class="style-7 for-icon small hover-error-container background outline-text"
                  :aria-label="`Eliminar ${attendanceTitle(record).toLocaleLowerCase('es-PE')}`"
                  :title="record.registeredTotal
                    ? `Eliminar ${attendanceTitle(record).toLocaleLowerCase('es-PE')}`
                    : 'No hay registros para eliminar'"
                  :disabled="record.registeredTotal === 0"
                  @click="removeAttendance.show($event, record)"
                >
                  <md-ripple aria-hidden="true"></md-ripple>
                  <md-icon aria-hidden="true">delete</md-icon>
                </button>
              </div>
            </template>
          </div>
        </article>

      </section>

      <div v-else class="simple-container direction-column grow-1">
        <div class="simple-container grow-1">
          <div class="content-box light-color grow-1 align-center justify-center padding-24 attendance-empty-placeholder">
            <md-icon class="pretty-minimal outline-text" aria-hidden="true">
              nest_clock_farsight_analog
            </md-icon>
            <span class="headline-small weight-500 outline-text">No se encontraron Asistencias</span>
          </div>
        </div>
      </div>

      <PaginationControls
        v-if="!attendanceLoading && !attendanceLoadError && filteredAttendanceRecords.length > 0"
        :class="{ 'attendance-list-pagination': viewMode === 'list' }"
        :page="attendanceCurrentPage"
        :page-size="ATTENDANCE_PAGE_SIZE"
        :total="filteredAttendanceRecords.length"
        @update:page="setPage"
      />
    </div>
  </main>

  <FlipModal
    v-if="details.open.value"
    :origin="details.origin.value"
    placement="center"
    close-strategy="container-only"
    window-class="increased padding-8 border-radius-40 outline-light-1 attendance-detail-window"
    content-class="attendance-detail-layout"
    @close="details.hide"
  >
    <template #default="{ close }">
      <aside class="attendance-detail-sidebar" aria-label="Secciones de asistencia">
        <div
          class="pretty-tabs size-md variant-plain orientation-vertical attendance-detail-tabs"
          role="tablist"
          aria-label="Estadística y secciones"
          :aria-orientation="isMobileDetailNav ? 'horizontal' : 'vertical'"
          data-no-drag
          :style="{ '--attendance-detail-tab-offset': `${activeDetailTabOffset}px` }"
        >
          <span class="attendance-detail-tab-indicator" aria-hidden="true"></span>
          <button
            v-for="tab in attendanceDetailTabs.slice(0, 1)"
            :key="tab.id"
            :id="`attendance-tab-${tab.id}`"
            :data-attendance-tab="tab.id"
            type="button"
            role="tab"
            class="attendance-detail-tab"
            :class="{ active: activeDetailSection === tab.id }"
            :aria-selected="activeDetailSection === tab.id"
            :aria-controls="`attendance-detail-panel-${tab.id}`"
            :tabindex="activeDetailSection === tab.id ? 0 : -1"
            @click="selectAttendanceDetailTab(tab.id)"
            @keydown.left.prevent="moveAttendanceDetailTab($event, -1)"
            @keydown.right.prevent="moveAttendanceDetailTab($event, 1)"
            @keydown.up.prevent="moveAttendanceDetailTab($event, -1)"
            @keydown.down.prevent="moveAttendanceDetailTab($event, 1)"
            @keydown.home.prevent="selectAttendanceDetailTab(attendanceDetailTabs[0].id)"
            @keydown.end.prevent="selectAttendanceDetailTab(attendanceDetailTabs[attendanceDetailTabs.length - 1].id)"
          >
            <md-icon aria-hidden="true">{{ tab.icon }}</md-icon>
            <span>{{ tab.label }}</span>
          </button>
          <template v-for="group in attendanceGradeGroups" :key="group.grade">
            <span class="attendance-detail-grade-label" aria-hidden="true">{{ group.grade }}</span>
            <button
              v-for="section in group.sections"
              :key="section.id"
              :id="`attendance-tab-${section.id}`"
              :data-attendance-tab="section.id"
              type="button"
              role="tab"
              class="attendance-detail-tab attendance-detail-section-tab"
              :class="{ active: activeDetailSection === String(section.id) }"
              :aria-selected="activeDetailSection === String(section.id)"
              :aria-controls="`attendance-detail-panel-${section.id}`"
              :tabindex="activeDetailSection === String(section.id) ? 0 : -1"
              @click="selectAttendanceDetailTab(String(section.id))"
              @keydown.left.prevent="moveAttendanceDetailTab($event, -1)"
              @keydown.right.prevent="moveAttendanceDetailTab($event, 1)"
              @keydown.up.prevent="moveAttendanceDetailTab($event, -1)"
              @keydown.down.prevent="moveAttendanceDetailTab($event, 1)"
              @keydown.home.prevent="selectAttendanceDetailTab(attendanceDetailTabs[0].id)"
              @keydown.end.prevent="selectAttendanceDetailTab(attendanceDetailTabs[attendanceDetailTabs.length - 1].id)"
            >
              <md-icon aria-hidden="true">groups</md-icon>
              <span>{{ section.tabLabel }}</span>
            </button>
          </template>
        </div>
      </aside>

      <section class="attendance-detail-content simple-container direction-column gap-8 grow-1">
        <header class="attendance-detail-header">
          <div class="simple-container align-center justify-between width-100">
            <div class="simple-container direction-column gap-4">
              <span class="headline-small weight-600">{{ attendanceTitle(details.payload.value) }}</span>
            </div>
            <div class="simple-container align-center gap-8">
              <button
                type="button"
                class="style-7 for-icon small rounded surface-container-low outline-text"
                aria-label="Descargar registro de asistencia"
                title="Descargar registro del día"
                :disabled="attendanceDetailLoading || Boolean(attendanceDetailError)"
                @click="downloadAttendanceRecord(details.payload.value)"
              >
                <md-ripple aria-hidden="true"></md-ripple>
                <md-icon aria-hidden="true">download</md-icon>
              </button>
              <button
                type="button"
                class="style-7 for-icon small rounded surface-container-low outline-text"
                aria-label="Cerrar detalle de asistencia"
                @click="close()"
              >
                <md-ripple aria-hidden="true"></md-ripple>
                <md-icon aria-hidden="true">close</md-icon>
              </button>
            </div>
          </div>
        </header>

        <section
          v-if="activeDetailSection === 'statistics'"
          id="attendance-detail-panel-statistics"
          class="content-box light-color border-radius-32 attendance-detail-body attendance-statistics-body"
          role="tabpanel"
          aria-labelledby="attendance-tab-statistics"
          aria-live="polite"
        >
          <div v-if="attendanceDetailLoading" class="attendance-detail-chart-skeleton" role="status" aria-label="Cargando gráfico de asistencias">
            <header class="attendance-hourly-header" aria-hidden="true">
              <div class="simple-container direction-column gap-8">
                <span class="attendance-skeleton-block animation-loading-1" style="width: 170px; height: 18px; border-radius: 9px"></span>
                <span class="attendance-skeleton-block animation-loading-1" style="width: 228px; max-width: 65vw; height: 13px; border-radius: 7px"></span>
              </div>
              <span class="attendance-skeleton-block animation-loading-1" style="width: 68px; height: 13px; border-radius: 7px"></span>
            </header>
            <div class="attendance-hourly-chart attendance-hourly-chart-loading" aria-hidden="true">
              <span
                v-for="(barHeight, index) in attendanceChartLoadingBars"
                :key="index"
                class="attendance-chart-loading-bar animation-loading-1"
                :style="{ height: `${barHeight}%` }"
              ></span>
            </div>
          </div>
          <div v-else-if="attendanceDetailError" class="simple-container align-center justify-center grow-1" role="alert">
            <span class="body-medium outline-text">{{ attendanceDetailError }}</span>
          </div>
          <template v-else-if="details.payload.value.total > 0 && attendanceChartGeometry.peak">
            <header class="attendance-hourly-header">
              <div class="simple-container direction-column gap-4">
                <span class="title-medium weight-500">Asistencias del Dia</span>
                <span class="body-medium outline-text">
                  {{ attendanceChartGeometry.peak.count }} asistencias en el intervalo {{ attendanceChartGeometry.peak.interval }}
                </span>
              </div>
              <span class="body-small outline-text attendance-hourly-total">
                {{ details.payload.value.total }} en total
              </span>
            </header>

            <div ref="attendanceHourlyChartElement" class="attendance-hourly-chart" @pointerleave="clearAttendanceChartPoint">
              <svg
                ref="attendanceHourlySvgElement"
                class="attendance-hourly-svg"
                :viewBox="`0 0 ${attendanceChartGeometry.width} ${attendanceChartGeometry.height}`"
                preserveAspectRatio="xMidYMax meet"
                role="group"
                aria-label="Gráfico de asistencias por minuto, desde las 7 de la mañana hasta las 4 de la tarde"
              >
                <defs>
                  <linearGradient id="attendance-hourly-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="var(--md-sys-color-primary-container)" stop-opacity="0.72" />
                    <stop offset="100%" stop-color="var(--md-sys-color-primary-container)" stop-opacity="0.04" />
                  </linearGradient>
                </defs>
                <path class="attendance-hourly-area" :d="attendanceChartGeometry.areaPath" />
                <path class="attendance-hourly-line" :d="attendanceChartGeometry.linePath" />
                <circle
                  v-if="selectedAttendancePoint"
                  class="attendance-hourly-point active"
                  :cx="selectedAttendancePoint.x"
                  :cy="selectedAttendancePoint.y"
                  r="5"
                />
                <text
                  v-for="tick in attendanceChartGeometry.hourTicks"
                  :key="tick.label"
                  class="attendance-hourly-time"
                  :x="tick.x"
                  y="352"
                  text-anchor="middle"
                >
                  {{ tick.label }}
                </text>
                <rect
                  class="attendance-hourly-interaction"
                  :x="attendanceChartGeometry.plot.left"
                  :y="attendanceChartGeometry.plot.top"
                  :width="attendanceChartGeometry.plot.right - attendanceChartGeometry.plot.left"
                  :height="attendanceChartGeometry.plot.bottom - attendanceChartGeometry.plot.top"
                  role="slider"
                  tabindex="0"
                  aria-label="Explorar las asistencias por minuto, de 7 a. m. a 4 p. m."
                  aria-valuemin="0"
                  :aria-valuemax="attendanceChartGeometry.points.length - 1"
                  :aria-valuenow="selectedAttendancePointIndex ?? 0"
                  :aria-valuetext="selectedAttendancePoint ? `${selectedAttendancePoint.timeLabel}, ${selectedAttendancePoint.count} asistencias` : 'Explora las asistencias por minuto'"
                  @pointermove="selectAttendanceChartAtPointer"
                  @pointerdown="selectAttendanceChartAtPointer"
                  @focus="focusAttendanceChart"
                  @keydown.left.prevent="moveAttendanceChartPoint($event, -1)"
                  @keydown.right.prevent="moveAttendanceChartPoint($event, 1)"
                />
              </svg>
              <div
                v-if="selectedAttendancePoint"
                class="attendance-hourly-tooltip"
                :style="{
                  left: `${selectedAttendancePoint.tooltipX}%`,
                  top: `${selectedAttendancePoint.tooltipY}%`,
                }"
                aria-hidden="true"
              >
                <span class="body-small">{{ selectedAttendancePoint.timeLabel }}</span>
                <span class="body-medium weight-500">{{ selectedAttendancePoint.count }} asistencias en este minuto</span>
              </div>
            </div>
          </template>
          <div v-else class="simple-container direction-column align-center gap-8 attendance-detail-message attendance-statistics-empty">
            <md-icon class="pretty-minimal outline-text" aria-hidden="true">groups</md-icon>
            <span class="title-medium weight-500">
              {{ details.payload.value.registeredTotal ? 'No hay horarios de ingreso' : 'No hay asistencias registradas' }}
            </span>
            <span class="body-medium outline-text">
              {{ details.payload.value.registeredTotal
                ? 'No encontramos horas de ingreso para esta fecha.'
                : 'Cuando se registren asistencias para esta fecha, aparecerá aquí el resumen por hora.' }}
            </span>
          </div>
        </section>
        <section
          v-else
          :id="`attendance-detail-panel-${activeDetailSection}`"
          class="content-box border-radius-32 attendance-detail-body attendance-section-body"
          :class="sectionAttendanceRows.length
            ? 'background outline-light-1'
            : 'light-color attendance-section-body-empty'"
          role="tabpanel"
          :aria-labelledby="`attendance-tab-${activeDetailSection}`"
          aria-live="polite"
        >
          <div v-if="attendanceSectionsError" class="simple-container align-center justify-center grow-1" role="alert">
            <span class="body-medium outline-text">{{ attendanceSectionsError }}</span>
          </div>
          <div v-else-if="attendanceDetailLoading" class="attendance-section-skeleton" role="status" aria-label="Cargando registros del salón">
            <div class="attendance-section-skeleton-kpis" aria-hidden="true">
              <span v-for="index in 3" :key="`kpi-${index}`" class="content-box light-color">
                <span class="attendance-skeleton-block animation-loading-1" style="width: 76px; height: 14px; border-radius: 7px"></span>
                <span class="attendance-skeleton-block animation-loading-1" style="width: 40px; height: 24px; border-radius: 8px"></span>
              </span>
            </div>
            <div class="attendance-section-skeleton-table" aria-hidden="true">
              <div class="attendance-section-skeleton-row">
                <span v-for="index in 4" :key="`head-${index}`" class="attendance-skeleton-block animation-loading-1" style="width: 76%; height: 13px; border-radius: 7px"></span>
              </div>
              <div v-for="row in 8" :key="`row-${row}`" class="attendance-section-skeleton-row">
                <span v-for="column in 4" :key="`${row}-${column}`" class="attendance-skeleton-block animation-loading-1" :style="{ width: column === 3 ? '56px' : `${48 + ((row + column) % 4) * 12}px`, height: '14px', borderRadius: '7px' }"></span>
              </div>
            </div>
          </div>
          <div v-else-if="attendanceDetailError" class="simple-container align-center justify-center grow-1" role="alert">
            <span class="body-medium outline-text">{{ attendanceDetailError }}</span>
          </div>
          <template v-else-if="sectionAttendanceRows.length">
            <div class="simple-container gap-8 flex-wrap attendance-section-kpis">
              <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
                <span class="body-large outline-text line-height-1">Presentes</span>
                <span class="headline-small weight-500">{{ sectionAttendanceSummary.present }}</span>
              </div>
              <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
                <span class="body-large outline-text line-height-1">Tardanzas</span>
                <span class="headline-small weight-500">{{ sectionAttendanceSummary.late }}</span>
              </div>
              <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
                <span class="body-large outline-text line-height-1">Ausentes</span>
                <span class="headline-small weight-500">{{ sectionAttendanceSummary.absent }}</span>
              </div>
            </div>

            <div class="attendance-section-table-wrap">
              <table class="style-1 attendance-section-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Estado</th>
                    <th>Hora de ingreso</th>
                  </tr>
                </thead>
                <tbody v-if="sectionAttendanceRows.length">
                  <tr v-for="student in paginatedSectionAttendanceRows" :key="student.id">
                    <td>{{ student.nombre }}</td>
                    <td>{{ student.apellido }}</td>
                    <td>
                      <div class="attendance-status-cell">
                        <span
                          class="attendance-status"
                          :class="{
                            'is-present': student.estado === 'Presente',
                            'is-late': student.estado === 'Tardanza',
                            'is-absent': student.estado === 'Ausente',
                            'is-justified': student.estado === 'Justificado',
                          }"
                        >
                          {{ student.estado }}
                        </span>
                        <button
                          v-if="canEditAttendance && student.id"
                          type="button"
                          class="style-7 for-icon small rounded background outline-text attendance-edit-status"
                          :aria-label="`Editar asistencia de ${student.nombre} ${student.apellido}`"
                          title="Editar asistencia"
                          @click.stop="openAttendanceEdit($event, student)"
                        >
                          <md-ripple aria-hidden="true"></md-ripple>
                          <md-icon aria-hidden="true">edit</md-icon>
                        </button>
                      </div>
                    </td>
                    <td class="attendance-arrival-time">{{ student.horaIngreso }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <PaginationControls
              :page="attendanceSectionPage"
              :page-size="ATTENDANCE_SECTION_PAGE_SIZE"
              :total="sectionAttendanceRows.length"
              @update:page="setAttendanceSectionPage"
            />
          </template>
          <div v-else class="simple-container direction-column align-center gap-8 attendance-detail-message attendance-statistics-empty">
            <md-icon class="pretty-minimal outline-text" aria-hidden="true">groups</md-icon>
            <span class="title-medium weight-500">No hay asistencias registradas</span>
            <span class="body-medium outline-text">
              Cuando se registren asistencias para esta fecha, aparecerá aquí el detalle del salón.
            </span>
          </div>
        </section>
      </section>
    </template>
  </FlipModal>

  <FlipModal
    v-if="editAttendance.open.value"
    :origin="editAttendance.origin.value"
    window-class="slim"
    content-class="simple-container direction-column gap-24"
    content-data-v="att-edit"
    close-strategy="container-only"
    @close="editAttendance.hide"
  >
    <template #default="{ close }">
      <div data-v-att-edit class="simple-container direction-column gap-8">
        <span class="display-small weight-600 title line-height-1 text-gradient">Editar asistencia</span>
        <span class="body-medium outline-text">
          {{ editAttendance.payload.value?.nombre }} {{ editAttendance.payload.value?.apellido }}
        </span>
      </div>
      <form class="simple-container direction-column gap-16" @submit.prevent="saveAttendanceEdit(close)">
        <div data-v-att-edit data-flow-item data-input-label="Estado de asistencia">
          <SelectFlip
            v-model="attendanceEditState"
            name="attendance-status"
            aria-label="Estado de asistencia"
            :options="attendanceStateOptions"
            :option-height="52"
          />
        </div>
        <span v-if="attendanceEditError" class="body-medium error-text" role="alert">
          {{ attendanceEditError }}
        </span>
        <div class="simple-container justify-right gap-8">
          <button
            type="button"
            class="style-7 for-icon small outline-text transparent rounded"
            aria-label="Cancelar edición"
            :disabled="attendanceEditLoading"
            @click="close()"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon aria-hidden="true">close</md-icon>
          </button>
          <button
            type="submit"
            class="style-7 rounded flex-0-1 justify-center primary-container on-primary-container-text with-icon-left"
            :disabled="attendanceEditLoading"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon aria-hidden="true">check</md-icon>
            {{ attendanceEditLoading ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
    </template>
  </FlipModal>

  <FlipModal
    v-if="removeAttendance.open.value"
    :origin="removeAttendance.origin.value"
    window-class="slim"
    content-class="simple-container direction-column gap-24"
    content-data-v="28392b8b"
    @close="removeAttendance.hide"
  >
    <template #default="{ close }">
      <div data-v-28392b8b class="simple-container direction-column gap-16">
        <span class="display-small weight-600 title line-height-1 text-gradient">
          Eliminar asistencia
        </span>
        <span class="body-large">
          ¿Estás seguro de que deseas eliminar {{ attendanceTitle(removeAttendance.payload.value).toLocaleLowerCase('es-PE') }}?
        </span>
      </div>
      <div class="simple-container justify-right gap-8">
        <button
          type="button"
          class="style-7 rounded surface-container-low outline-text flex-0-1 justify-center"
          @click="close()"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="style-7 rounded flex-0-1 justify-center danger-true error-container error-text with-icon-left"
          :disabled="attendanceDeleteLoading"
          @click="confirmDeleteAttendance(close)"
        >
          <md-icon v-if="!attendanceDeleteLoading" class="filled dynamic" aria-hidden="true">delete</md-icon>
          <span>{{ attendanceDeleteLoading ? 'Eliminando…' : 'Eliminar' }}</span>
        </button>
      </div>
    </template>
  </FlipModal>

  <ModalSearch
    v-if="search.open.value"
    v-model="searchQuery"
    :origin="search.origin.value"
    scope="asistencias"
    @close="search.hide"
  />
  <ModalFilters
    v-if="filters.open.value"
    :attendance-sort="attendanceSort"
    :attendance-period="attendancePeriod"
    :attendance-month="attendanceMonth"
    :attendance-year="attendanceYear"
    :origin="filters.origin.value"
    scope="asistencias"
    @update:attendance-month="attendanceMonth = $event"
    @update:attendance-year="attendanceYear = $event"
    @update:attendance-period="setAttendancePeriod"
    @update:attendance-sort="attendanceSort = $event"
    @close="filters.hide"
  />
</template>

<style scoped>
.attendance-view {
  min-width: 0;
}

.attendance-view .app-header {
  flex-wrap: wrap;
  gap: 12px;
}

.attendance-mobile-menu {
  flex: 0 0 auto;
}

.attendance-toolbar {
  display: flex;
  flex: 0 1 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
  margin-left: auto;
}

.attendance-week-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 40px;
}

.attendance-week-navigation > span {
  min-width: 180px;
  text-align: center;
  text-transform: capitalize;
}

.attendance-week-navigation button:disabled {
  opacity: 0.4;
  cursor: default;
}

.attendance-grid-loading {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.attendance-grid-loading .attendance-card-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.attendance-skeleton-block {
  display: block;
  flex: 0 0 auto;
  background: var(--md-sys-color-surface-container);
}

.attendance-list-empty {
  display: flex;
  grid-column: 1 / -1;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: min(48vh, 420px);
  box-sizing: border-box;
  padding: 32px 20px;
  text-align: center;
}

.attendance-empty-placeholder {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: min(48vh, 420px);
  gap: 12px;
  text-align: center;
}

.attendance-empty-placeholder > span {
  max-width: 100%;
  text-wrap: balance;
}

.attendance-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.attendance-list .attendance-card-section {
  width: 100%;
}

.attendance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  align-content: start;
  gap: 8px;
  min-width: 0;
}

.attendance-grid .attendance-card-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.attendance-date-heading {
  min-height: 40px;
  padding: 0 16px;
  box-sizing: border-box;
}

.attendance-record {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  padding: 12px 16px;
}

.attendance-record h2 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attendance-list-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.attendance-list-total {
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: max-content;
  margin-right: 8px;
  font-variant-numeric: tabular-nums;
}

.attendance-grid-card {
  width: 100%;
  box-sizing: border-box;
  min-height: 0;
  min-width: 0;
}

.attendance-grid-card:hover .attendance-grid-view-button {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.attendance-card-open {
  position: absolute;
  z-index: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  border-radius: inherit;
  background: transparent;
  cursor: pointer;
}

.attendance-card-open:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: -4px;
}

.attendance-card-heading {
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.attendance-grid-actions {
  position: relative;
  z-index: 1;
}

.attendance-detail-header {
  padding: 16px;
}

.attendance-detail-body {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: 32px;
  text-align: center;
}

.attendance-statistics-body {
  align-items: stretch;
  justify-content: flex-start;
  flex-direction: column;
  gap: 12px;
  min-height: 440px;
  padding: 24px;
  text-align: left;
}

.attendance-hourly-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.attendance-hourly-total {
  flex: 0 0 auto;
  padding-top: 4px;
  font-variant-numeric: tabular-nums;
}

.attendance-hourly-chart {
  position: relative;
  flex: 0 0 380px;
  width: 100%;
  height: 380px;
  min-width: 0;
  margin-top: auto;
}

.attendance-detail-chart-skeleton {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.attendance-hourly-chart-loading {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: clamp(3px, 1.2vw, 12px);
  box-sizing: border-box;
  padding: 12px 10px 40px;
}

.attendance-chart-loading-bar {
  flex: 1 1 0;
  min-width: 4px;
  max-width: 36px;
  min-height: 12px;
  border-radius: 999px;
  background: var(--md-sys-color-surface-container);
}

.attendance-hourly-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.attendance-hourly-area {
  fill: url(#attendance-hourly-fill);
}

.attendance-hourly-line {
  fill: none;
  stroke: var(--md-sys-color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.attendance-hourly-point {
  fill: var(--md-sys-color-primary);
  stroke: var(--md-sys-color-background);
  stroke-width: 3;
  opacity: 0;
  transition: opacity 120ms ease, r 120ms ease;
}

.attendance-hourly-point.active {
  opacity: 1;
}

.attendance-hourly-interaction {
  fill: transparent;
  cursor: crosshair;
  outline: none;
}

.attendance-hourly-interaction:focus-visible {
  fill: color-mix(in srgb, var(--md-sys-color-primary) 5%, transparent);
  stroke: var(--md-sys-color-primary);
  stroke-width: 2;
  stroke-dasharray: 3 3;
}

.attendance-hourly-time {
  fill: var(--md-sys-color-outline);
  font-family: var(--app-main-font);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.attendance-hourly-tooltip {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 10px;
  border-radius: 12px;
  background: var(--md-sys-color-inverse-surface);
  color: var(--md-sys-color-inverse-on-surface);
  white-space: nowrap;
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 12px));
}

.attendance-section-body {
  align-items: stretch;
  justify-content: flex-start;
  gap: 16px;
  min-width: 0;
  padding: 24px;
  text-align: left;
}

.attendance-section-body-empty {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.attendance-section-skeleton {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

.attendance-section-skeleton-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.attendance-section-skeleton-kpis > span {
  display: flex;
  min-height: 96px;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-radius: 24px;
}

.attendance-section-skeleton-table {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
}

.attendance-section-skeleton-row {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.3fr) minmax(0, 1.1fr) minmax(0, 1.4fr);
  align-items: center;
  gap: 8px;
  min-height: 42px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.attendance-section-skeleton-row:last-child {
  border-bottom: 0;
}

.attendance-section-table-wrap {
  flex: 1 1 auto;
  min-width: 0;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--md-sys-color-outline-variant) transparent;
}

.attendance-section-table {
  width: 100%;
  min-width: 520px;
}

.attendance-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 2px 10px;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.attendance-status.is-present {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.attendance-status.is-late {
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}

.attendance-status-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.attendance-edit-status {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  opacity: 0.72;
}

.attendance-edit-status:hover,
.attendance-edit-status:focus-visible {
  opacity: 1;
}

.attendance-status.is-absent {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.attendance-status.is-justified {
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface-variant);
}

.attendance-arrival-time {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.attendance-detail-message {
  max-width: 400px;
}

.attendance-statistics-empty {
  flex: 1 1 auto;
  align-self: center;
  justify-content: center;
  width: min(100%, 400px);
  min-height: 0;
  text-align: center;
}

@media (max-width: 680px) {
  .attendance-week-navigation {
    margin-top: -8px;
  }

  .attendance-week-navigation > span {
    min-width: 0;
    flex: 1 1 auto;
  }
  .attendance-view .app-header {
    flex-wrap: nowrap;
    align-items: center;
    gap: 8px;
  }

  .attendance-view .app-header > h1 {
    flex: 1 1 auto;
    min-width: 0;
  }

  .attendance-view .attendance-toolbar {
    display: none;
  }

  .attendance-view :deep(.mobile-action-menu-trigger) {
    flex: 0 0 48px;
    width: 48px;
    height: 48px;
  }

  .attendance-empty-placeholder {
    min-height: clamp(260px, 48vh, 380px);
    padding: 24px 16px;
  }

  .attendance-empty-placeholder > span {
    font-size: clamp(16px, 4.4vw, 20px);
    line-height: 1.3;
  }

  .attendance-statistics-body {
    gap: 8px;
    min-height: 390px;
    padding: 16px;
  }

  .attendance-hourly-chart {
    flex-basis: 340px;
    height: 340px;
  }

  .attendance-hourly-svg {
    min-height: 0;
  }

  .attendance-hourly-time {
    font-size: 10px;
  }

  .attendance-hourly-header {
    flex-wrap: wrap;
  }

  .attendance-hourly-total {
    padding-top: 0;
  }

  .attendance-section-body {
    gap: 12px;
    padding: 16px;
  }

  .attendance-section-skeleton-kpis > span {
    min-height: 76px;
    padding: 10px;
  }

  .attendance-section-skeleton-table {
    padding: 0 6px;
  }

  .attendance-section-skeleton-row {
    gap: 4px;
    min-height: 36px;
  }

  .attendance-section-table {
    min-width: 0;
    table-layout: fixed;
  }

  .attendance-section-table th,
  .attendance-section-table td {
    height: auto;
    padding: 6px 5px;
    font-size: 11px;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .attendance-section-table th:nth-child(1),
  .attendance-section-table td:nth-child(1) {
    width: 18%;
  }

  .attendance-section-table th:nth-child(2),
  .attendance-section-table td:nth-child(2) {
    width: 27%;
  }

  .attendance-section-table th:nth-child(3),
  .attendance-section-table td:nth-child(3) {
    width: 25%;
  }

  .attendance-section-table th:nth-child(4),
  .attendance-section-table td:nth-child(4) {
    width: 30%;
  }

  .attendance-section-table-wrap {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .attendance-status {
    min-height: 22px;
    padding: 2px 4px;
    font-size: 10px;
  }

  .attendance-edit-status {
    opacity: 1;
  }

  .attendance-arrival-time {
    white-space: normal;
  }
}

.attendance-card-heading {
  width: 100%;
  min-width: 0;
}

.attendance-grid-actions {
  width: 100%;
}

.attendance-list-pagination {
  margin-top: auto;
}

@media (max-width: 480px) {
  .attendance-view :deep(.mobile-action-menu-trigger) {
    flex-basis: 44px;
    width: 44px;
    height: 44px;
  }

  .attendance-empty-placeholder {
    min-height: clamp(240px, 44vh, 340px);
  }

  .attendance-record {
    gap: 8px;
    padding: 10px 12px;
  }

  .attendance-record h2 {
    font-size: 14px;
  }

  .attendance-list-actions {
    gap: 4px;
  }

  .attendance-list-total {
    flex-direction: column;
    align-items: flex-end;
    gap: 0;
    margin-right: 4px;
    font-size: 14px;
    line-height: 1.1;
  }

  .attendance-list-total .body-medium {
    font-size: 11px;
    white-space: nowrap;
  }
}
</style>
