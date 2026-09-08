<script setup>
/**
 * MODAL: Crear movimiento — index.html createModal() (1798-1895).
 * Markup 1:1. En index.html el form no persiste nada; aqui el submit crea un
 * tramite en el store mock para que las tablas reaccionen.
 */
import { ref } from 'vue'
import FlipModal from './FlipModal.vue'
import SelectFlip from './SelectFlip.vue'
import { useStore } from '../stores/data'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const { addTramite } = useStore()

const now = new Date()
const form = ref({
  description: '',
  amount: '',
  category: '',
  account: '',
  date: now.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: '2-digit' }),
  time: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
})

const categorias = [
  { value: '', label: 'Sin categoría' },
  { value: '1', label: '🍔 Alimentos' },
  { value: '2', label: '🏠 Hogar' },
]

const cuentas = [
  { value: '', label: 'Sin cuenta' },
  { value: '1', label: '🏦 Banco' },
  { value: '2', label: '💵 Efectivo' },
  { value: '3', label: '💳 Visa' },
]

function submit(close) {
  const description = form.value.description.trim()
  if (description) {
    addTramite({
      tipo_tramite: description,
      descripcion_asunto: description,
      prioridad_ia: 'Media',
      estado: 'Pendiente',
    })
  }
  close()
}
</script>

<template>
  <FlipModal :origin="origin" content-height="693px" @close="emit('close')">
    <template #default="{ close }">
      <div class="content-box background outline-with-shadow-light padding-8">
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
          <span class="display-medium weight-600 line-height-1">Crear movimiento</span>
        </div>
      </div>

      <form
        class="simple-container direction-column gap-16"
        autocomplete="off"
        novalidate
        @submit.prevent="submit(close)"
      >
        <div data-flow-item data-input-label="Descripción">
          <input v-model="form.description" type="text" class="style-2" name="description" required />
        </div>

        <div data-flow-item data-input-label="Monto">
          <input
            v-model="form.amount"
            type="number"
            class="style-2"
            name="amount"
            required
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div data-flow-item data-input-label="Categoría">
          <div class="asyncstate-data">
            <SelectFlip
              v-model="form.category"
              name="category"
              :options="categorias"
              :option-height="48"
            />
          </div>
        </div>

        <div data-flow-item data-input-label="Cuenta">
          <div class="asyncstate-data">
            <SelectFlip
              v-model="form.account"
              name="account"
              :options="cuentas"
              :option-height="48"
            />
          </div>
        </div>

        <div class="simple-container gap-8">
          <div data-flow-item>
            <div data-v-35811748 class="container">
              <input
                v-model="form.date"
                data-v-35811748
                type="text"
                placeholder="Selecciona una fecha"
                readonly
                name="date"
                required
                class="style-2"
              />
              <svg
                data-v-35811748
                xmlns="http://www.w3.org/2000/svg"
                height="14px"
                width="14px"
                viewBox="0 -960 960 960"
                fill="var(--md-sys-color-outline)"
              >
                <path
                  d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-40q0-17 11.5-28.5T280-880q17 0 28.5 11.5T320-840v40h320v-40q0-17 11.5-28.5T680-880q17 0 28.5 11.5T720-840v40h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"
                ></path>
              </svg>
            </div>
          </div>
          <div data-flow-item>
            <div data-v-2bfd582d class="container">
              <input
                v-model="form.time"
                data-v-2bfd582d
                type="text"
                placeholder="Selecciona una hora"
                readonly
                name="time"
                required
                class="style-2"
              />
              <svg
                data-v-2bfd582d
                xmlns="http://www.w3.org/2000/svg"
                height="14px"
                width="14px"
                viewBox="0 -960 960 960"
                fill="var(--md-sys-color-outline)"
              >
                <path
                  d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Zm112-192L440-504v-216h80v184l128 128-56 56Z"
                ></path>
              </svg>
            </div>
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
