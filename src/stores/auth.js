import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { clearApiGetCache } from '../services/api'

const TOKEN_KEY = 'auth_token'
const USERNAME_KEY = 'auth_username'
const USER_KEY = 'auth_user'
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://colegiosuizo-yl5x.onrender.com'
).replace(/\/+$/, '')

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

const storedToken = localStorage.getItem(TOKEN_KEY) || ''
const hasMockToken = storedToken.startsWith('mock-token-')

if (hasMockToken) {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(USER_KEY)
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(hasMockToken ? '' : storedToken)
  const user = ref(hasMockToken ? null : readStoredUser())
  const username = ref(
    hasMockToken
      ? ''
      : localStorage.getItem(USERNAME_KEY) || user.value?.nombres || user.value?.nombre_completo || '',
  )

  const isAuthenticated = computed(() => !!token.value)

  async function login(emailInput, password) {
    const normalizedEmail = emailInput?.trim().toLocaleLowerCase('es-PE')
    if (!normalizedEmail || !password) {
      throw new Error('Ingresa tu correo y contraseña')
    }

    let response
    try {
      response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
        cache: 'no-store',
        body: JSON.stringify({ email: normalizedEmail, password }),
      })
    } catch {
      throw new Error('No se pudo conectar con el servidor. Inténtalo de nuevo.')
    }

    const payload = await response.json().catch(() => null)
    if (!response.ok || payload?.success !== true) {
      if (response.status === 401) throw new Error('Correo o contraseña incorrectos.')
      if (response.status === 429) {
        throw new Error('Demasiados intentos. Espera unos minutos e inténtalo nuevamente.')
      }
      if (response.status === 400) throw new Error('Revisa el correo ingresado e inténtalo nuevamente.')
      throw new Error('No se pudo iniciar sesión. Inténtalo nuevamente.')
    }

    const accessToken = payload?.data?.tokens?.access
    const profile = payload?.data?.user
    if (typeof accessToken !== 'string' || !accessToken || !profile || typeof profile !== 'object') {
      throw new Error('El servidor devolvió una respuesta de inicio de sesión inválida.')
    }

    const displayName = String(profile.nombres || profile.nombre_completo || '').trim()
    clearApiGetCache()
    token.value = accessToken
    user.value = profile
    username.value = displayName || normalizedEmail.split('@')[0]
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(USERNAME_KEY, username.value)
    localStorage.setItem(USER_KEY, JSON.stringify(profile))
  }

  function logout() {
    clearApiGetCache()
    token.value = ''
    username.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, user, username, isAuthenticated, login, logout }
})
