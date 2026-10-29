<script setup>
import { nextTick, ref } from 'vue'
import FlipModal from './FlipModal.vue'
import SelectFlip from './SelectFlip.vue'
import DatePicker from './DatePicker.vue'
import TimePicker from './TimePicker.vue'
import { useStore } from '../stores/data'
import { toast } from 'super-beautiful-toast'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const { state, addTramite } = useStore()

const now = new Date()
const pad = (value) => String(value).padStart(2, '0')
const form = ref({
  dni: '',
  nombres: '',
  apellidos: '',
  salonSeccion: '',
  tipoTramite: '',
  descripcion: '',
  date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
  time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
})

const dniMessage = ref('')

const tipoTramiteOptions = [
  { value: 'Justificación de inasistencia', label: 'Justificación de inasistencia' },
  { value: 'Solicitud de permiso para faltar', label: 'Solicitud de permiso para faltar' },
  {
    value: 'Solicitud de reunión con un profesor',
    label: 'Solicitud de reunión con un profesor',
  },
]

const salonSeccionOptions = ['1A', '1B', '2A', '2B', '3A', '3B', '3C'].map((salon) => ({
  value: salon,
  label: salon,
}))

function clearDniResult() {
  form.value.nombres = ''
  form.value.apellidos = ''
  dniMessage.value = ''
}

function buscarEmpleado() {
  const dni = form.value.dni.trim()
  const empleado = state.empleados.find((item) => item.dni === dni)

  if (!empleado) {
    form.value.nombres = ''
    form.value.apellidos = ''
    dniMessage.value = 'No se encontró un docente con ese DNI.'
    return
  }

  const partes = empleado.nombres.trim().split(/\s+/)
  form.value.nombres = partes.shift() || ''
  form.value.apellidos = partes.join(' ')
  dniMessage.value = ''
}

async function submit(close, event) {
  const dni = form.value.dni.trim()
  const nombres = form.value.nombres.trim()
  const apellidos = form.value.apellidos.trim()
  const nombreCiudadano = `${nombres} ${apellidos}`.trim()
  const salonSeccion = form.value.salonSeccion.trim()
  const tipoTramite = form.value.tipoTramite.trim()
  const descripcion = form.value.descripcion.trim()

  if (dni && nombres && apellidos && salonSeccion && tipoTramite && descripcion) {
    addTramite({
      dni,
      nombre_ciudadano: nombreCiudadano,
      salon_seccion: salonSeccion,
      tipo_tramite: tipoTramite,
      descripcion_asunto: descripcion,
      prioridad_ia: 'Media',
      estado: 'Pendiente',
    })
    toast.success('Trámite creado', { icon: null, origin: event?.submitter ?? null })
    await nextTick()
    close()
  }
}
</script>

<template>
  <FlipModal
    :origin="origin"
    content-height="693px"
    close-strategy="container-only"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <div class="content-box background padding-8 text-center">
        <div class="simple-container justify-between">
          <button
            class="style-7 for-icon small rounded surface-container outline-text close-modal-btn"
            @click="close()"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon class="filled" aria-hidden="true">close</md-icon>
          </button>
        </div>
        <div class="simple-container direction-column grow-1 padding-16">
          <span class="display-medium weight-600 line-height-1 text-gradient">Crear trámite</span>
        </div>
      </div>

      <form
        class="simple-container direction-column gap-16"
        autocomplete="off"
        novalidate
        @submit.prevent="submit(close, $event)"
      >
        <div data-flow-item data-input-label="DNI">
          <div class="dni-search-row">
            <input
              v-model="form.dni"
              type="text"
              class="style-2"
              name="dni"
              inputmode="numeric"
              autocomplete="off"
              required
              @input="clearDniResult"
              @keyup.enter.prevent="buscarEmpleado"
            />
            <button
              type="button"
              class="style-7 for-icon small background outline-light-1 outline-text"
              aria-label="Buscar docente por DNI"
              title="Buscar docente por DNI"
              @click="buscarEmpleado"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon aria-hidden="true">search</md-icon>
            </button>
          </div>
          <span v-if="dniMessage" class="label-small error-text dni-message" role="status">
            {{ dniMessage }}
          </span>
        </div>

        <div class="simple-container gap-8">
          <div data-flow-item data-input-label="Nombres" style="flex: 1">
            <input
              v-model="form.nombres"
              type="text"
              class="style-2"
              name="nombres"
              readonly
              required
            />
          </div>
          <div data-flow-item data-input-label="Apellidos" style="flex: 1">
            <input
              v-model="form.apellidos"
              type="text"
              class="style-2"
              name="apellidos"
              readonly
              required
            />
          </div>
        </div>

        <div data-flow-item data-input-label="Salón y sección">
          <div class="asyncstate-data">
            <SelectFlip
              v-model="form.salonSeccion"
              name="salon-seccion"
              placeholder="Selecciona un salón"
              :options="salonSeccionOptions"
              :option-height="52"
            />
          </div>
        </div>

        <div data-flow-item data-input-label="Tipo de trámite">
          <div class="asyncstate-data">
            <SelectFlip
              v-model="form.tipoTramite"
              name="tipo-tramite"
              placeholder="Selecciona un tipo de trámite"
              :options="tipoTramiteOptions"
              :option-height="52"
            />
          </div>
        </div>

        <div data-flow-item data-input-label="Descripción">
          <textarea
            v-model="form.descripcion"
            class="style-2"
            name="descripcion"
            rows="3"
            required
          ></textarea>
        </div>

        <div class="simple-container gap-8 date-time-fields">
          <div data-flow-item data-input-label="Fecha de registro" class="date-time-field">
            <DatePicker v-model="form.date" />
          </div>
          <div data-flow-item data-input-label="Hora de registro" class="date-time-field">
            <TimePicker v-model="form.time" />
          </div>
        </div>

        <div data-flow-item>
          <div data-v-7e220d7e class="simple-container direction-column gap-8">
            <button
              data-v-7e220d7e
              type="button"
              class="style-7 for-icon small background outline-light-1 outline-text"
            >
              <md-ripple data-v-7e220d7e aria-hidden="true"></md-ripple>
              <md-icon data-v-7e220d7e aria-hidden="true">add</md-icon>
              <span data-v-7e220d7e>Agregar campo</span>
            </button>
          </div>
        </div>

        <div
          data-v-6c7476fc
          class="container variant-gradient align-right"
          style="--buttons-container-gap: 0px; gap: 8px; --gradient-overflow: 16px"
        >
          <div data-v-6c7476fc class="gradient-row" style="gap: 8px">
            <button
              type="button"
              class="style-7 for-icon surface-container outline-text flex-1 rounded big close-modal-btn"
              @click="close()"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <md-icon aria-hidden="true">close</md-icon>
            </button>
            <button
              type="submit"
              class="style-7 primary-container on-primary-container-text flex-1 rounded big"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <span>Crear</span>
            </button>
          </div>
        </div>
      </form>
    </template>
  </FlipModal>
</template>
