import { ref } from 'vue'

/**
 * Estilo del nav. index.html guarda en localStorage.sidebarState
 * { className, style } y aplica la clase `style-N` sobre .app-nav.
 */
export const navStyleOptions = [
  { style: 'style-1', label: 'Clásica' },
  { style: 'style-2', label: 'Bonita' },
  { style: 'style-3', label: 'Dock' },
  { style: 'style-4', label: 'Guapa' },
]

const valid = new Set(navStyleOptions.map((o) => o.style))

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem('sidebarState') || '{}')
    if (valid.has(saved.style)) return saved.style
    const match = String(saved.className || '').match(/style-\d+/)
    if (match && valid.has(match[0])) return match[0]
  } catch {
    /* localStorage corrupto: nos quedamos con el default */
  }
  return 'style-2'
}

const navStyle = ref(readSaved())

export function useNavStyle() {
  function setNavStyle(style) {
    if (!valid.has(style)) return
    navStyle.value = style
    localStorage.setItem(
      'sidebarState',
      JSON.stringify({ className: `app-nav mobile-style-1 ${style}`, style }),
    )
  }

  return { navStyle, setNavStyle, navStyleOptions }
}
