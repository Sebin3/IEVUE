<script setup>
import { nextTick, ref } from 'vue'
import FlipModal from './FlipModal.vue'
import ModalDeleteEmployee from './ModalDeleteEmployee.vue'
import { useModal } from '../composables/useModal'
import { toast } from 'super-beautiful-toast'
import { apiPatch } from '../services/api'

const props = defineProps({
  origin: { type: Object, default: null },
  empleado: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save', 'delete'])

const confirmDelete = useModal()
const saving = ref(false)
const saveError = ref('')

const partes = (props.empleado?.nombres || '').split(' ')

const form = ref({
  dni: props.empleado?.dni || '',
  first: props.empleado?.first_name || partes[0] || '',
  last: props.empleado?.last_name || partes.slice(1).join(' ') || '',
  email: props.empleado?.email || '',
  password: '',
  superuser: !!props.empleado?.is_superuser,
})

async function submit(close, event) {
  if (saving.value || !props.empleado) return
  saveError.value = ''
  if (form.value.password && form.value.password.length < 12) {
    saveError.value = 'La nueva contraseña debe tener al menos 12 caracteres.'
    return
  }
  saving.value = true
  const changes = {
    dni: form.value.dni.trim(),
    nombres: form.value.first.trim(),
    apellidos: form.value.last.trim(),
    correo: form.value.email.trim(),
    ...(form.value.password ? { password: form.value.password } : {}),
  }
  try {
    await apiPatch(`/api/admin/docentes/${encodeURIComponent(props.empleado.id)}`, changes)
    emit('save', { ...props.empleado, ...changes })
    toast.success('Docente actualizado', { icon: null, origin: event?.submitter ?? null })
    await nextTick()
    close()
  } catch (error) {
    saveError.value = error.message || 'No se pudo actualizar al docente.'
    toast.error(saveError.value, { icon: null, origin: event?.submitter ?? null })
  } finally {
    saving.value = false
  }
}

function onDeleted(close, id) {
  emit('delete', id || props.empleado?.id)
  close()
}
</script>

<template>
  <FlipModal :origin="origin" content-height="520px" @close="emit('close')">
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
            class="style-7 for-icon small rounded surface-container outline-text delete-emp-btn"
            @click="confirmDelete.show"
          >
            <md-ripple aria-hidden="true"></md-ripple>
            <md-icon class="filled" aria-hidden="true">delete</md-icon>
          </button>
        </div>
        <div class="simple-container direction-column grow-1 padding-16 text-center">
          <span class="display-medium weight-600 line-height-1 text-gradient">Editar docente</span>
        </div>
      </div>

      <form
        class="simple-container direction-column gap-16"
        autocomplete="off"
        novalidate
        @submit.prevent="submit(close, $event)"
      >
        <div data-flow-item data-input-label="DNI">
          <input v-model="form.dni" type="text" class="style-2" name="emp-dni" required />
        </div>
        <div class="simple-container gap-8">
          <div data-flow-item data-input-label="Nombres" style="flex: 1">
            <input v-model="form.first" type="text" class="style-2" name="emp-first" />
          </div>
          <div data-flow-item data-input-label="Apellidos" style="flex: 1">
            <input v-model="form.last" type="text" class="style-2" name="emp-last" />
          </div>
        </div>
        <div data-flow-item data-input-label="Correo Institucional">
          <input v-model="form.email" type="email" class="style-2" name="emp-email" />
        </div>
        <div data-flow-item data-input-label="Contraseña (dejar vacío para mantener)">
          <input
            v-model="form.password"
            type="password"
            class="style-2"
            name="emp-password"
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
              id="edit-emp-superuser"
              name="emp-superuser"
            />
            <span class="switch-slider"></span>
          </label>
          <label for="edit-emp-superuser" class="body-large">Superadmin (acceso total)</label>
        </div> -->
        <div
          data-v-6c7476fc
          class="container variant-gradient align-right"
          style="gap: 8px; --gradient-overflow: 16px"
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
              class="style-7 primary-container on-primary-container-text flex-1 rounded big"
              :disabled="saving"
            >
              <md-ripple aria-hidden="true"></md-ripple>
              <span>{{ saving ? 'Guardando…' : 'Guardar' }}</span>
            </button>
          </div>
        </div>
      </form>

      <ModalDeleteEmployee
        v-if="confirmDelete.open.value"
        :origin="confirmDelete.origin.value"
        :empleado="empleado"
        @confirm="onDeleted(close, $event)"
        @close="confirmDelete.hide"
      />
    </template>
  </FlipModal>
</template>
