<script setup>

import { computed } from 'vue'
import { useStore } from '../stores/data'
import { useModal } from '../composables/useModal'
import ModalCreateEmployee from '../components/ModalCreateEmployee.vue'
import ModalEditEmployee from '../components/ModalEditEmployee.vue'
import ModalDeleteEmployee from '../components/ModalDeleteEmployee.vue'
import ModalSearch from '../components/ModalSearch.vue'

const { filteredEmpleados } = useStore()

const create = useModal()
const edit = useModal()
const remove = useModal()
const search = useModal()

const empleados = filteredEmpleados
const hasData = computed(() => empleados.value.length > 0)

const kpiTotal = computed(() => empleados.value.length)
const kpiAsignados = computed(
  () => empleados.value.filter((e) => e.municipalidad_id != null).length,
)
const kpiNoAsignados = computed(
  () => empleados.value.filter((e) => e.municipalidad_id == null).length,
)
const kpiSuper = computed(() => empleados.value.filter((e) => e.is_superuser).length)

function registro(e) {
  return new Date(e.fecha_registro).toLocaleDateString('es-PE')
}
</script>

<template>
  <div class="app-view">
    <div class="simple-container direction-column gap-24 grow-1">
      <div class="app-header">
        <span class="display-medium weight-500 text-gradient">Empleados</span>
        <div class="simple-container only-on-mobile">
          <button
            class="style-7 for-icon bigger rounded background outline-text"
            @click="create.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon data-shared-item="addIcon" aria-hidden="true">more_vert</md-icon>
          </button>
        </div>
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
              <span class="body-large outline-text line-height-1">Total</span>
              <span id="empKpiTotal" class="headline-small weight-500">{{ kpiTotal }}</span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Asignados</span>
              <span id="empKpiAsignados" class="headline-small weight-500">{{ kpiAsignados }}</span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">No asignados</span>
              <span id="empKpiNoAsignados" class="headline-small weight-500">
                {{ kpiNoAsignados }}
              </span>
            </div>
            <div class="content-box width-auto basis-small grow-1 gap-0 light-color gap-4">
              <span class="body-large outline-text line-height-1">Superadmins</span>
              <span id="empKpiSuper" class="headline-small weight-500">{{ kpiSuper }}</span>
            </div>
          </div>
        </div>
      </div>

      <div data-v-086fa15e class="simple-container direction-column grow-1">
        <div data-v-086fa15e class="asyncstate-data">
          <div v-if="!hasData" id="emptyStateEmp" class="simple-container grow-1">
            <div class="content-box light-color grow-1 align-center justify-center padding-24">
              <md-icon class="pretty-minimal outline-text" aria-hidden="true">badge</md-icon>
              <span class="headline-small weight-500 outline-text">
                No se encontraron empleados
              </span>
            </div>
          </div>

          <div
            v-if="hasData"
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
                    Usuario
                  </th>
                  <th data-v-086fa15e>
                    <md-icon data-v-086fa15e class="dynamic filled" aria-hidden="true">
                      badge
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
                    Municipalidad
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
                <tr v-for="e in empleados" :key="e.id" data-v-086fa15e>
                  <td data-v-086fa15e>
                    <strong>{{ e.username }}</strong>
                  </td>
                  <td data-v-086fa15e>{{ e.nombres || '-' }}</td>
                  <td data-v-086fa15e>{{ e.email || '-' }}</td>

                  <td data-v-086fa15e>{{ e.municipalidad_nombre || 'Todas' }}</td>
                  <!-- <td data-v-086fa15e>{{ e.is_superuser ? '✓' : '✗' }}</td> -->
                  <td data-v-086fa15e>{{ e.is_active ? 'Activo' : 'Inactivo' }}</td>
                  <td data-v-086fa15e>{{ registro(e) }}</td>
                  <td data-v-086fa15e>
                    <div data-v-086fa15e class="simple-container justify-right gap-8">
                      <button
                        data-v-086fa15e
                        class="style-7 for-icon small hover-primary-container background outline-text edit-emp-btn"
                        :data-emp-id="e.id"
                        @click="edit.show($event, e)"
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
                        @click="remove.show($event, e)"
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
        </div>
      </div>
    </div>
  </div>

  <ModalCreateEmployee
    v-if="create.open.value"
    :origin="create.origin.value"
    @close="create.hide"
  />
  <ModalEditEmployee
    v-if="edit.open.value"
    :origin="edit.origin.value"
    :empleado="edit.payload.value"
    @close="edit.hide"
  />
  <ModalDeleteEmployee
    v-if="remove.open.value"
    :origin="remove.origin.value"
    :empleado="remove.payload.value"
    @close="remove.hide"
  />
  <ModalSearch
    v-if="search.open.value"
    :origin="search.origin.value"
    scope="empleados"
    @close="search.hide"
  />
</template>
