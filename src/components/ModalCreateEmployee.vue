<script setup>
import { nextTick, ref } from 'vue'
import FlipModal from './FlipModal.vue'
import { useStore } from '../stores/data'
import { toast } from 'super-beautiful-toast'
import { apiPost } from '../services/api'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const { addEmpleado } = useStore()
const saving = ref(false)
const saveError = ref('')

const form = ref({
  dni: '',
  first: '',
  last: '',
  email: '',
  password: '',
  superuser: false,
})

async function submit(close, event) {
  if (saving.value) return
  saveError.value = ''
  const body = {
    dni: form.value.dni.trim(),
    nombres: form.value.first.trim(),
    apellidos: form.value.last.trim(),
    correo: form.value.email.trim(),
    password: form.value.password,
  }
  if (!body.dni || !body.nombres || !body.apellidos || !body.correo || body.password.length < 12) {
    saveError.value = 'Completa los datos y usa una contraseña de al menos 12 caracteres.'
    return
  }

  saving.value = true
  try {
    const created = await apiPost('/api/admin/docentes', body)
    addEmpleado({
      ...created,
      nombres: created.nombre_completo || `${created.nombres || ''} ${created.apellidos || ''}`.trim(),
      first_name: created.nombres || body.nombres,
      last_name: created.apellidos || body.apellidos,
      is_active: created.activo !== false,
    })
    toast.success('Docente creado', { icon: null, origin: event?.submitter ?? null })
    await nextTick()
    close()
  } catch (error) {
    saveError.value = error.message || 'No se pudo crear al docente.'
    toast.error(saveError.value, { icon: null, origin: event?.submitter ?? null })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <FlipModal
    :origin="origin"
    content-height="520px"
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
          <span class="display-medium weight-600 line-height-1 text-gradient">Nuevo docente</span>
        </div>
      </div>

      <form
        class="simple-container direction-column gap-16"
        autocomplete="off"
        novalidate
        @submit.prevent="submit(close, $event)"
      >
        <div data-flow-item data-input-label="DNI">
          <input
            v-model="form.dni"
            type="text"
            class="style-2"
            name="emp-dni"
            required
          />
        </div>
        <div class="simple-container gap-8">
          <div data-flow-item data-input-label="Nombres" style="flex: 1">
            <input
              v-model="form.first"
              type="text"
              class="style-2"
              name="emp-first"
            />
          </div>
          <div data-flow-item data-input-label="Apellidos" style="flex: 1">
            <input
              v-model="form.last"
              type="text"
              class="style-2"
              name="emp-last"
            />
          </div>
        </div>
        <div data-flow-item data-input-label="Correo Institucional">
          <input
            v-model="form.email"
            type="email"
            class="style-2"
            name="emp-email"
          />
        </div>
        <div data-flow-item data-input-label="Contraseña">
          <input
            v-model="form.password"
            type="password"
            class="style-2"
            name="emp-password"
            required
            minlength="12"
            maxlength="256"
          />
        </div>
        <div v-if="saveError" class="body-medium error-text" role="alert">
          {{ saveError }}
        </div>
        <!-- <div data-flow-item class="simple-container align-center gap-8" style="padding: 4px 0">
          <label class="switch-label">
            <input
              v-model="form.superuser"
              type="checkbox"
              id="emp-superuser"
              name="emp-superuser"
            />
            <span class="switch-slider"></span>
          </label>
          <label for="emp-superuser" class="body-large">Superadmin (acceso total)</label>
        </div> -->
        <div
          data-v-6c7476fc
          class="container variant-gradient align-right"
          style="gap: 8px; --gradient-overflow: 16px"
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
              :disabled="saving"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <span>{{ saving ? 'Creando…' : 'Crear' }}</span>
            </button>
          </div>
        </div>
      </form>
    </template>
  </FlipModal>
</template>
