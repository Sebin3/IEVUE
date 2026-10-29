<script setup>

import { computed } from 'vue'
import { useStore } from '../stores/data'
import { useModal } from '../composables/useModal'
import ModalCreate from '../components/ModalCreate.vue'
import ModalEdit from '../components/ModalEdit.vue'
import ModalSearch from '../components/ModalSearch.vue'
import ModalFilters from '../components/ModalFilters.vue'
import ModalExport from '../components/ModalExport.vue'
import MobileActionMenu from '../components/MobileActionMenu.vue'

const { filteredTramites } = useStore()

const create = useModal()
const edit = useModal()
const search = useModal()
const filters = useModal()
const exportModal = useModal()

// Lista ya filtrada por el modal de filtros / buscador (store).
const tramites = filteredTramites
const hasData = computed(() => tramites.value.length > 0)

const kpiTotal = computed(() => tramites.value.length)
const kpiPendientes = computed(
  () => tramites.value.filter((t) => t.estado === 'Pendiente').length,
)
const kpiCompletados = computed(
  () => tramites.value.filter((t) => t.estado === 'Finalizado').length,
)
const kpiRechazados = computed(
  () => tramites.value.filter((t) => t.estado === 'Rechazado').length,
)

const priorityClasses = {
  Critica: 'priority-critical',
  Alta: 'priority-high',
  Media: 'priority-medium',
  Baja: 'priority-low',
}

const statusClasses = {
  Pendiente: 'status-pending',
  'En Revision': 'status-review',
  Finalizado: 'status-completed',
  Rechazado: 'status-rejected',
}

const mobileActions = [
  { id: 'create', label: 'Crear trámite', icon: 'add' },
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

function fecha(t) {
  return new Date(t.fecha_creacion).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  })
}

function hora(t) {
  return new Date(t.fecha_creacion).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Mobile: agrupado por fecha, con divisor por grupo.
const grupos = computed(() => {
  const map = new Map()
  for (const t of tramites.value) {
    const key = fecha(t)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(t)
  }
  return [...map.entries()].map(([date, items]) => ({ date, items }))
})
</script>

<template>
  <div class="app-view">
    <div class="simple-container direction-column gap-24 grow-1">
      <div class="app-header">
        <h1 class="display-medium weight-500 text-gradient">Trámites</h1>
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
          <div class="simple-container gap-8 flex-wrap">
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Tramites</span>
              <span class="headline-small weight-500">{{ kpiTotal }}</span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Pendientes</span>
              <span class="headline-small weight-500">{{ kpiPendientes }}</span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Completados</span>
              <span class="headline-small weight-500">{{ kpiCompletados }}</span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Rechazados</span>
              <span class="headline-small weight-500">{{ kpiRechazados }}</span>
            </div>
          </div>
        </div>
      </div>

      <div data-v-086fa15e class="simple-container direction-column grow-1">
        <div data-v-086fa15e class="asyncstate-data">
          <!-- Estado vacío -->
          <div v-if="!hasData" id="emptyState" class="simple-container grow-1">
            <div class="content-box light-color grow-1 align-center justify-center padding-24">
              <md-icon class="pretty-minimal outline-text" aria-hidden="true">
                border_clear
              </md-icon>
              <span class="headline-small weight-500 outline-text">
                No se encontraron trámites
              </span>
            </div>
          </div>

          <!-- Vista Desktop - Tabla -->
          <div
            v-if="hasData"
            id="movementsTable"
            data-v-086fa15e
            class="simple-container direction-column hide-on-mobile"
          >
            <table data-v-086fa15e class="style-1">
              <thead data-v-086fa15e>
                <tr data-v-086fa15e>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      calendar_month
                    </md-icon>
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      schedule
                    </md-icon>
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      badge
                    </md-icon>
                    DNI
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      person
                    </md-icon>
                    Nombre y Apellido
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      description
                    </md-icon>
                    Tipo de tramite
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      meeting_room
                    </md-icon>
                    Salón y sección
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      priority_high
                    </md-icon>
                    Prioridad
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      flag
                    </md-icon>
                    Estado
                  </th>
                  <th data-v-086fa15e></th>
                </tr>
              </thead>
              <tbody data-v-086fa15e id="movementsTableBody">
                <tr v-for="t in tramites" :key="t.id" data-v-086fa15e>
                  <td data-v-086fa15e class="column-date">{{ fecha(t) }}</td>
                  <td data-v-086fa15e class="column-time">{{ hora(t) }}</td>
                  <td data-v-086fa15e class="column-amount">
                    <div data-v-086fa15e class="simple-container align-center gap-4">
                      <div
                        data-v-086fa15e
                        class="body-medium amount plain positive"
                        data-shared-item="id"
                      >
                        {{ t.dni }}
                      </div>
                    </div>
                  </td>
                  <td data-v-086fa15e class="column-description">{{ t.nombre_ciudadano }}</td>
                  <td data-v-086fa15e class="column-monto">{{ t.tipo_tramite }}</td>
                  <td data-v-086fa15e class="column-account">
                    {{ t.salon_seccion || 'Sin asignar' }}
                  </td>
                  <td data-v-086fa15e class="column-category">
                    <div
                      data-v-086fa15e
                      class="chip"
                      :class="priorityClasses[t.prioridad_ia]"
                    >
                      <span data-v-086fa15e class="chip-name" data-shared-item="name">{{
                        t.prioridad_ia
                      }}</span>
                    </div>
                  </td>
                  <td data-v-086fa15e class="column-account">
                    <div data-v-086fa15e class="chip" :class="statusClasses[t.estado]">
                      <span data-v-086fa15e class="chip-name" data-shared-item="name">{{
                        t.estado
                      }}</span>
                    </div>
                  </td>
                  <td data-v-086fa15e>
                    <div data-v-086fa15e class="simple-container justify-right gap-8">
                      <button
                        data-v-086fa15e
                        class="style-7 for-icon small hover-primary-container background outline-text edit-btn"
                        :data-tramite-id="t.id"
                        @click="edit.show($event, t)"
                      >
                        <md-ripple data-v-086fa15e aria-hidden="true"></md-ripple>
                        <md-icon data-v-086fa15e data-shared-item="addIcon" aria-hidden="true">
                          edit
                        </md-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Vista Mobile -->
          <div
            v-if="hasData"
            id="movementsMobile"
            data-v-33d24f89
            class="simple-container direction-column only-on-mobile"
          >
            <div
              id="movementsMobileContainer"
              data-v-33d24f89
              class="simple-container direction-column gap-24"
            >
              <div
                v-for="g in grupos"
                :key="g.date"
                data-v-33d24f89
                class="simple-container direction-column gap-8"
              >
                <div data-v-33d24f89 class="date-divider l-padding-16 label-large outline-text">
                  {{ g.date }}
                </div>
                <div
                  v-for="t in g.items"
                  :key="t.id"
                  data-v-33d24f89
                  class="movement-row"
                  @click="edit.show($event, t)"
                >
                  <div
                    data-v-33d24f89
                    class="priority-label"
                    :class="priorityClasses[t.prioridad_ia]"
                    :aria-label="`Prioridad ${t.prioridad_ia}`"
                    :title="`Prioridad ${t.prioridad_ia}`"
                    data-shared-item="priority"
                  >
                    <md-icon aria-hidden="true">assignment</md-icon>
                  </div>
                  <div data-v-33d24f89 class="description-container">
                    <div data-v-33d24f89 class="description-text" data-shared-item="description">
                      <span data-v-33d24f89 class="body-large weight-500 line-height-1">
                        {{ t.nombre_ciudadano }}
                      </span>
                      <span data-v-33d24f89 class="label-large outline-text line-height-1">
                        {{ t.tipo_tramite }}
                      </span>
                    </div>
                  </div>
                  <div
                    data-v-79050b20
                    data-v-33d24f89
                    class="amount plain chip"
                    :class="[
                      statusClasses[t.estado],
                      t.estado === 'Finalizado' ? 'positive' : 'negative',
                    ]"
                    data-shared-item="amount"
                  >
                    {{ t.estado }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalCreate
    v-if="create.open.value"
    :origin="create.origin.value"
    @close="create.hide"
  />
  <ModalEdit
    v-if="edit.open.value"
    :origin="edit.origin.value"
    :tramite="edit.payload.value"
    @close="edit.hide"
  />
  <ModalSearch v-if="search.open.value" :origin="search.origin.value" @close="search.hide" />
  <ModalFilters v-if="filters.open.value" :origin="filters.origin.value" @close="filters.hide" />
  <ModalExport
    v-if="exportModal.open.value"
    :origin="exportModal.origin.value"
    @close="exportModal.hide"
  />
</template>
