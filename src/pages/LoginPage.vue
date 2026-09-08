<script setup>
/**
 * PAGE: LOGIN — index.html lineas 366-416.
 * Con mocks: cualquier usuario/contrasena no vacios entran.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push({ name: 'inicio' })
  } catch (e) {
    error.value = e.message || 'No se pudo iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div data-v-1f02e176 class="app-view align-center page-login">
    <div
      data-v-1f02e176
      class="simple-container direction-column width-100 max-width-400 gap-24"
    >
      <div class="simple-container direction-column gap-16 align-center">
        <md-icon class="pretty-minimal primary-text" style="font-size: 64px">
          account_circle
        </md-icon>
        <span class="display-small weight-500">Iniciar Sesión</span>
      </div>

      <form id="loginForm" class="simple-container direction-column gap-16" @submit.prevent="onSubmit">
        <div class="content-box light-color direction-column gap-8">
          <label class="body-medium outline-text" for="username">Usuario</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="style-1"
            placeholder="Ingrese su usuario"
            required
          />
        </div>

        <div class="content-box light-color direction-column gap-8">
          <label class="body-medium outline-text" for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="style-1"
            placeholder="Ingrese su contraseña"
            required
          />
        </div>

        <div
          v-if="error"
          id="loginError"
          class="content-box error-container gap-8 align-center"
          role="alert"
        >
          <md-icon class="error-text">error</md-icon>
          <span id="loginErrorText" class="body-medium error-text">{{ error }}</span>
        </div>

        <button
          id="loginBtn"
          type="submit"
          class="style-7 primary-container on-primary-container-text nice-button"
          :disabled="loading"
        >
          <md-ripple aria-hidden="true"></md-ripple>
          <span>{{ loading ? 'Ingresando...' : 'Ingresar' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
