<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import FlipModal from './FlipModal.vue'
import SelectFlip from './SelectFlip.vue'
import { useModal } from '../composables/useModal'
import { apiDelete, apiGet, apiGetEnvelope, apiPatch, apiPost } from '../services/api'
import { toast } from 'super-beautiful-toast'

const props = defineProps({ session: { type: Object, required: true } })
const permissions = computed(() => new Set(props.session.permissions || []))
const isAdministrator = computed(() => props.session.is_administrator === true)
const canView = computed(() => isAdministrator.value || permissions.value.has('members.view'))
const canAssign = computed(() => isAdministrator.value || permissions.value.has('members.assign_role') || permissions.value.has('members.update'))
const canCreate = computed(() => isAdministrator.value)
const canRemove = computed(() => isAdministrator.value)

const members = ref([])
const roles = ref([])
const total = ref(0)
const page = ref(0)
const pageSize = 20
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const editorError = ref('')
const editor = ref(null)
const accountOptions = ref([])
const accountLoading = ref(false)
const selectedAccount = ref('')
const selectedRole = ref('')
const editingMember = ref(null)
const memberEditor = useModal()
const removeConfirmation = useModal()
const removing = ref(false)

const activeRoles = computed(() => roles.value.filter((role) => role.active))
const assignableRoles = computed(() => activeRoles.value.filter((role) => {
  if (isAdministrator.value) return true
  return role.role_key !== 'web_administrator' && (role.permissions || []).every((permission) => permissions.value.has(permission))
}))
const accountSelectOptions = computed(() => accountOptions.value.map((account) => ({
  value: account.id,
  label: `${account.nombre_completo || account.email} · ${account.email}`,
  group: account.app_role || 'Cuenta',
})))
const roleSelectOptions = computed(() => assignableRoles.value.map((role) => ({ value: role.id, label: role.name })))
function isAdministratorMember(member) {
  return member?.role?.key === 'web_administrator'
    || member?.role?.name?.trim().toLocaleLowerCase('es-PE') === 'administrador'
}

function canEditMemberRole(member) {
  return canAssign.value && assignableRoles.value.length > 0 && !isAdministratorMember(member)
}

function canRemoveMember(member) {
  return canRemove.value && member.active && !isAdministratorMember(member)
}
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const rangeStart = computed(() => total.value ? page.value * pageSize + 1 : 0)
const rangeEnd = computed(() => Math.min((page.value + 1) * pageSize, total.value))

function memberInitials(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  return words.length
    ? words.slice(0, 2).map((word) => Array.from(word)[0].toLocaleUpperCase('es-PE')).join('')
    : '?'
}

let abortController

async function loadPage(nextPage = page.value) {
  if (!canView.value) return
  abortController?.abort()
  const controller = new AbortController()
  abortController = controller
  loading.value = true
  error.value = ''
  try {
    const [memberResult, roleResult] = await Promise.allSettled([
      apiGetEnvelope(`/api/web/members?limit=${pageSize}&offset=${nextPage * pageSize}`, { signal: controller.signal }),
      apiGet('/api/web/roles', { signal: controller.signal }),
    ])
    if (memberResult.status === 'rejected') throw memberResult.reason
    const memberResponse = memberResult.value
    const nextTotal = Number(memberResponse.total) || 0
    const safePage = Math.min(nextPage, Math.max(0, Math.ceil(nextTotal / pageSize) - 1))
    if (safePage !== nextPage) {
      page.value = safePage
      await loadPage(safePage)
      return
    }
    members.value = Array.isArray(memberResponse.data) ? memberResponse.data : []
    total.value = nextTotal
    roles.value = roleResult.status === 'fulfilled' && Array.isArray(roleResult.value) ? roleResult.value : []
    page.value = Math.min(nextPage, Math.max(0, pageCount.value - 1))
  } catch (loadFailure) {
    if (loadFailure.name !== 'AbortError') error.value = loadFailure.message || 'No se pudieron cargar los miembros.'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

async function loadAccountOptions() {
  if (!canCreate.value || accountOptions.value.length || accountLoading.value) return
  accountLoading.value = true
  editorError.value = ''
  try {
    const response = await apiGetEnvelope('/api/web/members/eligible-accounts?limit=100&offset=0')
    accountOptions.value = Array.isArray(response.data) ? response.data : []
  } catch (loadFailure) {
    editorError.value = loadFailure.message || 'No se pudieron cargar las cuentas elegibles.'
  } finally {
    accountLoading.value = false
  }
}

async function openCreate(event) {
  memberEditor.show(event)
  editor.value = 'create'
  editingMember.value = null
  selectedAccount.value = ''
  selectedRole.value = ''
  editorError.value = ''
  await loadAccountOptions()
}

function openEdit(event, member) {
  memberEditor.show(event)
  editor.value = 'edit'
  editingMember.value = member
  selectedAccount.value = ''
  selectedRole.value = member.role?.id || ''
  editorError.value = ''
}

function closeEditor() {
  memberEditor.hide()
  editor.value = null
  editingMember.value = null
  editorError.value = ''
}

async function saveMember(close) {
  if (saving.value) return
  editorError.value = ''
  if (!selectedRole.value) {
    editorError.value = 'Selecciona un rol para continuar.'
    return
  }
  if (editor.value === 'create' && !selectedAccount.value) {
    editorError.value = 'Selecciona una cuenta elegible.'
    return
  }

  saving.value = true
  const wasCreating = editor.value === 'create'
  try {
    if (wasCreating) {
      await apiPost('/api/web/members', { usuario_id: selectedAccount.value, role_id: selectedRole.value })
      toast.success('Miembro agregado', { icon: null })
    } else if (editingMember.value?.role?.id !== selectedRole.value) {
      await apiPatch(`/api/web/members/${encodeURIComponent(editingMember.value.id)}`, { role_id: selectedRole.value })
      toast.success('Rol del miembro actualizado', { icon: null })
    }
    close()
    accountOptions.value = []
    await loadPage(wasCreating ? 0 : page.value)
  } catch (saveFailure) {
    editorError.value = saveFailure.message || 'No se pudo guardar el miembro.'
    toast.error(editorError.value, { icon: null })
  } finally {
    saving.value = false
  }
}

async function removeMember(close) {
  if (removing.value || !removeConfirmation.payload.value) return
  const target = removeConfirmation.payload.value
  removing.value = true
  try {
    await apiDelete(`/api/web/members/${encodeURIComponent(target.id)}`)
    toast.success('Miembro retirado del equipo web', { icon: null })
    await loadPage(page.value)
    close()
  } catch (removeFailure) {
    toast.error(removeFailure.message || 'No se pudo retirar el miembro.', { icon: null })
  } finally {
    removing.value = false
  }
}

onMounted(() => loadPage(0))
onBeforeUnmount(() => abortController?.abort())
</script>

<template>
  <div class="settings-management-panel" role="region" aria-label="Miembros">
    <header class="settings-management-header">
      <div class="simple-container direction-column gap-4">
        <span class="title-large weight-500">Miembros</span>
        <span class="body-medium outline-text">Administra quién tiene acceso al panel web y el rol asignado.</span>
      </div>
      <button
        v-if="canCreate"
        type="button"
        class="style-7 for-icon bigger rounded primary-container on-primary-container-text"
        aria-label="Agregar miembro"
        title="Agregar miembro"
        @click="openCreate($event)"
      >
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon aria-hidden="true">person_add</md-icon>
      </button>
    </header>

    <div v-if="!canView" class="settings-management-empty content-box background outline-light-1 border-radius-32 padding-24">
      <md-icon aria-hidden="true">lock</md-icon>
      <span class="body-large">Tu rol no tiene permiso para ver los miembros.</span>
    </div>

    <template v-else>
      <div v-if="error" class="settings-management-empty content-box background outline-light-1 border-radius-32 padding-24" role="alert">
        <md-icon aria-hidden="true">error</md-icon><span class="body-large">{{ error }}</span>
      </div>
      <div v-else-if="loading" class="settings-members-list" aria-label="Cargando miembros" aria-busy="true">
        <div v-for="index in 5" :key="index" class="settings-member-card settings-skeleton-card animation-loading-1"></div>
      </div>
      <div v-else-if="members.length" class="settings-members-list">
        <article v-for="member in members" :key="member.id" class="settings-member-card content-box background outline-light-1 border-radius-32 padding-16 text-left">
          <div class="member-avatar settings-member-avatar only-on-mobile" aria-hidden="true">
            {{ memberInitials(member.nombre_completo || member.email) }}
          </div>
          <div class="settings-member-copy">
            <span class="body-large weight-500">{{ member.nombre_completo || 'Miembro' }}</span>
            <span class="body-medium outline-text">{{ member.email }}</span>
          </div>
          <div class="settings-member-meta">
            <span class="settings-role-chip body-medium">{{ member.role?.name || 'Sin rol' }}</span>
            <span class="body-small outline-text">{{ member.pending_activation ? 'Pendiente' : member.active ? 'Activo' : 'Inactivo' }}</span>
          </div>
          <div v-if="canEditMemberRole(member) || canRemoveMember(member)" class="simple-container gap-4">
            <button
              v-if="canEditMemberRole(member)"
              type="button"
              class="style-7 for-icon small rounded surface-container-low outline-text"
              :aria-label="`Cambiar rol de ${member.nombre_completo || member.email}`"
              title="Cambiar rol"
              @click="openEdit($event, member)"
            >
              <md-ripple aria-hidden="true"></md-ripple><md-icon aria-hidden="true">edit</md-icon>
            </button>
            <button
              v-if="canRemoveMember(member)"
              type="button"
              class="style-7 for-icon small rounded surface-container-low outline-text hover-delete"
              :aria-label="`Retirar a ${member.nombre_completo || member.email}`"
              title="Retirar miembro"
              @click="removeConfirmation.show($event, member)"
            >
              <md-ripple aria-hidden="true"></md-ripple><md-icon aria-hidden="true">person_remove</md-icon>
            </button>
          </div>
        </article>
      </div>
      <div v-else-if="!editor" class="settings-management-empty content-box background outline-light-1 border-radius-32 padding-24">
        <md-icon aria-hidden="true">group_off</md-icon><span class="body-large">No hay miembros registrados.</span>
      </div>

      <footer v-if="total > pageSize && !editor" class="settings-management-pagination">
        <span class="body-medium outline-text">Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ total }}</span>
        <div class="simple-container align-center gap-8">
          <button type="button" class="style-7 for-icon small rounded surface-container-low outline-text" aria-label="Página anterior" :disabled="page === 0 || loading" @click="loadPage(page - 1)">
            <md-ripple aria-hidden="true"></md-ripple><md-icon aria-hidden="true">chevron_left</md-icon>
          </button>
          <span class="body-medium outline-text">{{ page + 1 }} / {{ pageCount }}</span>
          <button type="button" class="style-7 for-icon small rounded surface-container-low outline-text" aria-label="Página siguiente" :disabled="page + 1 >= pageCount || loading" @click="loadPage(page + 1)">
            <md-ripple aria-hidden="true"></md-ripple><md-icon aria-hidden="true">chevron_right</md-icon>
          </button>
        </div>
      </footer>
    </template>

    <FlipModal
      v-if="memberEditor.open.value"
      :origin="memberEditor.origin.value"
      window-class="slim h-auto padding-16 border-radius-40"
      content-class="simple-container direction-column gap-16"
      close-strategy="container-only"
      @close="closeEditor"
    >
      <template #default="{ close }">
        <div class="content-box background padding-8">
          <div class="simple-container justify-between">
            <button type="button" class="style-7 for-icon small rounded surface-container outline-text" aria-label="Cerrar formulario" @click="close()">
              <md-ripple aria-hidden="true"></md-ripple><md-icon class="filled" aria-hidden="true">close</md-icon>
            </button>
          </div>
          <div class="simple-container direction-column grow-1 padding-16 align-start text-left">
            <span class="display-small weight-600 line-height-1 text-gradient">{{ editor === 'create' ? 'Agregar miembro' : 'Cambiar rol' }}</span>
          </div>
        </div>

        <form class="simple-container direction-column gap-16 settings-member-editor-form" autocomplete="off" novalidate @submit.prevent="saveMember(close)">
          <div v-if="editor === 'create'" class="settings-form-field" data-flow-item data-input-label="Cuenta elegible">
            <SelectFlip
              v-model="selectedAccount"
              name="web-member-account"
              aria-label="Cuenta elegible"
              placeholder="Selecciona una cuenta"
              :options="accountSelectOptions"
              :width="440"
              :option-height="48"
              :max-popup-height="520"
              :searchable="true"
              :grouped="true"
              :disabled="accountLoading || !accountOptions.length"
            />
            <span v-if="accountLoading" class="body-small outline-text">Cargando cuentas…</span>
            <span v-else-if="!accountOptions.length" class="body-small outline-text">No hay cuentas activas disponibles para agregar.</span>
          </div>
          <div v-else class="settings-form-field">
            <span class="label-large outline-text">Miembro</span>
            <span class="body-large">{{ editingMember?.nombre_completo || editingMember?.email }}</span>
            <span class="body-medium outline-text">{{ editingMember?.email }}</span>
          </div>
          <div class="settings-form-field" data-flow-item data-input-label="Rol web">
            <SelectFlip
              v-model="selectedRole"
              name="web-member-role"
              aria-label="Rol web"
              placeholder="Selecciona un rol"
              :options="roleSelectOptions"
              :width="440"
              :option-height="48"
              :max-popup-height="520"
              :disabled="!roleSelectOptions.length"
            />
          </div>
          <span v-if="editorError" class="body-medium error-text" role="alert">{{ editorError }}</span>
          <div data-v-6c7476fc class="container variant-gradient align-right" style="--buttons-container-gap: 0px; gap: 8px; --gradient-overflow: 16px">
            <div data-v-6c7476fc class="gradient-row" style="gap: 8px">
              <button data-v-6c7476fc type="button" class="style-7 for-icon surface-container outline-text flex-1 rounded big close-modal-btn" aria-label="Cancelar" :disabled="saving" @click="close()">
                <md-ripple data-v-6c7476fc aria-hidden="true"></md-ripple><md-icon data-v-6c7476fc aria-hidden="true">close</md-icon>
              </button>
              <button data-v-6c7476fc type="submit" class="style-7 primary-container on-primary-container-text flex-1 rounded big" :disabled="saving || (editor === 'create' && !accountOptions.length)">
                <md-ripple data-v-6c7476fc aria-hidden="true"></md-ripple><span>{{ saving ? 'Guardando…' : 'Guardar' }}</span>
              </button>
            </div>
          </div>
        </form>
      </template>
    </FlipModal>

    <FlipModal
      v-if="removeConfirmation.open.value"
      :origin="removeConfirmation.origin.value"
      window-class="slim"
      content-class="simple-container direction-column gap-24"
      @close="removeConfirmation.hide"
    >
      <template #default="{ close }">
        <div class="simple-container direction-column gap-16">
          <span class="display-small weight-600 title line-height-1">Retirar miembro</span>
          <span class="body-large">¿Deseas retirar a {{ removeConfirmation.payload.value?.nombre_completo || removeConfirmation.payload.value?.email }} del equipo web? Su cuenta general seguirá activa.</span>
        </div>
        <div class="simple-container justify-right gap-8">
          <button type="button" class="style-7 rounded variant-glass outline-text" :disabled="removing" @click="close()">Cancelar</button>
          <button type="button" class="style-7 rounded danger-true error-container error-text with-icon-left" :disabled="removing" @click="removeMember(close)">
            <md-ripple aria-hidden="true"></md-ripple><md-icon class="filled dynamic" aria-hidden="true">person_remove</md-icon>{{ removing ? 'Retirando…' : 'Retirar' }}
          </button>
        </div>
      </template>
    </FlipModal>
  </div>
</template>

<style scoped>
.settings-management-panel { display: flex; flex-direction: column; gap: 16px; min-width: 0; min-height: 100%; }
.settings-management-header, .settings-management-pagination { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.settings-members-list { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.settings-member-card { display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; min-width: 0; text-align: left; }
.settings-member-avatar { --avatar-size: 48px; }
.settings-member-copy { display: flex; flex: 1 1 auto; flex-direction: column; min-width: 0; }
.settings-member-copy > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.settings-member-meta { display: flex; flex: 0 0 auto; flex-direction: column; align-items: flex-end; gap: 4px; }
.settings-role-chip { border: 1px solid var(--md-sys-color-outline-variant); border-radius: 999px; padding: 4px 10px; white-space: nowrap; }
.settings-management-empty { display: flex; flex: 1 1 auto; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--md-sys-color-outline); text-align: center; }
.settings-management-empty md-icon { --md-icon-size: 32px; }
.settings-member-editor-form { min-width: 0; }
.settings-form-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.settings-skeleton-card { min-height: 72px; border-radius: 32px; background: var(--md-sys-color-surface-container-low); }
@media (max-width: 680px) {
  .settings-management-header { align-items: flex-start; }
  .settings-member-card { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 8px 12px; padding: 12px; }
  .settings-member-avatar { grid-column: 1; grid-row: 1 / span 2; }
  .settings-member-copy { grid-column: 2 / -1; }
  .settings-member-meta { align-items: flex-start; }
  .settings-member-card > .simple-container { grid-column: 3; grid-row: 2; justify-self: end; }
  .settings-management-pagination { align-items: flex-start; flex-direction: column; }
}
</style>
