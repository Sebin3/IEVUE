<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from '../stores/data'
import { useModal } from '../composables/useModal'
import { usePagination } from '../composables/usePagination'
import ModalSearch from '../components/ModalSearch.vue'
import ModalFilters from '../components/ModalFilters.vue'
import ModalExport from '../components/ModalExport.vue'
import MobileActionMenu from '../components/MobileActionMenu.vue'
import PaginationControls from '../components/PaginationControls.vue'
import SelectFlip from '../components/SelectFlip.vue'
import ModalEditStudent from '../components/ModalEditStudent.vue'
import ModalDeleteStudent from '../components/ModalDeleteStudent.vue'
import ModalCreateStudent from '../components/ModalCreateStudent.vue'
import { apiGetCached } from '../services/api'

const { state, filteredEstudiantes, replaceEstudiantes } = useStore()

const search = useModal()
const filters = useModal()
const exportModal = useModal()
const createModal = useModal()
const loading = ref(true)
const loadError = ref('')
const availableSections = ref([])
const selectedStudent = ref(null)
const selectedStudentOrigin = ref(null)
const deletingStudent = ref(null)
const deleteStudentOrigin = ref(null)
let requestController
let sectionsInitialized = false

const students = filteredEstudiantes
const STUDENT_PAGE_SIZE = 12
const STUDENT_SKELETON_ROWS = Array.from({ length: STUDENT_PAGE_SIZE }, (_, index) => index)
const { currentPage, paginatedItems: paginatedStudents, setPage } = usePagination(
  students,
  STUDENT_PAGE_SIZE,
)
watch(
  [() => state.studentQuery, () => state.studentFilters.estado, () => state.studentFilters.salon],
  () => { currentPage.value = 1 },
)
const hasData = computed(() => students.value.length > 0)
const activeStudents = computed(
  () => students.value.filter((student) => student.estado === 'Activo').length,
)
const inactiveStudents = computed(
  () => students.value.filter((student) => student.estado === 'Inactivo').length,
)
const sectionOptions = computed(() => {
  const sections = [...availableSections.value]
  if (!sections.some((section) => section.nombre === '1ro A')) {
    sections.unshift({ id: '', nombre: '1ro A', grado: '1ro', seccion: 'A' })
  }

  return sections
    .filter((section) => section.nombre)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }))
    .map((section) => {
      const gradeNumber = String(section.grado || section.nombre).match(/\d+/)?.[0]
      const groupLetter = section.seccion || section.nombre.match(/\b([A-E])$/i)?.[1]
      const gradeNames = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto']
      return {
        id: section.id,
        value: section.nombre,
        label: gradeNumber && groupLetter ? `${gradeNumber}${groupLetter.toUpperCase()}` : section.nombre,
        group: gradeNumber ? gradeNames[Number(gradeNumber) - 1] || `Grado ${gradeNumber}` : 'Otros salones',
      }
    })
})
const sections = computed(() => sectionOptions.value.length)
const studentSalonOptions = computed(() => sectionOptions.value
  .filter((section) => section.id)
  .map((section) => ({ value: section.id, label: section.label, group: section.group })))

async function loadSections() {
  try {
    const records = await apiGetCached('/api/secciones')
    availableSections.value = (Array.isArray(records) ? records : [])
      .map((section) => ({
        id: section.id,
        nombre: section.nombre,
        grado: section.grado,
        seccion: section.seccion,
      }))
      .filter((section) => section.nombre)
  } catch {
    // Se conserva 1A como opción inicial si el catálogo no está disponible.
    availableSections.value = []
  }
}

async function loadStudents() {
  requestController?.abort()
  requestController = new AbortController()
  const controller = requestController
  loading.value = true
  loadError.value = ''

  try {
    const params = new URLSearchParams({
      seccion: state.studentFilters.salon || '1ro A',
      limit: '100',
    })
    const records = await apiGetCached(`/api/admin/alumnos?${params}`, { signal: controller.signal })
    replaceEstudiantes((Array.isArray(records) ? records : []).map((student) => ({
      ...student,
      codigo_alumno: student.codigo_alumno ?? student.id,
      nombres: student.nombres || '',
      apellidos: student.apellidos || '',
      nombre_completo: student.nombre_completo || `${student.nombres || ''} ${student.apellidos || ''}`.trim(),
      correo_institucional: student.email || '',
      salon_seccion: student.seccion || '',
      seccion_id: student.seccion_id || '',
      telefono: student.telefono || '',
      qr_code: student.qr_code || '',
      qr_image: student.qr_image || '',
      estado: String(student.estado || '').toLocaleLowerCase('es-PE') === 'activo' ? 'Activo' : 'Inactivo',
    })))
  } catch (error) {
    if (error.name === 'AbortError') return
    replaceEstudiantes([])
    loadError.value = error.message || 'No se pudieron cargar los estudiantes.'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

watch(
  () => state.studentFilters.salon,
  () => {
    currentPage.value = 1
    if (sectionsInitialized) loadStudents()
  },
)

function openStudent(student, event) {
  selectedStudent.value = student
  selectedStudentOrigin.value = event?.currentTarget || event?.target || null
}

function closeStudent() {
  selectedStudent.value = null
  selectedStudentOrigin.value = null
}

async function refreshStudentsAfterEdit() {
  await loadStudents()
}

function removeStudentFromList(id) {
  replaceEstudiantes(students.value.filter((student) => student.id !== id))
}

function confirmStudentRemoval(student, event) {
  deletingStudent.value = student
  deleteStudentOrigin.value = event?.currentTarget || event?.target || null
}

function closeStudentRemoval() {
  deletingStudent.value = null
  deleteStudentOrigin.value = null
}

onMounted(async () => {
  await loadSections()
  sectionsInitialized = true
  await loadStudents()
})
onBeforeUnmount(() => requestController?.abort())

function nameInitials(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  return words.length
    ? words.slice(0, 2).map((word) => Array.from(word)[0].toLocaleUpperCase('es-PE')).join('')
    : '?'
}

const mobileActions = [
  { id: 'create', label: 'Nuevo estudiante', icon: 'add' },
  { id: 'search', label: 'Buscar', icon: 'search' },
  { id: 'filters', label: 'Filtros', icon: 'page_info' },
  { id: 'export', label: 'Exportar', icon: 'download' },
]

function handleMobileAction(action, event) {
  if (action === 'create') createModal.show(event)
  if (action === 'search') search.show(event)
  if (action === 'filters') filters.show(event)
  if (action === 'export') exportModal.show(event)
}

</script>

<template>
  <div class="app-view">
    <div class="simple-container direction-column gap-24 grow-1">
      <div class="app-header">
        <h1 class="display-medium weight-500 text-gradient">Estudiantes</h1>
        <MobileActionMenu
          :actions="mobileActions"
          @select="handleMobileAction"
        />
        <div class="simple-container gap-8 hide-on-mobile">
          <button
            class="style-7 for-icon bigger hover-border-radius-round background outline-light-1 outline-text search-btn"
            @click="search.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon data-shared-item="icon" aria-hidden="true">search</md-icon>
          </button>
          <button
            class="style-7 for-icon bigger hover-border-radius-round background outline-light-1 outline-text download-btn"
            @click="exportModal.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon data-shared-item="icon" aria-hidden="true">download</md-icon>
          </button>
          <button
            class="style-7 for-icon bigger hover-border-radius-round background outline-light-1 outline-text filters-btn"
            @click="filters.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon data-shared-item="icon" aria-hidden="true">filter_list</md-icon>
          </button>
          <button
            class="style-7 for-icon bigger rounded primary-container on-primary-container-text"
            title="Nuevo estudiante"
            @click="createModal.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon data-shared-item="addIcon" aria-hidden="true">add</md-icon>
          </button>
        </div>
      </div>

      <div class="simple-container direction-column">
        <div v-if="loading" class="asyncstate-data" aria-hidden="true">
          <div class="simple-container gap-8 flex-wrap">
            <div v-for="item in 4" :key="item" class="content-box width-auto basis-small grow-1 light-color gap-4">
              <span class="animation-loading-1" style="width: 72px; height: 14px; border-radius: 7px; background: var(--md-sys-color-surface-container)"></span>
              <span class="animation-loading-1" style="width: 48px; height: 24px; border-radius: 8px; background: var(--md-sys-color-surface-container)"></span>
            </div>
          </div>
        </div>
        <div v-else-if="!loadError" class="asyncstate-data">
          <!-- Mantiene la misma estructura y dimensiones de las tarjetas de Trámites. -->
          <div class="simple-container gap-8 flex-wrap">
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Alumnos</span>
              <span class="headline-small weight-500">{{ students.length }}</span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Activos</span>
              <span class="headline-small weight-500">{{ activeStudents }}</span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Inactivos</span>
              <span class="headline-small weight-500">{{ inactiveStudents ?? '—' }}</span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Secciones</span>
              <span class="headline-small weight-500">{{ sections }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="simple-container direction-column grow-1">
        <div class="asyncstate-data">
          <div
            v-if="loading"
            class="asyncstate-data direction-column grow-1 gap-8"
            role="status"
            aria-label="Cargando estudiantes"
            aria-busy="true"
          >
            <div id="studentsTable" class="simple-container direction-column hide-on-mobile" aria-hidden="true">
              <table class="style-1">
                <thead>
                  <tr>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">tag</md-icon>
                      Código
                    </th>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">badge</md-icon>
                      DNI
                    </th>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">person</md-icon>
                      Nombre y apellido
                    </th>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">email</md-icon>
                      Correo Institucional
                    </th>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">meeting_room</md-icon>
                      Salón y sección
                    </th>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">toggle_on</md-icon>
                      Estado
                    </th>
                    <th aria-label="Acciones"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in STUDENT_SKELETON_ROWS" :key="row">
                    <td v-for="column in 6" :key="column">
                      <span class="animation-loading-1" style="display: block; width: 76%; height: 14px; border-radius: 7px; background: var(--md-sys-color-surface-container)"></span>
                    </td>
                    <td>
                      <span class="animation-loading-1" style="display: block; width: 28px; height: 28px; border-radius: 50%; background: var(--md-sys-color-surface-container)"></span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div id="studentsMobile" class="simple-container direction-column only-on-mobile" aria-hidden="true">
              <article v-for="row in STUDENT_SKELETON_ROWS" :key="row" class="student-row">
                <span class="animation-loading-1" style="width: 48px; height: 48px; flex: 0 0 48px; border-radius: 50%; background: var(--md-sys-color-surface-container)"></span>
                <div class="student-details">
                  <span class="animation-loading-1" style="width: 144px; height: 16px; border-radius: 8px; background: var(--md-sys-color-surface-container)"></span>
                  <span class="animation-loading-1" style="width: 72px; height: 12px; border-radius: 6px; background: var(--md-sys-color-surface-container)"></span>
                </div>
                <span class="animation-loading-1" style="width: 56px; height: 22px; border-radius: 11px; background: var(--md-sys-color-surface-container)"></span>
              </article>
            </div>
          </div>
          <div v-else-if="loadError" class="simple-container grow-1 content-box light-color align-center justify-center gap-16" role="alert">
            <span class="body-large">{{ loadError }}</span>
            <button type="button" class="style-7 rounded background outline-text" @click="loadStudents">
              Reintentar
            </button>
          </div>
          <div v-else-if="!hasData" class="simple-container grow-1">
            <div class="content-box light-color grow-1 align-center justify-center padding-24">
              <md-icon class="pretty-minimal outline-text" aria-hidden="true">groups</md-icon>
              <span class="headline-small weight-500 outline-text">
                No hay estudiantes en {{ sectionOptions.find((option) => option.value === state.studentFilters.salon)?.label || '1A' }}
              </span>
            </div>
          </div>

          <!-- En escritorio se conserva la tabla de Trámites, sin botones de acción. -->
          <div v-if="!loading && !loadError && hasData" id="studentsTable" class="simple-container direction-column hide-on-mobile">
            <table class="style-1">
              <thead>
                <tr>
                  <th>
                    <md-icon class="dynamic filled" aria-hidden="true">tag</md-icon>
                    Código
                  </th>
                  <th>
                    <md-icon class="dynamic filled" aria-hidden="true">badge</md-icon>
                    DNI
                  </th>
                  <th>
                    <md-icon class="dynamic filled" aria-hidden="true">person</md-icon>
                    Nombre y apellido
                  </th>
                  <th>
                    <md-icon class="dynamic filled" aria-hidden="true">email</md-icon>
                    Correo Institucional
                  </th>
                  <th>
                    <md-icon class="dynamic filled" aria-hidden="true">meeting_room</md-icon>
                    Salón y sección
                  </th>
                  <th>
                    <md-icon class="dynamic filled" aria-hidden="true">toggle_on</md-icon>
                    Estado
                  </th>
                  <th aria-label="Acciones"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="student in paginatedStudents"
                  :key="student.codigo_alumno"
                  class="student-table-row"
                  @click="openStudent(student, $event)"
                >
                  <td>
                    <div class="body-medium amount plain positive">{{ student.codigo_alumno }}</div>
                  </td>
                  <td>
                    <div class="body-medium amount plain positive">{{ student.dni }}</div>
                  </td>
                  <td>
                      <span data-shared-item="student-name" data-shared-split="words">
                        {{ student.nombre_completo }}
                    </span>
                  </td>
                  <td>{{ student.correo_institucional || '-' }}</td>
                  <td>{{ student.salon_seccion }}</td>
                  <td>{{ student.estado }}</td>
                  <td>
                    <div class="simple-container justify-right">
                      <button
                        type="button"
                        class="style-7 for-icon small hover-error-container background outline-text"
                        aria-label="Eliminar estudiante"
                        title="Eliminar estudiante"
                        @click.stop="confirmStudentRemoval(student, $event)"
                      >
                        <md-ripple aria-hidden="true"></md-ripple>
                        <md-icon aria-hidden="true">delete</md-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- En celular se mantiene una fila compacta y seleccionable. -->
          <div v-if="!loading && !loadError && hasData" id="studentsMobile" class="simple-container direction-column only-on-mobile">
            <article
              v-for="student in paginatedStudents"
              :key="student.codigo_alumno"
              class="student-row"
              role="button"
              tabindex="0"
              @click="openStudent(student, $event)"
              @keydown.enter.prevent="openStudent(student, $event)"
              @keydown.space.prevent="openStudent(student, $event)"
            >
              <div class="student-avatar member-avatar" aria-hidden="true">
                {{ nameInitials(student.nombre_completo) }}
              </div>
              <div class="student-details">
                <span
                  class="body-large weight-500 student-name"
                  data-shared-item="student-name"
                  data-shared-split="words"
                >
                  {{ student.nombre_completo }}
                </span>
                <span class="label-large outline-text student-section">
                  {{ student.salon_seccion }}
                </span>
              </div>
              <span class="student-status">{{ student.estado }}</span>
            </article>
          </div>

          <PaginationControls
            v-if="!loading && !loadError && hasData"
            :page="currentPage"
            :page-size="STUDENT_PAGE_SIZE"
            :total="students.length"
            @update:page="setPage"
          />
        </div>
      </div>
    </div>
  </div>

  <ModalSearch
    v-if="search.open.value"
    :origin="search.origin.value"
    scope="estudiantes"
    @close="search.hide"
  />
  <ModalCreateStudent
    v-if="createModal.open.value"
    :origin="createModal.origin.value"
    @close="createModal.hide"
  />
  <ModalFilters
    v-if="filters.open.value"
    :origin="filters.origin.value"
    scope="estudiantes"
    :student-salon-options="sectionOptions"
    @close="filters.hide"
  />
  <ModalExport
    v-if="exportModal.open.value"
    :origin="exportModal.origin.value"
    scope="estudiantes"
    @close="exportModal.hide"
  />
  <ModalEditStudent
    v-if="selectedStudent"
    :origin="selectedStudentOrigin"
    :student="selectedStudent"
    :salon-options="studentSalonOptions"
    @save="refreshStudentsAfterEdit"
    @delete="removeStudentFromList"
    @close="closeStudent"
  />
  <ModalDeleteStudent
    v-if="deletingStudent"
    :origin="deleteStudentOrigin"
    :student="deletingStudent"
    @confirm="removeStudentFromList"
    @close="closeStudentRemoval"
  />
</template>
