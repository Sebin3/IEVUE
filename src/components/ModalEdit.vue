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

const PRIO_EMOJI = { Critica: '🔴', Alta: '🟠', Media: '🟡', Baja: '🟢' }
const ESTADO_EMOJI = { Pendiente: '⏳', 'En Revision': '👀', Finalizado: '✅' }

const finalized = computed(() => props.tramite?.estado === 'Finalizado')

const estado = ref(props.tramite?.estado || 'Pendiente')
const resolucion = ref(props.tramite?.resolucion_admin || '')

const estadoOptions = [
  { value: 'Pendiente', label: `${ESTADO_EMOJI.Pendiente} Pendiente` },
  { value: 'En Revision', label: `${ESTADO_EMOJI['En Revision']} En Revisión` },
  { value: 'Finalizado', label: `${ESTADO_EMOJI.Finalizado} Finalizado` },
]

const prioLabel = computed(
  () => `${PRIO_EMOJI[props.tramite?.prioridad_ia] || '⚪'} ${props.tramite?.prioridad_ia || ''}`,
)

const confirmDelete = useModal()

function save(close) {
  if (props.tramite) {
    updateTramite(props.tramite.id, {
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
      <div class="content-box background outline-with-shadow-light padding-8">
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
        <div class="simple-container direction-column grow-1 padding-16">
          <span class="display-small weight-500">{{ tramite?.tipo_tramite }}</span>
          <span class="body-large">{{ tramite?.nombre_ciudadano }}</span>
          <div class="simple-container gap-8 flex-wrap" style="margin-top: 16px">
            <div class="dataline">
              <span class="body-medium outline-text">{{ prioLabel }}</span>
            </div>
            <div class="dataline">
              <span class="body-medium">
                {{ ESTADO_EMOJI[tramite?.estado] || '⚪' }} {{ tramite?.estado }}
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
          <input type="text" class="style-2" name="prioridad" readonly :value="prioLabel" />
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
