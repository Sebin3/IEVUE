import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')

  const isAuthenticated = computed(() => !!token.value)

  async function login(username, password) {
    if (!username || !password) {
      throw new Error('Ingresa usuario y contraseña')
    }
    token.value = 'mock-token-' + Date.now()
    localStorage.setItem(TOKEN_KEY, token.value)
  }

  function logout() {
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
  }

  return { token, isAuthenticated, login, logout }
})
