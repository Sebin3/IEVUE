<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toast } from 'super-beautiful-toast'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const emailInvalid = ref(false)
const passwordInvalid = ref(false)
const loading = ref(false)

async function onSubmit() {
  emailInvalid.value = !email.value.trim()
  passwordInvalid.value = !password.value

  if (emailInvalid.value || passwordInvalid.value) return

  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push({ name: 'inicio' })
  } catch (e) {
    toast.error(e.message || 'No se pudo iniciar sesión', { icon: null })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="app-view page-login">
    <div class="page-login-frame">
      <section class="page-login-form-panel">
        <div class="simple-container align-center gap-8 page-login-brand">
          <img src="/icons/peruano-suizo.png" alt="" width="28" height="28" />
          <span class="title-medium weight-500">Peruano Suizo</span>
        </div>

        <div class="page-login-form-content">
          <header class="simple-container direction-column gap-8 page-login-heading">
            <h1 class="display-small weight-600">Bienvenido</h1>
            <p class="body-large outline-text">
              Ingresa tu correo y contraseña para acceder.
            </p>
          </header>

          <form
            id="loginForm"
            class="simple-container direction-column gap-16"
            autocomplete="off"
            novalidate
            @submit.prevent="onSubmit"
          >
            <div data-flow-item data-input-label="Correo electrónico">
              <input
                id="login-email"
                v-model="email"
                type="email"
                class="style-2"
                name="login-email"
                autocomplete="email"
                inputmode="email"
                :error="emailInvalid ? 'true' : undefined"
                :aria-invalid="emailInvalid"
                @input="emailInvalid = !email.trim()"
                required
              />
            </div>

            <div data-flow-item data-input-label="Contraseña">
              <input
                id="login-password"
                v-model="password"
                type="password"
                class="style-2"
                name="login-password"
                autocomplete="current-password"
                :error="passwordInvalid ? 'true' : undefined"
                :aria-invalid="passwordInvalid"
                @input="passwordInvalid = !password"
                required
              />
            </div>

            <div
              class="container variant-translucent align-default"
              data-v-6c7476fc
              style="--buttons-container-gap: 0px; gap: 8px; --gradient-overflow: 16px;"
            >
              <button
                id="loginBtn"
                data-v-cdce7500
                type="submit"
                class="style-7 for-icon primary-container on-primary-container-text flex-1 bigger"
                :disabled="loading"
              >
                <md-ripple data-v-cdce7500 aria-hidden="true"></md-ripple>
                {{ loading ? 'Iniciando sesión…' : 'Iniciar sesión' }}
              </button>
            </div>
          </form>
        </div>
      </section>

      <aside class="page-login-visual" aria-hidden="true">
        <img class="page-login-campus-image" src="/images/login-campus.png" alt="" />
      </aside>
    </div>
  </main>
</template>
