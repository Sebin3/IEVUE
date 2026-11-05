<script setup>
import { computed, onMounted, ref } from 'vue'
import FlipModal from './FlipModal.vue'
import { useModal } from '../composables/useModal'
import { apiDelete, apiGet, apiPatch, apiPost } from '../services/api'
import { toast } from 'super-beautiful-toast'

const props = defineProps({ session: { type: Object, required: true } })
const permissions = computed(() => new Set(props.session.permissions || []))
const isAdministrator = computed(() => props.session.is_administrator === true)
const canView = computed(() => isAdministrator.value || permissions.value.has('roles.view'))
const canCreate = computed(() => isAdministrator.value)
const canDelete = computed(() => isAdministrator.value)
const canUpdate = computed(() => isAdministrator.value || permissions.value.has('roles.update'))

const roles = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const editorError = ref('')
const editor = ref(null)
const roleName = ref('')
const roleDescription = ref('')
const roleActive = ref(true)
const selectedPermissions = ref([])
const deleting = ref(false)
const roleEditor = useModal()
const deleteConfirmation = useModal()

const permissionGroups = [
  {
    label: 'Panel',
    items: [{ key: 'dashboard.view', label: 'Ver inicio y resumen' }],
  },
  {
    label: 'Miembros',
    items: [
      { key: 'members.view', label: 'Ver miembros' },
      { key: 'members.update', label: 'Editar miembros' },
      { key: 'members.assign_role', label: 'Asignar roles' },
    ],
  },
  {
    label: 'Roles',
    items: [
      { key: 'roles.view', label: 'Ver roles' },
      { key: 'roles.update', label: 'Editar nombre y descripción' },
    ],
  },
  {
    label: 'Institución y cuenta',
    items: [
      { key: 'institution.view', label: 'Ver información institucional' },
      { key: 'institution.update', label: 'Editar información institucional' },
      { key: 'profile.view', label: 'Ver perfil' },
      { key: 'profile.update', label: 'Editar perfil' },
    ],
  },
]

const deleteTarget = computed(() => deleteConfirmation.payload.value)
const canDeleteTarget = computed(() => {
  const role = deleteTarget.value
  return role && !role.is_system && role.role_key !== 'web_administrator' && (role.member_count || 0) === 0
})

async function loadRoles() {
  if (!canView.value) return
  loading.value = true
  error.value = ''
  try {
    const result = await apiGet('/api/web/roles')
    roles.value = Array.isArray(result) ? result : []
  } catch (loadError) {
    error.value = loadError.message || 'No se pudieron cargar los roles.'
  } finally {
    loading.value = false
  }
}

function startCreate(event) {
  roleEditor.show(event)
  editor.value = 'create'
  roleName.value = ''
  roleDescription.value = ''
  roleActive.value = true
  selectedPermissions.value = []
  editorError.value = ''
}

function startEdit(event, role) {
  if (!canUpdate.value || role.role_key === 'web_administrator') return
  roleEditor.show(event)
  editor.value = role
  roleName.value = role.name || ''
  roleDescription.value = role.description || ''
  roleActive.value = role.active !== false
  selectedPermissions.value = [...(role.permissions || [])]
  editorError.value = ''
}

function closeEditor() {
  roleEditor.hide()
  editor.value = null
  editorError.value = ''
}

function togglePermission(key) {
  if (!isAdministrator.value) return
  selectedPermissions.value = selectedPermissions.value.includes(key)
    ? selectedPermissions.value.filter((permission) => permission !== key)
    : [...selectedPermissions.value, key]
}

async function saveRole(close) {
  if (saving.value) return
  const name = roleName.value.trim().replace(/\s+/g, ' ')
  const description = roleDescription.value.trim().replace(/\s+/g, ' ')
  if (!name) {
    editorError.value = 'Escribe un nombre para el rol.'
    return
  }

  saving.value = true
  editorError.value = ''
  const body = { name, description }
  if (isAdministrator.value) {
    body.permissions = selectedPermissions.value
    if (editor.value !== 'create') body.active = roleActive.value
  }

  try {
    if (editor.value === 'create') {
      await apiPost('/api/web/roles', body)
      toast.success('Rol creado', { icon: null })
    } else {
      await apiPatch(`/api/web/roles/${encodeURIComponent(editor.value.id)}`, body)
      toast.success('Rol actualizado', { icon: null })
    }
    close()
    await loadRoles()
  } catch (saveError) {
    editorError.value = saveError.message || 'No se pudo guardar el rol.'
    toast.error(editorError.value, { icon: null })
  } finally {
    saving.value = false
  }
}

async function removeRole(close) {
  const role = deleteTarget.value
  if (deleting.value || !role || !canDeleteTarget.value) return
  deleting.value = true
  try {
    await apiDelete(`/api/web/roles/${encodeURIComponent(role.id)}`)
    toast.success('Rol eliminado', { icon: null })
    await loadRoles()
    close()
  } catch (deleteError) {
    toast.error(deleteError.message || 'No se pudo eliminar el rol.', { icon: null })
  } finally {
    deleting.value = false
  }
}

onMounted(loadRoles)
</script>

<template>
  <div class="settings-management-panel" role="region" aria-label="Roles">
    <header class="settings-management-header">
      <div class="simple-container direction-column gap-4">
        <span class="title-large weight-500">Roles</span>
        <span class="body-medium outline-text">Define los accesos y las acciones disponibles para cada miembro.</span>
      </div>
      <button
        v-if="canCreate"
        type="button"
        class="style-7 for-icon bigger rounded primary-container on-primary-container-text"
        aria-label="Crear rol"
        title="Crear rol"
        @click="startCreate($event)"
      >
        <md-ripple aria-hidden="true"></md-ripple><md-icon aria-hidden="true">add</md-icon>
      </button>
    </header>

    <div v-if="!canView" class="settings-management-empty content-box background outline-light-1 border-radius-32 padding-24">
      <md-icon aria-hidden="true">lock</md-icon><span class="body-large">Tu rol no tiene permiso para ver los roles.</span>
    </div>

    <template v-else>
      <div v-if="error" class="settings-management-empty content-box background outline-light-1 border-radius-32 padding-24" role="alert">
        <md-icon aria-hidden="true">error</md-icon><span class="body-large">{{ error }}</span>
      </div>
      <div v-else-if="loading" class="settings-roles-list" aria-label="Cargando roles" aria-busy="true">
        <div v-for="index in 4" :key="index" class="settings-role-card settings-skeleton-card animation-loading-1"></div>
      </div>
      <div v-else-if="roles.length" class="settings-roles-list">
        <article v-for="role in roles" :key="role.id" class="settings-role-card content-box background outline-light-1 border-radius-32 padding-16 text-left">
          <div class="settings-role-copy">
            <div class="simple-container align-center gap-8 flex-wrap">
              <span class="body-large weight-500">{{ role.name }}</span>
              <span v-if="role.is_system" class="settings-system-chip label-medium outline-text">Predeterminado</span>
            </div>
            <span class="body-medium outline-text">{{ role.description || 'Sin descripción' }}</span>
            <span class="body-small outline-text">{{ role.member_count || 0 }} miembros · {{ role.active ? 'Activo' : 'Inactivo' }}</span>
          </div>
          <div v-if="canUpdate || canDelete" class="simple-container gap-4">
            <button
              v-if="canUpdate && role.role_key !== 'web_administrator'"
              type="button"
              class="style-7 for-icon small rounded surface-container-low outline-text"
              :aria-label="`Editar rol ${role.name}`"
              title="Editar rol"
              @click="startEdit($event, role)"
            >
              <md-ripple aria-hidden="true"></md-ripple><md-icon aria-hidden="true">edit</md-icon>
            </button>
            <button
              v-if="canDelete && !role.is_system && role.role_key !== 'web_administrator'"
              type="button"
              class="style-7 for-icon small rounded surface-container-low outline-text hover-delete"
              :aria-label="`Eliminar rol ${role.name}`"
              :disabled="(role.member_count || 0) > 0"
              :title="(role.member_count || 0) > 0 ? 'Reasigna los miembros antes de eliminar este rol' : 'Eliminar rol'"
              @click="deleteConfirmation.show($event, role)"
            >
              <md-ripple aria-hidden="true"></md-ripple><md-icon aria-hidden="true">delete</md-icon>
            </button>
          </div>
        </article>
      </div>
      <div v-else-if="!editor" class="settings-management-empty content-box background outline-light-1 border-radius-32 padding-24">
        <md-icon aria-hidden="true">badge</md-icon><span class="body-large">No hay roles registrados.</span>
      </div>
    </template>

    <FlipModal
      v-if="roleEditor.open.value"
      :origin="roleEditor.origin.value"
      placement="center"
      window-class="semi-slim h-auto padding-16 border-radius-40"
      content-class="simple-container direction-column gap-16 grow-1"
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
            <span class="display-medium weight-600 line-height-1 text-gradient">{{ editor === 'create' ? 'Crear rol' : 'Editar rol' }}</span>
          </div>
        </div>

        <form class="simple-container direction-column gap-16 settings-role-editor-form" autocomplete="off" novalidate @submit.prevent="saveRole(close)">
          <div class="settings-role-fields">
            <div class="settings-role-field" data-flow-item data-input-label="Nombre del rol">
              <input v-model="roleName" class="style-2" type="text" maxlength="60" autocomplete="off" />
            </div>
            <div class="settings-role-field" data-flow-item data-input-label="Descripción">
              <input v-model="roleDescription" class="style-2" type="text" maxlength="240" autocomplete="off" />
            </div>
            <label v-if="isAdministrator && editor !== 'create'" class="settings-role-active body-medium">
              <input v-model="roleActive" type="checkbox" />
              <span>Rol activo</span>
            </label>
          </div>

          <div v-if="isAdministrator" class="settings-permission-groups">
            <section v-for="group in permissionGroups" :key="group.label" class="settings-permission-group">
              <span class="title-small weight-500">{{ group.label }}</span>
              <label v-for="item in group.items" :key="item.key" class="settings-permission-item body-medium">
                <input :checked="selectedPermissions.includes(item.key)" type="checkbox" @change="togglePermission(item.key)" />
                <span>{{ item.label }}</span>
              </label>
            </section>
          </div>
          <p v-else class="body-small outline-text">Puedes editar el nombre y la descripción. La configuración de permisos está reservada para administradores.</p>

          <span v-if="editorError" class="body-medium error-text" role="alert">{{ editorError }}</span>
          <div data-v-6c7476fc class="container variant-gradient align-right" style="--buttons-container-gap: 0px; gap: 8px; --gradient-overflow: 16px">
            <div data-v-6c7476fc class="gradient-row" style="gap: 8px">
              <button data-v-6c7476fc type="button" class="style-7 for-icon surface-container outline-text flex-1 rounded big close-modal-btn" aria-label="Cancelar" :disabled="saving" @click="close()">
                <md-ripple data-v-6c7476fc aria-hidden="true"></md-ripple><md-icon data-v-6c7476fc aria-hidden="true">close</md-icon>
              </button>
              <button data-v-6c7476fc type="submit" class="style-7 primary-container on-primary-container-text flex-1 rounded big" :disabled="saving">
                <md-ripple data-v-6c7476fc aria-hidden="true"></md-ripple><span>{{ saving ? 'Guardando…' : 'Guardar' }}</span>
              </button>
            </div>
          </div>
        </form>
      </template>
    </FlipModal>

    <FlipModal
      v-if="deleteConfirmation.open.value"
      :origin="deleteConfirmation.origin.value"
      window-class="slim"
      content-class="simple-container direction-column gap-24"
      @close="deleteConfirmation.hide"
    >
      <template #default="{ close }">
        <div class="simple-container direction-column gap-16">
          <span class="display-small weight-600 title line-height-1">Eliminar rol</span>
          <span class="body-large">¿Deseas eliminar el rol {{ deleteTarget?.name }}? Esta acción no se puede deshacer.</span>
        </div>
        <div class="simple-container justify-right gap-8">
          <button type="button" class="style-7 rounded variant-glass outline-text" :disabled="deleting" @click="close()">Cancelar</button>
          <button type="button" class="style-7 rounded danger-true error-container error-text with-icon-left" :disabled="deleting || !canDeleteTarget" @click="removeRole(close)">
            <md-ripple aria-hidden="true"></md-ripple><md-icon class="filled dynamic" aria-hidden="true">delete</md-icon>{{ deleting ? 'Eliminando…' : 'Eliminar' }}
          </button>
        </div>
      </template>
    </FlipModal>
  </div>
</template>

<style scoped>
.settings-management-panel { display: flex; flex-direction: column; gap: 16px; min-width: 0; min-height: 100%; }
.settings-management-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.settings-roles-list { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.settings-role-card { display: flex; flex-direction: row; align-items: center; gap: 16px; min-width: 0; text-align: left; }
.settings-role-copy { display: flex; flex: 1 1 auto; flex-direction: column; gap: 4px; min-width: 0; text-align: left; }
.settings-role-copy > span { overflow-wrap: anywhere; }
.settings-system-chip { border: 1px solid var(--md-sys-color-outline-variant); border-radius: 999px; padding: 3px 8px; }
.settings-management-empty { display: flex; flex: 1 1 auto; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: var(--md-sys-color-outline); text-align: center; }
.settings-management-empty md-icon { --md-icon-size: 32px; }
.settings-role-editor-form { flex: 1 1 auto; min-height: 0; max-height: 70vh; overflow-y: auto; padding-right: 4px; }
.settings-role-fields { display: flex; flex-direction: column; gap: 12px; }
.settings-role-field, .settings-role-field > input { width: 100%; }
.settings-role-active, .settings-permission-item { display: flex; align-items: center; gap: 10px; min-height: 36px; }
.settings-role-active input, .settings-permission-item input { width: 18px; height: 18px; accent-color: var(--md-sys-color-primary); }
.settings-permission-groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.settings-permission-group { display: flex; flex-direction: column; gap: 4px; min-width: 0; border: 1px solid var(--md-sys-color-outline-variant); border-radius: 24px; padding: 12px; }
.settings-permission-group > .title-small { padding: 0 4px 4px; }
.settings-skeleton-card { min-height: 96px; border-radius: 32px; background: var(--md-sys-color-surface-container-low); }
@media (max-width: 680px) {
  .settings-role-card { align-items: flex-start; padding: 12px; }
  .settings-permission-groups { grid-template-columns: 1fr; }
}
</style>
