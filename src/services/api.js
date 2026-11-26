const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://colegiosuizo-yl5x.onrender.com'
).replace(/\/+$/, '')
const directoryCache = new Map()
const DIRECTORY_CACHE_TTL_MS = 2 * 60 * 1000
const DIRECTORY_CACHE_MAX_ENTRIES = 48

function rememberDirectoryResponse(key, data, ttlMs = DIRECTORY_CACHE_TTL_MS) {
  directoryCache.delete(key)
  directoryCache.set(key, { data, expiresAt: Date.now() + Math.max(0, ttlMs) })

  while (directoryCache.size > DIRECTORY_CACHE_MAX_ENTRIES) {
    directoryCache.delete(directoryCache.keys().next().value)
  }
}

function getSessionScope() {
  const token = localStorage.getItem('auth_token') || ''
  let hash = 2166136261
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

export function clearApiGetCache() {
  directoryCache.clear()
}

async function apiRequest(path, { method = 'GET', body, signal, includeEnvelope = false } = {}) {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    window.dispatchEvent(new Event('ievue:session-expired'))
    throw new Error('Tu sesión venció. Inicia sesión nuevamente.')
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        Authorization: `Bearer ${token}`,
      },
      credentials: 'omit',
      cache: 'no-store',
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('No se pudo conectar con el servidor. Inténtalo de nuevo.')
  }

  const payload = await response.json().catch(() => null)
  if (response.status === 401) {
    window.dispatchEvent(new Event('ievue:session-expired'))
    throw new Error('Tu sesión venció. Inicia sesión nuevamente.')
  }
  if (response.status === 403) {
    throw new Error(payload?.message || (method === 'GET'
      ? 'No tienes permiso para consultar estos datos.'
      : 'No tienes permiso para modificar estos datos.'))
  }
  if (!response.ok || payload?.success !== true) {
    throw new Error(payload?.message || 'No se pudo completar la operación.')
  }

  if (method !== 'GET') clearApiGetCache()

  return includeEnvelope ? payload : payload.data
}

export function apiGet(path, options = {}) {
  return apiRequest(path, options)
}

export function apiGetEnvelope(path, options = {}) {
  return apiRequest(path, { ...options, includeEnvelope: true })
}

export async function apiGetCached(path, options = {}) {
  const key = `${getSessionScope()}:${path}`
  const cached = directoryCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    directoryCache.delete(key)
    directoryCache.set(key, cached)
    return cached.data
  }
  if (cached) directoryCache.delete(key)

  const data = await apiRequest(path, options)
  if (!options.signal?.aborted) rememberDirectoryResponse(key, data, options.ttlMs)
  return data
}

export function apiPost(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'POST', body })
}

export function apiPatch(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'PATCH', body })
}

export function apiPut(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'PUT', body })
}

export function apiDelete(path, options = {}) {
  return apiRequest(path, { ...options, method: 'DELETE' })
}
