<script setup>

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStore } from '../stores/data'
import { useModal } from '../composables/useModal'
import { usePagination } from '../composables/usePagination'
import ModalSearch from '../components/ModalSearch.vue'
import MobileActionMenu from '../components/MobileActionMenu.vue'
import PaginationControls from '../components/PaginationControls.vue'
import ModalCreateEmployee from '../components/ModalCreateEmployee.vue'
import ModalEditEmployee from '../components/ModalEditEmployee.vue'
import ModalDeleteEmployee from '../components/ModalDeleteEmployee.vue'
import { apiGetCached } from '../services/api'

const { state, filteredEmpleados, replaceEmpleados } = useStore()

const search = useModal()
const createModal = useModal()
const loading = ref(true)
const loadError = ref('')
const selectedTeacher = ref(null)
const selectedTeacherOrigin = ref(null)
const deletingTeacher = ref(null)
const deleteTeacherOrigin = ref(null)
let requestController

const empleados = filteredEmpleados
const EMPLOYEE_PAGE_SIZE = 12
const EMPLOYEE_SKELETON_ROWS = Array.from({ length: EMPLOYEE_PAGE_SIZE }, (_, index) => index)
const { currentPage, paginatedItems: paginatedEmpleados, setPage } = usePagination(
  empleados,
  EMPLOYEE_PAGE_SIZE,
)
watch(() => state.empQuery, () => { currentPage.value = 1 })
const hasData = computed(() => empleados.value.length > 0)

async function loadTeachers() {
  requestController?.abort()
  requestController = new AbortController()
  const controller = requestController
  loading.value = true
  loadError.value = ''

  try {
    const records = await apiGetCached('/api/admin/docentes?limit=100', { signal: controller.signal })
    replaceEmpleados((Array.isArray(records) ? records : []).map((teacher) => ({
      id: teacher.id,
      usuario_id: teacher.usuario_id,
      rol: teacher.rol || 'profesor',
      dni: teacher.dni || '',
      nombres: teacher.nombre_completo || `${teacher.nombres || ''} ${teacher.apellidos || ''}`.trim(),
      first_name: teacher.nombres || '',
      last_name: teacher.apellidos || '',
      email: teacher.email || '',
      is_active: Boolean(teacher.activo),
      fecha_registro: '',
    })))
  } catch (error) {
    if (error.name === 'AbortError') return
    replaceEmpleados([])
    loadError.value = error.message || 'No se pudieron cargar los docentes.'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

function openTeacher(teacher, event) {
  selectedTeacher.value = teacher
  selectedTeacherOrigin.value = event?.currentTarget || event?.target || null
}

function closeTeacher() {
  selectedTeacher.value = null
  selectedTeacherOrigin.value = null
}

function openDeleteTeacher(teacher, event) {
  deletingTeacher.value = teacher
  deleteTeacherOrigin.value = event?.currentTarget || event?.target || null
}

function closeDeleteTeacher() {
  deletingTeacher.value = null
  deleteTeacherOrigin.value = null
}

async function refreshTeachers() {
  await loadTeachers()
}

async function onTeacherDeleted() {
  closeTeacher()
  closeDeleteTeacher()
  await loadTeachers()
}

onMounted(loadTeachers)
onBeforeUnmount(() => requestController?.abort())

const mobileActions = [
  { id: 'create', label: 'Crear docente', icon: 'add' },
  { id: 'search', label: 'Buscar', icon: 'search' },
]

function handleMobileAction(action, event) {
  if (action === 'create') createModal.show(event)
  if (action === 'search') search.show(event)
}

const kpiTotal = computed(() => empleados.value.length)
const kpiActivos = computed(() => empleados.value.filter((e) => e.is_active).length)
const kpiInactivos = computed(() => empleados.value.filter((e) => !e.is_active).length)
const kpiConCorreo = computed(() => empleados.value.filter((e) => e.email).length)

function registro(e) {
  if (!e.fecha_registro) return '—'
  return new Date(e.fecha_registro).toLocaleDateString('es-PE')
}

function nameInitials(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  return words.length
    ? words.slice(0, 2).map((word) => Array.from(word)[0].toLocaleUpperCase('es-PE')).join('')
    : '?'
}
</script>

<template>
  <div class="app-view">
    <div class="simple-container direction-column gap-24 grow-1">
      <div class="app-header">
        <h1 class="display-medium weight-500 text-gradient">Docentes</h1>
        <MobileActionMenu
          :actions="mobileActions"
          @select="handleMobileAction"
        />
        <div class="simple-container gap-8 hide-on-mobile">
          <button
            class="style-7 for-icon bigger hover-border-radius-round background outline-light-1 outline-text search-btn-emp"
            @click="search.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon data-shared-item="icon" aria-hidden="true">search</md-icon>
          </button>
          <button
            class="style-7 for-icon bigger rounded primary-container on-primary-container-text add-emp-btn"
            title="Crear docente"
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
          <div class="simple-container gap-8 flex-wrap">
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Total</span>
              <span id="empKpiTotal" class="headline-small weight-500">{{ kpiTotal }}</span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Activos</span>
              <span id="empKpiActivos" class="headline-small weight-500">{{ kpiActivos }}</span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Inactivos</span>
              <span id="empKpiInactivos" class="headline-small weight-500">
                {{ kpiInactivos }}
              </span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Con correo</span>
              <span id="empKpiCorreo" class="headline-small weight-500">
                {{ kpiConCorreo }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div data-v-086fa15e class="simple-container direction-column grow-1">
        <div data-v-086fa15e class="asyncstate-data">
          <div
            v-if="loading"
            class="asyncstate-data direction-column grow-1 gap-8"
            role="status"
            aria-label="Cargando docentes"
            aria-busy="true"
          >
            <div id="empleadosTable" class="simple-container direction-column hide-on-mobile" aria-hidden="true">
              <table class="style-1">
                <thead>
                  <tr>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">person</md-icon>
                      DNI
                    </th>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">person</md-icon>
                      Nombre y apellido
                    </th>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">email</md-icon>
                      Correo institucional
                    </th>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">domain</md-icon>
                      Rol
                    </th>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">toggle_on</md-icon>
                      Estado
                    </th>
                    <th>
                      <md-icon class="dynamic filled" aria-hidden="true">calendar_today</md-icon>
                      Registro
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in EMPLOYEE_SKELETON_ROWS" :key="row">
                    <td v-for="column in 6" :key="column">
                      <span class="animation-loading-1" style="display: block; width: 76%; height: 14px; border-radius: 7px; background: var(--md-sys-color-surface-container)"></span>
                    </td>
                    <td>
                      <span class="animation-loading-1" style="display: block; width: 48px; height: 28px; border-radius: 14px; background: var(--md-sys-color-surface-container)"></span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div id="empleadosMobile" class="simple-container direction-column only-on-mobile" aria-hidden="true">
              <article v-for="row in EMPLOYEE_SKELETON_ROWS" :key="row" class="employee-row">
                <span class="animation-loading-1" style="width: 48px; height: 48px; flex: 0 0 48px; border-radius: 50%; background: var(--md-sys-color-surface-container)"></span>
                <div class="employee-details">
                  <span class="animation-loading-1" style="width: 144px; height: 16px; border-radius: 8px; background: var(--md-sys-color-surface-container)"></span>
                  <span class="animation-loading-1" style="width: 72px; height: 12px; border-radius: 6px; background: var(--md-sys-color-surface-container)"></span>
                </div>
                <div class="employee-row-status">
                  <span class="animation-loading-1" style="width: 56px; height: 22px; border-radius: 11px; background: var(--md-sys-color-surface-container)"></span>
                </div>
              </article>
            </div>
          </div>
          <div v-else-if="loadError" class="simple-container grow-1 content-box light-color align-center justify-center gap-16" role="alert">
            <span class="body-large">{{ loadError }}</span>
            <button type="button" class="style-7 rounded background outline-text" @click="loadTeachers">
              Reintentar
            </button>
          </div>
          <div v-else-if="!hasData" id="emptyStateEmp" class="simple-container grow-1">
            <div class="content-box light-color grow-1 align-center justify-center padding-24">
              <md-icon class="pretty-minimal outline-text" aria-hidden="true">badge</md-icon>
              <span class="headline-small weight-500 outline-text">
                No se encontraron docentes
              </span>
            </div>
          </div>

          <div
            v-if="hasData && !loading && !loadError"
            id="empleadosTable"
            data-v-086fa15e
            class="simple-container direction-column hide-on-mobile"
          >
            <table data-v-086fa15e class="style-1">
              <thead data-v-086fa15e>
                <tr data-v-086fa15e>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      person
                    </md-icon>
                    DNI
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      person
                    </md-icon>
                    Nombre y apellido
                  </th>
                  <!-- <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      badge
                    </md-icon>
                    DNI
                  </th> -->
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      email
                    </md-icon>
                    Correo institucional
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      domain
                    </md-icon>
                    Rol
                  </th>
                  <!-- <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      admin_panel_settings
                    </md-icon>
                    Superuser
                  </th> -->
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      toggle_on
                    </md-icon>
                    Estado
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      calendar_today
                    </md-icon>
                    Registro
                  </th>
                  <th data-v-086fa15e></th>
                </tr>
              </thead>
              <tbody data-v-086fa15e id="empleadosTableBody">
                <tr v-for="e in paginatedEmpleados" :key="e.id" data-v-086fa15e>
                  <td data-v-086fa15e>
                    <div data-v-086fa15e class="body-medium amount plain positive">
                      {{ e.dni }}
                    </div>
                  </td>
                  <td data-v-086fa15e>{{ e.nombres || '-' }}</td>
                  <td data-v-086fa15e>{{ e.email || '-' }}</td>

                  <td data-v-086fa15e>{{ e.rol === 'profesor' ? 'Profesor' : e.rol }}</td>
                  <!-- <td data-v-086fa15e>{{ e.is_superuser ? '✓' : '✗' }}</td> -->
                  <td data-v-086fa15e>{{ e.is_active ? 'Activo' : 'Inactivo' }}</td>
                  <td data-v-086fa15e>{{ registro(e) }}</td>
                  <td data-v-086fa15e>
                    <div data-v-086fa15e class="simple-container justify-right gap-8">
                      <button
                        data-v-086fa15e
                        class="style-7 for-icon small hover-primary-container background outline-text edit-emp-btn"
                        :data-emp-id="e.id"
                        title="Editar docente"
                        @click="openTeacher(e, $event)"
                      >
                        <md-ripple data-v-086fa15e aria-hidden="true"></md-ripple>
                        <md-icon data-v-086fa15e data-shared-item="addIcon" aria-hidden="true">
                          edit
                        </md-icon>
                      </button>
                      <button
                        data-v-086fa15e
                        class="style-7 for-icon small hover-error-container background outline-text delete-emp-btn"
                        :data-emp-id="e.id"
                        title="Desactivar docente"
                        @click="openDeleteTeacher(e, $event)"
                      >
                        <md-ripple data-v-086fa15e aria-hidden="true"></md-ripple>
                        <md-icon data-v-086fa15e data-shared-item="addIcon" aria-hidden="true">
                          delete
                        </md-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="hasData && !loading && !loadError"
            id="empleadosMobile"
            data-v-086fa15e
            class="simple-container direction-column only-on-mobile"
          >
            <article
              v-for="e in paginatedEmpleados"
              :key="e.id"
              class="employee-row"
              role="button"
              tabindex="0"
              @click="openTeacher(e, $event)"
              @keydown.enter.prevent="openTeacher(e, $event)"
              @keydown.space.prevent="openTeacher(e, $event)"
            >
              <div class="employee-avatar member-avatar" aria-hidden="true">
                {{ nameInitials(e.nombres) }}
              </div>

              <div class="employee-details">
                <span class="body-large weight-500 employee-name">
                  {{ e.nombres || e.dni }}
                </span>
                <span class="label-large outline-text employee-cargo">
                  {{ e.rol === 'profesor' ? 'Profesor' : e.rol }}
                </span>
              </div>

              <div class="employee-row-status">
                <span
                  class="employee-status"
                  :class="e.is_active ? 'employee-status-active' : 'employee-status-inactive'"
                >
                  {{ e.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

            </article>
          </div>

          <PaginationControls
            v-if="hasData && !loading && !loadError"
            :page="currentPage"
            :page-size="EMPLOYEE_PAGE_SIZE"
            :total="empleados.length"
            @update:page="setPage"
          />
        </div>
      </div>
    </div>
  </div>

  <ModalSearch
    v-if="search.open.value"
    :origin="search.origin.value"
    scope="empleados"
    @close="search.hide"
  />

  <ModalCreateEmployee
    v-if="createModal.open.value"
    :origin="createModal.origin.value"
    @close="createModal.hide"
  />
  <ModalEditEmployee
    v-if="selectedTeacher"
    :origin="selectedTeacherOrigin"
    :empleado="selectedTeacher"
    @save="refreshTeachers"
    @delete="onTeacherDeleted"
    @close="closeTeacher"
  />
  <ModalDeleteEmployee
    v-if="deletingTeacher"
    :origin="deleteTeacherOrigin"
    :empleado="deletingTeacher"
    @confirm="onTeacherDeleted"
    @close="closeDeleteTeacher"
  />
</template>
