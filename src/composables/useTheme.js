import { ref } from 'vue'

/**
 * Temas: index.html los sirve como CSS suelto que se inyecta como texto en
 * <style id="app-theme">. Los archivos viven en public/themes/ para que la URL
 * `/themes/<nombre>.css` sea la misma en dev y en build (el script pre-pintado
 * de index.html usa esa misma ruta).
 */
export const themeList = [
  { name: 'gray', bg: 'rgb(181, 181, 181)' },
  { name: 'black', bg: 'rgb(0, 0, 0)' },
  { name: 'green', bg: 'rgb(75, 217, 123)' },
  { name: 'blue', bg: 'rgb(0, 94, 235)' },
  { name: 'brown', bg: 'rgb(148, 75, 0)' },
  { name: 'purple', bg: 'rgb(110, 0, 241)' },
  { name: 'red', bg: 'rgb(219, 51, 49)' },
  { name: 'pink', bg: 'rgb(196, 0, 232)' },
  { name: 'pastel-pink', bg: 'rgb(217, 124, 185)' },
  { name: 'super-blue', bg: 'rgb(52, 77, 246)' },
]

const validThemes = new Set(themeList.map((t) => t.name))

const currentTheme = ref(localStorage.getItem('currentTheme') || 'red')

let themeStyleEl = null

function getThemeStyleEl() {
  if (!themeStyleEl) {
    themeStyleEl = document.getElementById('app-theme')
    if (!themeStyleEl) {
      themeStyleEl = document.createElement('style')
      themeStyleEl.id = 'app-theme'
    }
  }
  return themeStyleEl
}

/**
 * En index.html el <style id="app-theme"> es el ULTIMO nodo del <head>, despues
 * de frontend.css, asi que sus variables --md-sys-color-* ganan la cascada.
 * Aqui frontend.css entra por el bundle (en dev como <style> inyectado, en build
 * como <link>), siempre DESPUES del tag inline -> el tema quedaba pisado y
 * cambiar de color no hacia nada. Reponerlo al final del <head> restaura el
 * mismo orden que el original.
 */
function moveThemeStyleLast() {
  const el = getThemeStyleEl()
  if (document.head.lastElementChild !== el) document.head.appendChild(el)
  return el
}

export function useTheme() {
  async function changeTheme(themeName) {
    if (!validThemes.has(themeName)) return
    // Optimista: el selector marca la bolita antes de que llegue el CSS.
    currentTheme.value = themeName
    localStorage.setItem('currentTheme', themeName)
    try {
      const resp = await fetch(`/themes/${themeName}.css`)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      moveThemeStyleLast().textContent = await resp.text()
    } catch (e) {
      console.error('Error loading theme:', e)
    }
  }

  function initTheme() {
    // index.html ya inyecta el tema guardado antes de pintar; esto solo cubre
    // el caso de que ese script no haya corrido (o el <style> este vacio).
    const el = moveThemeStyleLast()
    if (!el.textContent.trim()) changeTheme(currentTheme.value)
  }

  return { currentTheme, changeTheme, initTheme, themes: themeList }
}
