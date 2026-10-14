<script setup>
import { computed } from 'vue'
import { useStore } from '../stores/data'
import { useModal } from '../composables/useModal'
import ModalCreateStudent from '../components/ModalCreateStudent.vue'
import ModalEditStudent from '../components/ModalEditStudent.vue'
import ModalDeleteStudent from '../components/ModalDeleteStudent.vue'
import ModalSearch from '../components/ModalSearch.vue'
import ModalFilters from '../components/ModalFilters.vue'
import ModalExport from '../components/ModalExport.vue'
import MobileActionMenu from '../components/MobileActionMenu.vue'
import { toast } from 'super-beautiful-toast'

const { filteredEstudiantes, updateEstudiante, deleteEstudiante } = useStore()

const create = useModal()
const edit = useModal()
const remove = useModal()
const search = useModal()
const filters = useModal()
const exportModal = useModal()

const students = filteredEstudiantes
const hasData = computed(() => students.value.length > 0)
const activeStudents = computed(
  () => students.value.filter((student) => student.estado === 'Activo').length,
)
const inactiveStudents = computed(
  () => students.value.filter((student) => student.estado === 'Inactivo').length,
)
const sections = computed(
  () => new Set(students.value.map((student) => student.salon_seccion).filter(Boolean)).size,
)

const mobileActions = [
  { id: 'create', label: 'Nuevo estudiante', icon: 'add' },
  { id: 'search', label: 'Buscar', icon: 'search' },
  { id: 'filters', label: 'Filtros', icon: 'page_info' },
  { id: 'export', label: 'Exportar', icon: 'download' },
]

function handleMobileAction(action, event) {
  if (action === 'create') create.show(event)
  if (action === 'search') search.show(event)
  if (action === 'filters') filters.show(event)
  if (action === 'export') exportModal.show(event)
}

function updateStudent(updatedStudent) {
  updateEstudiante(updatedStudent.codigo_alumno, updatedStudent)
}

function deleteStudent(studentId) {
  deleteEstudiante(studentId)
}

function confirmDeleteStudent() {
  deleteStudent(remove.payload.value?.codigo_alumno)
  toast.success('Estudiante eliminado', { icon: null })
  remove.hide()
}
</script>

<template>
  <div class="app-view">
    <div class="simple-container direction-column gap-24 grow-1">
      <div class="app-header">
        <span class="display-medium weight-500 text-gradient">Estudiantes</span>
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
            <md-icon data-shared-item="icon" aria-hidden="true">page_info</md-icon>
          </button>
          <button
            class="style-7 for-icon bigger rounded primary-container on-primary-container-text"
            @click="create.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon data-shared-item="addIcon" aria-hidden="true">add</md-icon>
          </button>
        </div>
      </div>

      <div class="simple-container direction-column">
        <div class="asyncstate-data">
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
              <span class="headline-small weight-500">{{ inactiveStudents }}</span>
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
          <div v-if="!hasData" class="simple-container grow-1">
            <div class="content-box light-color grow-1 align-center justify-center padding-24">
              <md-icon class="pretty-minimal outline-text" aria-hidden="true">groups</md-icon>
              <span class="headline-small weight-500 outline-text">
                No hay estudiantes registrados
              </span>
            </div>
          </div>

          <!-- En escritorio se conserva la tabla de Trámites, sin botones de acción. -->
          <div v-if="hasData" id="studentsTable" class="simple-container direction-column hide-on-mobile">
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
                  v-for="student in students"
                  :key="student.codigo_alumno"
                  class="student-table-row"
                  @click="edit.show($event, student)"
                >
                  <td>
                    <div class="body-medium amount plain positive">{{ student.codigo_alumno }}</div>
                  </td>
                  <td>
                    <div class="body-medium amount plain positive">{{ student.dni }}</div>
                  </td>
                  <td>
                    <span data-shared-item="student-name" data-shared-split="words">
                      {{ student.nombres }}
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
                        @click.stop="remove.show($event, student)"
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
          <div v-if="hasData" id="studentsMobile" class="simple-container direction-column only-on-mobile">
            <article
              v-for="student in students"
              :key="student.codigo_alumno"
              class="student-row"
              @click="edit.show($event, student)"
            >
              <div class="student-avatar" aria-hidden="true">
                <md-icon>person</md-icon>
              </div>
              <div class="student-details">
                <span
                  class="body-large weight-500 student-name"
                  data-shared-item="student-name"
                  data-shared-split="words"
                >
                  {{ student.nombres }}
                </span>
                <span class="label-large outline-text student-section">
                  {{ student.salon_seccion }}
                </span>
              </div>
              <span class="student-status">{{ student.estado }}</span>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalEditStudent
    v-if="edit.open.value"
    :origin="edit.origin.value"
    :student="edit.payload.value"
    @save="updateStudent"
    @delete="deleteStudent"
    @close="edit.hide"
  />
  <ModalDeleteStudent
    v-if="remove.open.value"
    :origin="remove.origin.value"
    :student="remove.payload.value"
    @confirm="confirmDeleteStudent"
    @close="remove.hide"
  />
  <ModalCreateStudent
    v-if="create.open.value"
    :origin="create.origin.value"
    @close="create.hide"
  />
  <ModalSearch
    v-if="search.open.value"
    :origin="search.origin.value"
    scope="estudiantes"
    @close="search.hide"
  />
  <ModalFilters
    v-if="filters.open.value"
    :origin="filters.origin.value"
    scope="estudiantes"
    @close="filters.hide"
  />
  <ModalExport
    v-if="exportModal.open.value"
    :origin="exportModal.origin.value"
    scope="estudiantes"
    @close="exportModal.hide"
  />
</template>
