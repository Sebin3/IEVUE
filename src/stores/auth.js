import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { clearApiGetCache } from '../services/api'

const TOKEN_KEY = 'auth_token'
const USERNAME_KEY = 'auth_username'
const USER_KEY = 'auth_user'
const WEB_LOGIN_PATH = '/api/web/members/sessions'
const WEB_ROLES = new Set(['profesor', 'administrador', 'admin'])
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

function tokenExpiry(tokenValue) {
  try {
    const encodedPayload = tokenValue.split('.')[1]
    if (!encodedPayload) return null
    const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')))
    return Number.isFinite(payload.exp) ? payload.exp * 1000 : null
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
  let expiryTimer

  function clearExpiryTimer() {
    if (expiryTimer) window.clearTimeout(expiryTimer)
    expiryTimer = undefined
  }

  function scheduleExpiryCheck() {
    clearExpiryTimer()
    const expiresAt = tokenExpiry(token.value)
    if (!expiresAt) return

    const remaining = expiresAt - Date.now()
    if (remaining <= 0) {
      window.dispatchEvent(new Event('ievue:session-expired'))
      return
    }

    // Browser timers clamp delays near 24 days; recheck if the token lasts longer.
    expiryTimer = window.setTimeout(() => {
      if (expiresAt <= Date.now()) window.dispatchEvent(new Event('ievue:session-expired'))
      else scheduleExpiryCheck()
    }, Math.min(remaining, 2_147_000_000))
  }

  function hasValidSession() {
    if (!token.value) return false
    const expiresAt = tokenExpiry(token.value)
    if (expiresAt && expiresAt <= Date.now()) {
      logout()
      return false
    }
    return true
  }

  function hasWebSession() {
    if (!hasValidSession() || user.value?.access_context !== 'web') return false
    return WEB_ROLES.has(String(user.value?.rol || '').trim().toLocaleLowerCase('es-PE'))
  }

  function isWebProfessor() {
    return hasWebSession() && String(user.value?.rol || '').trim().toLocaleLowerCase('es-PE') === 'profesor'
  }

  scheduleExpiryCheck()

  async function login(emailInput, password) {
    const normalizedEmail = emailInput?.trim().toLocaleLowerCase('es-PE')
    if (!normalizedEmail || !password) {
      throw new Error('Ingresa tu correo y contraseña')
    }

    let response
    try {
      response = await fetch(`${API_BASE_URL}${WEB_LOGIN_PATH}`, {
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
      if (response.status === 403) {
        throw new Error(payload?.message || 'Esta cuenta no tiene acceso al panel web.')
      }
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
    const role = String(profile.rol || '').trim().toLocaleLowerCase('es-PE')
    if (profile.access_context !== 'web' || !WEB_ROLES.has(role)) {
      throw new Error('Esta cuenta no tiene acceso al panel web.')
    }

    const displayName = String(profile.nombres || profile.nombre_completo || '').trim()
    clearApiGetCache()
    token.value = accessToken
    user.value = profile
    username.value = displayName || normalizedEmail.split('@')[0]
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(USERNAME_KEY, username.value)
    localStorage.setItem(USER_KEY, JSON.stringify(profile))
    scheduleExpiryCheck()
  }

  function logout() {
    clearExpiryTimer()
    clearApiGetCache()
    token.value = ''
    username.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, user, username, isAuthenticated, hasValidSession, hasWebSession, isWebProfessor, login, logout }
})
