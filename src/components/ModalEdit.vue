<script setup>
import { ref, computed } from 'vue'
import FlipModal from './FlipModal.vue'
import SelectFlip from './SelectFlip.vue'
import ModalDelete from './ModalDelete.vue'
import { useModal } from '../composables/useModal'
import { useStore } from '../stores/data'

const props = defineProps({
  origin: { type: Object, default: null },
  tramite: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const { updateTramite, deleteTramite } = useStore()

const finalized = computed(() => props.tramite?.estado === 'Finalizado')

const estado = ref(props.tramite?.estado || 'Pendiente')
const prioridad = ref(props.tramite?.prioridad_ia || 'Media')
const resolucion = ref(props.tramite?.resolucion_admin || '')

const prioridadOptions = [
  { value: 'Critica', label: 'Crítica' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Media', label: 'Media' },
  { value: 'Baja', label: 'Baja' },
]

const estadoOptions = [
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'En Revision', label: 'En Revisión' },
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'Rechazado', label: 'Rechazado' },
]

const prioLabel = computed(() => {
  const option = prioridadOptions.find((item) => item.value === prioridad.value)
  return option?.label || prioridad.value
})

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

const confirmDelete = useModal()

function save(close) {
  if (props.tramite) {
    updateTramite(props.tramite.id, {
      prioridad_ia: prioridad.value,
      estado: estado.value,
      resolucion_admin: resolucion.value.trim(),
    })
  }
  close()
}

function onDeleted(close) {
  if (props.tramite) deleteTramite(props.tramite.id)
  close()
}
</script>

<template>
  <FlipModal :origin="origin" content-height="693px" @close="emit('close')">
    <template #default="{ close }">
      <div class="content-box background padding-8">
        <div class="simple-container justify-between">
          <button
            class="style-7 for-icon small rounded surface-container outline-text close-edit-modal-btn"
            @click="close()"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon class="filled" aria-hidden="true">close</md-icon>
          </button>
          <button
            class="style-7 for-icon small rounded surface-container outline-text delete-movement-btn"
            @click="confirmDelete.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon class="filled" aria-hidden="true">delete</md-icon>
          </button>
        </div>
        <div class="simple-container direction-column grow-1 padding-16 text-center gap-8">
          <span class="text-gradient display-small weight-500">{{ tramite?.tipo_tramite }}</span>
          <span class="body-large">{{ tramite?.nombre_ciudadano }}</span>
          <div class="simple-container gap-8 flex-wrap" style="margin-top: 16px">
            <div class="dataline" :class="priorityClasses[prioridad]">
              <span class="body-medium outline-text">{{ prioLabel }}</span>
            </div>
            <div class="dataline" :class="statusClasses[tramite?.estado]">
              <span class="body-medium">
                {{ tramite?.estado }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form
        class="simple-container direction-column gap-16"
        autocomplete="off"
        novalidate
        @submit.prevent="save(close)"
      >
        <div data-flow-item data-input-label="Tipo de Trámite">
          <input
            type="text"
            class="style-2"
            name="tipo"
            readonly
            :value="tramite?.tipo_tramite"
          />
        </div>

        <div data-flow-item data-input-label="Salón y sección">
          <input
            type="text"
            class="style-2"
            name="salon-seccion"
            readonly
            :value="tramite?.salon_seccion || ''"
          />
        </div>

        <div data-flow-item data-input-label="Descripción">
          <textarea
            class="style-2"
            name="descripcion"
            readonly
            rows="3"
            :value="tramite?.descripcion_asunto || ''"
          ></textarea>
        </div>

        <div data-flow-item data-input-label="Prioridad">
          <div class="asyncstate-data">
            <SelectFlip
              v-model="prioridad"
              name="prioridad"
              placeholder="Selecciona una prioridad"
              :options="prioridadOptions"
            />
          </div>
        </div>

        <div data-flow-item data-input-label="Estado">
          <div class="asyncstate-data">
            <SelectFlip
              v-model="estado"
              name="estado"
              placeholder="Selecciona un estado"
              :options="estadoOptions"
              :disabled="finalized"
            />
          </div>
        </div>

        <div data-flow-item data-input-label="Resolución">
          <textarea
            v-model="resolucion"
            class="style-2"
            name="resolucion"
            rows="3"
            :placeholder="finalized ? '' : 'Escribe la resolución o comentarios...'"
            :readonly="finalized"
          ></textarea>
        </div>

        <div
          v-if="!finalized"
          data-v-6c7476fc
          class="container variant-gradient align-right"
          style="--buttons-container-gap: 0px; gap: 8px; --gradient-overflow: 16px"
        >
          <div data-v-6c7476fc class="gradient-row" style="gap: 8px">
            <button
              type="button"
              class="style-7 for-icon surface-container outline-text flex-1 rounded big close-edit-modal-btn"
              @click="close()"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon aria-hidden="true">close</md-icon>
            </button>
            <button
              type="submit"
              class="style-7 primary-container on-primary-container-text flex-1 rounded big save-tramite-btn"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </form>

      <ModalDelete
        v-if="confirmDelete.open.value"
        :origin="confirmDelete.origin.value"
        @confirm="onDeleted(close)"
        @close="confirmDelete.hide"
      />
    </template>
  </FlipModal>
</template>
