<script setup>
/**
 * FlipModal
 * Puerto 1:1 de openModal()/closeModal() de index.html: el boton que abre el
 * modal se "convierte" en la ventana con GSAP Flip, y al cerrar la ventana
 * vuelve a colapsar sobre el boton con blur + border-radius 400px.
 *
 * Uso:
 *   <FlipModal v-if="open" :origin="originEl" @close="open = false">
 *     ...contenido...
 *   </FlipModal>
 * donde originEl = event.currentTarget del boton que la abrio.
 */
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap, Flip, customEase, closeEase1, closeEase2 } from '../composables/useGsap'

const props = defineProps({
  // Elemento desde el que nace la animacion (el boton pulsado).
  origin: { type: Object, default: null },
  // Clases del .modal-window, tal como las escribe index.html.
  windowClass: {
    type: String,
    default: 'increased slim h-auto padding-16 border-radius-40',
  },
  // Alto fijo del contenido interno (index.html usa 693px en Crear movimiento).
  contentHeight: { type: String, default: '' },
  // Ubicación final opcional para paneles flotantes sin clases CSS de layout.
  placement: { type: String, default: '' },
  // Evita comprimir el contenido interno mientras el contenedor vuelve al origen.
  closeStrategy: { type: String, default: 'window' },
  // Cierre líquido reservado a modales que lo solicitan; el FLIP normal no cambia.
  liquidAnimation: { type: Boolean, default: false },
  // Aspecto que el modal de referencia usa para el punto de origen aunque el
  // elemento disparador sea una fila transparente del menú de Opciones.
  liquidOriginStyle: { type: Object, default: null },
  // Elementos compartidos que deben viajar entre el botón y el modal.
  sharedItems: { type: String, default: '' },
  // Habilita arrastre/redimensionado en escritorio; el string identifica
  // la geometría persistida para este modal.
  floatable: { type: [Boolean, String], default: false },
  // Cerrar al pulsar el backdrop.
  closeOnBackdrop: { type: Boolean, default: true },
  // El modal de Opciones usa `modal-backdrop no-backdrop`.
  backdropClass: { type: String, default: '' },
  // Wrapper interno; Opciones usa `simple-container direction-column gap-24`.
  contentClass: {
    type: String,
    default: 'simple-container direction-column gap-16 grow-1',
  },
  // Hash(es) de scope que index.html escribe en ese wrapper. Varios modales
  // llevan dos ("4341c8dd c84aa51e"), asi que se acepta lista separada por
  // espacios.
  contentDataV: { type: String, default: 'c84aa51e' },
})

// Vue no permite nombres de atributo dinamicos sueltos; se pasan con v-bind.
const contentScope = computed(() =>
  Object.fromEntries(
    props.contentDataV
      .split(/\s+/)
      .filter(Boolean)
      .map((hash) => [`data-v-${hash}`, '']),
  ),
)

const emit = defineEmits(['close'])

// La pila vive en `document` y no en el scope del módulo: Vite puede reemplazar
// este módulo conservando el documento y su listener. Así no queda un handler
// apuntando a una pila antigua después de HMR.
const modalRegistryKey = '__ievueFlipModalRegistry'
const modalRegistry = typeof document !== 'undefined'
  ? (document[modalRegistryKey] ||= createModalRegistry())
  : createModalRegistry()
const stack = modalRegistry.stack

function createModalRegistry() {
  const registry = { stack: [] }
  registry.onKeydown = (event) => {
    if (event.key !== 'Escape') return
    const top = registry.stack[registry.stack.length - 1]
    if (!top) return

    // Capturar Escape antes de que controles internos o la vista lo consuman;
    // el callback superior decide si ya está cerrándose y no duplica la animación.
    event.preventDefault()
    event.stopPropagation()
    top()
  }
  return registry
}

if (typeof document !== 'undefined' && !modalRegistry.listenerInstalled) {
  document.addEventListener('keydown', modalRegistry.onKeydown, true)
  modalRegistry.listenerInstalled = true
}

const backdrop = ref(null)
const container = ref(null)
const windowEl = ref(null)
const isFloating = ref(false)

let closing = false
let flipCounter = 0
let sharedFlights = []
let liquidCloseLayer = null
let liquidCloseTimer = null
let liquidCloseTweens = []
let originInlineStyles = null
let liquidOpenLayer = null
let liquidOpenTimer = null
let liquidOpenTweens = []
let liquidOpenMotionCancel = null
let backdropInlineZIndex = null
let liquidCloseMotionCancel = null
let floatDragCleanup = null
let floatTickerState = null
let floatDockTween = null
let dockedBounds = null

const FLOAT_MARGIN = 8
const FLOAT_MIN_WIDTH = 320
const FLOAT_MIN_HEIGHT = 240
const FLOAT_DRAG_THRESHOLD = 4
const FLOAT_STORAGE_PREFIX = 'modal-float.'

function floatingStorageKey() {
  return typeof props.floatable === 'string' && props.floatable
    ? `${FLOAT_STORAGE_PREFIX}${props.floatable}`
    : ''
}

function clampFloatingBounds(bounds) {
  const maxWidth = Math.max(FLOAT_MIN_WIDTH, window.innerWidth - FLOAT_MARGIN * 2)
  const maxHeight = Math.max(FLOAT_MIN_HEIGHT, window.innerHeight - FLOAT_MARGIN * 2)
  const width = Math.min(maxWidth, Math.max(FLOAT_MIN_WIDTH, bounds.width))
  const height = Math.min(maxHeight, Math.max(FLOAT_MIN_HEIGHT, bounds.height))
  return {
    top: Math.min(window.innerHeight - height - FLOAT_MARGIN, Math.max(FLOAT_MARGIN, bounds.top)),
    left: Math.min(window.innerWidth - width - FLOAT_MARGIN, Math.max(FLOAT_MARGIN, bounds.left)),
    width,
    height,
  }
}

function readSavedFloatingBounds() {
  const key = floatingStorageKey()
  if (!key || window.innerWidth < 680) return null
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || 'null')
    return saved && ['top', 'left', 'width', 'height'].every((name) => Number.isFinite(saved[name]))
      ? clampFloatingBounds(saved)
      : null
  } catch {
    return null
  }
}

function saveFloatingBounds(bounds = container.value?.getBoundingClientRect()) {
  const key = floatingStorageKey()
  if (!key || !bounds) return
  try {
    const safe = clampFloatingBounds(bounds)
    window.localStorage.setItem(key, JSON.stringify({
      top: Math.round(safe.top),
      left: Math.round(safe.left),
      width: Math.round(safe.width),
      height: Math.round(safe.height),
    }))
  } catch {
    // El modal sigue funcionando aunque el navegador bloquee localStorage.
  }
}

function applyFloatingBounds(bounds) {
  const safe = clampFloatingBounds(bounds)
  const parent = container.value
  const panel = windowEl.value
  if (!parent || !panel) return safe
  Object.assign(parent.style, {
    position: 'absolute',
    top: `${safe.top}px`,
    left: `${safe.left}px`,
    right: 'unset',
    bottom: 'unset',
    width: `${safe.width}px`,
    height: `${safe.height}px`,
    overflow: 'visible',
  })
  Object.assign(panel.style, {
    width: `${safe.width}px`,
    height: `${safe.height}px`,
    minWidth: `${safe.width}px`,
    minHeight: `${safe.height}px`,
    maxWidth: 'none',
    maxHeight: `${safe.height}px`,
  })
  parent.style.setProperty('--modal-viewport-top', `${Math.max(0, Math.round(safe.top))}px`)
  return safe
}

function setFloatingMode(value) {
  if (!backdrop.value || !container.value || !windowEl.value) return
  isFloating.value = value
  backdrop.value.classList.toggle('is-floating', value)
  container.value.classList.toggle('is-floating', value)
  windowEl.value.classList.toggle('is-floating', value)
  windowEl.value.setAttribute('aria-modal', value ? 'false' : 'true')
}

function stopFloatTicker() {
  if (floatTickerState) gsap.ticker.remove(floatTickerState.tick)
  floatTickerState = null
}

function startFloatTicker(state, onSettled) {
  stopFloatTicker()
  state.time = performance.now()
  state.tick = () => {
    const now = performance.now()
    const dt = Math.min((now - state.time) / 1000, 1 / 30)
    state.time = now
    state.vx += ((state.targetX - state.x) * 700 - state.vx * 44) * dt / state.mass
    state.vy += ((state.targetY - state.y) * 700 - state.vy * 44) * dt / state.mass
    state.x += state.vx * dt
    state.y += state.vy * dt
    const next = clampFloatingBounds({
      top: state.y,
      left: state.x,
      width: state.width,
      height: state.height,
    })
    if (next.left !== state.x) state.vx = 0
    if (next.top !== state.y) state.vy = 0
    state.x = next.left
    state.y = next.top
    applyFloatingBounds(next)
    if (
      !state.dragging &&
      Math.hypot(state.targetX - state.x, state.targetY - state.y) < 0.5 &&
      Math.hypot(state.vx, state.vy) < 5
    ) {
      stopFloatTicker()
      saveFloatingBounds(next)
      onSettled?.()
    }
  }
  floatTickerState = state
  gsap.ticker.add(state.tick)
}

function enableFloatingInteractions() {
  if (!props.floatable || !container.value) return
  const parent = container.value
  const bar = parent.querySelector('[data-float-bar]')
  const corners = [...parent.querySelectorAll('[data-float-corner]')]
  if (!bar) return

  dockedBounds = { ...parent.getBoundingClientRect().toJSON() }
  const saved = readSavedFloatingBounds()
  if (saved) {
    applyFloatingBounds(saved)
    setFloatingMode(true)
  }

  let activePointer = null
  let viewportWasMobile = window.innerWidth < 680
  const removeActivePointerListeners = () => {
    if (!activePointer) return
    const { element, move, end } = activePointer
    element.removeEventListener('pointermove', move)
    element.removeEventListener('pointerup', end)
    element.removeEventListener('pointercancel', end)
    element.removeEventListener('lostpointercapture', end)
    window.removeEventListener('pointerup', end, true)
    activePointer = null
  }

  const beginPointer = (element, event, { move, end }) => {
    if (event.button !== 0 || activePointer) return
    event.preventDefault()
    element.setPointerCapture(event.pointerId)
    const id = event.pointerId
    const pointerMove = (next) => {
      if (next.pointerId === id) move(next)
    }
    const pointerEnd = (next) => {
      if (next.pointerId !== id) return
      removeActivePointerListeners()
      end(next)
    }
    activePointer = { element, move: pointerMove, end: pointerEnd }
    element.addEventListener('pointermove', pointerMove)
    element.addEventListener('pointerup', pointerEnd)
    element.addEventListener('pointercancel', pointerEnd)
    element.addEventListener('lostpointercapture', pointerEnd)
    window.addEventListener('pointerup', pointerEnd, true)
  }

  const onBarPointerDown = (event) => {
    const startX = event.clientX
    const startY = event.clientY
    let moved = false
    let state = null
    beginPointer(bar, event, {
      move(next) {
        const dx = next.clientX - startX
        const dy = next.clientY - startY
        if (!moved) {
          if (Math.abs(dx) < FLOAT_DRAG_THRESHOLD && Math.abs(dy) < FLOAT_DRAG_THRESHOLD) return
          moved = true
          setFloatingMode(true)
          const rect = parent.getBoundingClientRect()
          state = {
            x: rect.left,
            y: rect.top,
            startX: rect.left,
            startY: rect.top,
            targetX: rect.left + dx,
            targetY: rect.top + dy,
            width: rect.width,
            height: rect.height,
            vx: 0,
            vy: 0,
            mass: Math.min(1.5, Math.max(1, Math.sqrt(rect.width * rect.height / 24000))),
            dragging: true,
          }
          startFloatTicker(state)
        }
        // Mantener el destino relativo al punto inicial del gesto; usar la
        // posición ya interpolada aquí acumula el delta y hace que el panel
        // se acelere y se despegue del puntero.
        state.targetX = state.startX + dx
        state.targetY = state.startY + dy
      },
      end() {
        if (!moved) {
          if (isFloating.value) dockFloatingModal()
          else {
            setFloatingMode(true)
            saveFloatingBounds()
          }
          return
        }
        if (!state) return
        state.dragging = false
      },
    })
  }

  const cornerPointerDown = (corner) => (event) => {
    if (!isFloating.value) return
    const startX = event.clientX
    const startY = event.clientY
    const direction = corner.dataset.floatCorner
    const fromLeft = direction.endsWith('l')
    const fromTop = direction.startsWith('t')
    let start = null
    let resized = false
    beginPointer(corner, event, {
      move(next) {
        const dx = next.clientX - startX
        const dy = next.clientY - startY
        if (!resized) {
          if (Math.abs(dx) < FLOAT_DRAG_THRESHOLD && Math.abs(dy) < FLOAT_DRAG_THRESHOLD) return
          resized = true
          setFloatingMode(true)
          start = parent.getBoundingClientRect()
        }
        const width = Math.min(window.innerWidth - FLOAT_MARGIN * 2, Math.max(FLOAT_MIN_WIDTH, start.width + (fromLeft ? -dx : dx)))
        const height = Math.min(window.innerHeight - FLOAT_MARGIN * 2, Math.max(FLOAT_MIN_HEIGHT, start.height + (fromTop ? -dy : dy)))
        applyFloatingBounds({
          left: fromLeft ? start.right - width : start.left,
          top: fromTop ? start.bottom - height : start.top,
          width,
          height,
        })
      },
      end() {
        if (resized) saveFloatingBounds()
      },
    })
  }

  const onViewportResize = () => {
    if (window.innerWidth < 680) {
      viewportWasMobile = true
      stopFloatTicker()
      setFloatingMode(false)
      Object.assign(parent.style, {
        position: 'absolute',
        top: '0px',
        bottom: 'unset',
        left: '0px',
        right: 'unset',
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`,
      })
      Object.assign(windowEl.value.style, {
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`,
        minWidth: `${window.innerWidth}px`,
        minHeight: `${window.innerHeight}px`,
        maxWidth: 'none',
        maxHeight: `${window.innerHeight}px`,
      })
      return
    }
    if (viewportWasMobile) {
      viewportWasMobile = false
      const width = Math.min(400, window.innerWidth - FLOAT_MARGIN * 2)
      const height = Math.min(window.innerHeight * 0.8, window.innerHeight - FLOAT_MARGIN * 2)
      const docked = clampFloatingBounds({
        top: window.innerHeight - height - FLOAT_MARGIN,
        left: window.innerWidth - width - FLOAT_MARGIN,
        width,
        height,
      })
      dockedBounds = docked
      Object.assign(windowEl.value.style, {
        width: `${docked.width}px`,
        height: `${docked.height}px`,
        minWidth: `${docked.width}px`,
        minHeight: `${docked.height}px`,
        maxWidth: '400px',
        maxHeight: `${docked.height}px`,
      })
      const savedBounds = readSavedFloatingBounds()
      if (savedBounds) {
        applyFloatingBounds(savedBounds)
        setFloatingMode(true)
      } else {
        applyFloatingBounds(docked)
        setFloatingMode(false)
      }
      return
    }
    if (isFloating.value) applyFloatingBounds(parent.getBoundingClientRect())
    else if (props.placement === 'bottom-right' || props.placement === 'agent-chat') {
      const rect = parent.getBoundingClientRect()
      const next = clampFloatingBounds({
        ...rect.toJSON(),
        top: window.innerHeight - rect.height - FLOAT_MARGIN,
        left: window.innerWidth - rect.width - FLOAT_MARGIN,
      })
      applyFloatingBounds(next)
      dockedBounds = next
    }
  }

  bar.addEventListener('pointerdown', onBarPointerDown)
  const cornerHandlers = corners.map((corner) => {
    const handler = cornerPointerDown(corner)
    corner.addEventListener('pointerdown', handler)
    return () => corner.removeEventListener('pointerdown', handler)
  })
  window.addEventListener('resize', onViewportResize)
  floatDragCleanup = () => {
    stopFloatTicker()
    removeActivePointerListeners()
    bar.removeEventListener('pointerdown', onBarPointerDown)
    cornerHandlers.forEach((remove) => remove())
    window.removeEventListener('resize', onViewportResize)
    floatDragCleanup = null
  }
}

function dockFloatingModal() {
  const parent = container.value
  const panel = windowEl.value
  if (!parent || !panel || !isFloating.value || !dockedBounds) return
  stopFloatTicker()
  const from = parent.getBoundingClientRect()
  const to = clampFloatingBounds(dockedBounds)
  const geometry = { top: from.top, left: from.left, width: from.width, height: from.height }
  floatDockTween?.kill()
  floatDockTween = gsap.to(geometry, {
    top: to.top,
    left: to.left,
    width: to.width,
    height: to.height,
    duration: 0.45,
    ease: 'power2.out',
    onUpdate: () => applyFloatingBounds(geometry),
    onComplete: () => {
      floatDockTween = null
      setFloatingMode(false)
      try {
        const key = floatingStorageKey()
        if (key) window.localStorage.removeItem(key)
      } catch {
        // El acoplamiento no depende del almacenamiento.
      }
    },
  })
}

function cubicBezier(x1, y1, x2, y2) {
  const sample = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3
  const slope = (t, a, b) => 3 * (1 - t) ** 2 * a + 6 * (1 - t) * t * (b - a) + 3 * t ** 2 * (1 - b)
  return (x) => {
    if (x <= 0 || x >= 1) return x
    let t = x
    for (let i = 0; i < 8; i += 1) {
      const error = sample(t, x1, x2) - x
      const derivative = slope(t, x1, x2)
      if (Math.abs(error) < 1e-6 || Math.abs(derivative) < 1e-6) break
      const next = t - error / derivative
      if (next < 0 || next > 1) break
      t = next
    }
    let low = 0
    let high = 1
    for (let i = 0; i < 16 && Math.abs(sample(t, x1, x2) - x) >= 1e-6; i += 1) {
      if (sample(t, x1, x2) < x) low = t
      else high = t
      t = (low + high) / 2
    }
    return sample(t, y1, y2)
  }
}

const liquidSizeEase = cubicBezier(0.8, 0.3, 0.5, 0.8)

// Mismo integrador por frame del N8 del JS de referencia. La energía de
// apertura se aplica solo a la posición; el cierre arranca sin impulso.
function animateLiquidState(state, target, tracks, onUpdate) {
  const channels = Object.entries(target).map(([key, destination]) => {
    const config = tracks[key]
    const channel = {
      key,
      current: state[key],
      origin: state[key],
      target: destination,
      velocity: 0,
      elapsed: 0,
      active: true,
      config,
    }
    if (config.type === 'spring' && config.velocity) {
      const direction = config.direction !== undefined
        ? Math.sign(config.direction)
        : Math.sign(destination - channel.current)
      channel.velocity = Math.abs(config.velocity) * direction
    }
    return channel
  })
  let frame = 0
  let lastTime = 0
  let cancelled = false

  const tick = (timestamp) => {
    if (cancelled) return
    const delta = Math.max(0, (timestamp - lastTime) / 1000)
    lastTime = timestamp
    let active = false

    for (const channel of channels) {
      if (!channel.active) continue
      const { config } = channel
      if (config.type === 'spring') {
        const seconds = Math.min(0.064, delta)
        const steps = Math.max(1, Math.ceil(seconds / (1 / 60)))
        const step = seconds / steps
        for (let i = 0; i < steps; i += 1) {
          const displacement = channel.current - channel.target
          const acceleration = (-config.stiffness * displacement - config.damping * channel.velocity) / (config.mass || 1)
          channel.velocity += acceleration * step
          channel.current += channel.velocity * step
        }
        if (Math.abs(channel.velocity) <= (config.restSpeed ?? 0.01) && Math.abs(channel.target - channel.current) <= (config.restDelta ?? 0.01)) {
          channel.current = channel.target
          channel.velocity = 0
          channel.active = false
        }
      } else {
        channel.elapsed += delta
        const progress = Math.min(1, channel.elapsed / config.duration)
        channel.current = channel.origin + (channel.target - channel.origin) * config.ease(progress)
        if (progress >= 1) {
          channel.current = channel.target
          channel.active = false
        }
      }
      state[channel.key] = channel.current
      active ||= channel.active
    }
    onUpdate()
    if (active) frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame((timestamp) => {
    lastTime = timestamp
    frame = requestAnimationFrame(tick)
  })
  return () => {
    cancelled = true
    if (frame) cancelAnimationFrame(frame)
  }
}

function cleanupLiquidOpen() {
  if (liquidOpenTimer !== null) {
    clearTimeout(liquidOpenTimer)
    liquidOpenTimer = null
  }
  if (liquidOpenTweens.length) {
    gsap.killTweensOf(liquidOpenTweens)
    liquidOpenTweens = []
  }
  liquidOpenMotionCancel?.()
  liquidOpenMotionCancel = null
  liquidOpenLayer?.remove()
  liquidOpenLayer = null
  if (backdrop.value && backdropInlineZIndex !== null) {
    if (backdropInlineZIndex.value) {
      backdrop.value.style.setProperty(
        'z-index',
        backdropInlineZIndex.value,
        backdropInlineZIndex.priority,
      )
    } else backdrop.value.style.removeProperty('z-index')
    backdropInlineZIndex = null
  }
}

function cleanupLiquidClose() {
  if (liquidCloseTimer !== null) {
    clearTimeout(liquidCloseTimer)
    liquidCloseTimer = null
  }
  if (liquidCloseTweens.length) {
    gsap.killTweensOf(liquidCloseTweens)
    liquidCloseTweens = []
  }
  liquidCloseMotionCancel?.()
  liquidCloseMotionCancel = null
  liquidCloseLayer?.remove()
  liquidCloseLayer = null
}

function restoreLiquidOrigin(origin) {
  if (!origin || !originInlineStyles) return
  origin.style.opacity = originInlineStyles.opacity
  origin.style.pointerEvents = originInlineStyles.pointerEvents
  origin.style.transition = originInlineStyles.transition
  originInlineStyles = null
}

function findSharedItem(root, name) {
  if (!root) return null
  return [...root.querySelectorAll('[data-shared-item]')].find(
    (element) => element.getAttribute('data-shared-item').split(/\s+/).includes(name),
  ) || null
}

function clearSharedFlights() {
  for (const flight of sharedFlights) {
    gsap.killTweensOf(flight.clone)
    flight.clone.remove()
    flight.target.style.visibility = flight.previousVisibility
    flight.source.style.opacity = flight.previousOpacity
    flight.source.style.pointerEvents = flight.previousPointerEvents
    flight.source.style.transition = flight.previousTransition
    flight.source.style.translate = flight.previousTranslate
    flight.source.style.rotate = flight.previousRotate
    flight.source.style.scale = flight.previousScale
  }
  sharedFlights = []
}

function animateSharedItems(fromRoot, toRoot, duration) {
  clearSharedFlights()

  const names = props.sharedItems.split(/\s+/).filter(Boolean)
  for (const name of names) {
    const source = findSharedItem(fromRoot, name)
    const target = findSharedItem(toRoot, name)
    if (!source || !target || source.textContent.trim() !== target.textContent.trim()) continue

    const from = source.getBoundingClientRect()
    const to = target.getBoundingClientRect()
    if (!from.width || !from.height || !to.width || !to.height) continue

    const style = window.getComputedStyle(source)
    const clone = source.cloneNode(true)
    const isIcon = source.tagName.toLowerCase() === 'md-icon'
    const destinationStyle = isIcon ? window.getComputedStyle(target) : null
    clone.removeAttribute('data-shared-item')
    clone.setAttribute('aria-hidden', 'true')
    Object.assign(clone.style, {
      position: 'fixed',
      // md-icon y span son inline de forma predeterminada. GSAP no puede
      // aplicar el FLIP geométrico de forma fiable sobre un inline no reemplazado.
      display: isIcon ? 'inline-flex' : 'block',
      alignItems: isIcon ? 'center' : '',
      justifyContent: isIcon ? 'center' : '',
      boxSizing: 'border-box',
      top: `${from.top}px`,
      left: `${from.left}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
      margin: '0',
      // El icono compartido adopta desde el primer frame el color del destino
      // en ambos sentidos: modal al abrir y botón al cerrar.
      color: isIcon ? destinationStyle.color : style.color,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      fontVariationSettings: style.fontVariationSettings,
      textTransform: style.textTransform,
      whiteSpace: 'nowrap',
      opacity: '1',
      pointerEvents: 'none',
      transition: 'none',
      transformOrigin: 'top left',
      willChange: 'transform',
      // Los backdrops de los modales usan z-index: 10000. La copia debe
      // quedar por encima de esa capa o desaparece durante todo el recorrido.
      zIndex: '10001',
    })
    const iconSize = style.getPropertyValue('--md-icon-size')
    if (iconSize) clone.style.setProperty('--md-icon-size', iconSize)
    document.body.append(clone)

    const flight = {
      clone,
      source,
      target,
      previousVisibility: target.style.visibility,
      previousOpacity: source.style.opacity,
      previousPointerEvents: source.style.pointerEvents,
      previousTransition: source.style.transition,
      previousTranslate: source.style.translate,
      previousRotate: source.style.rotate,
      previousScale: source.style.scale,
    }
    sharedFlights.push(flight)
    // Mantener el nodo real en su sitio, pero dejar que la copia sea la única
    // representación visible durante el recorrido compartido.
    source.style.translate = 'none'
    source.style.rotate = 'none'
    source.style.scale = 'none'
    source.style.transition = 'opacity 80ms'
    source.style.opacity = '0'
    source.style.pointerEvents = 'none'
    target.style.visibility = 'hidden'

    gsap.to(clone, {
      x: to.left - from.left,
      y: to.top - from.top,
      scaleX: to.width / from.width,
      scaleY: to.height / from.height,
      duration,
      ease: customEase,
      onComplete() {
        clone.remove()
        target.style.visibility = flight.previousVisibility
        source.style.opacity = flight.previousOpacity
        source.style.pointerEvents = flight.previousPointerEvents
        source.style.transition = flight.previousTransition
        source.style.translate = flight.previousTranslate
        source.style.rotate = flight.previousRotate
        source.style.scale = flight.previousScale
        sharedFlights = sharedFlights.filter((item) => item !== flight)
      },
    })
  }
}

function computedBox(el) {
  const cs = window.getComputedStyle(el)
  return {
    borderRadius: cs.borderRadius,
    background: cs.background,
    boxShadow: cs.boxShadow,
  }
}

function resolveCssValue(property, value) {
  if (!value || !value.includes('var(')) return value
  const probe = document.createElement('div')
  probe.style[property] = value
  document.body.append(probe)
  const resolved = window.getComputedStyle(probe)[property]
  probe.remove()
  return resolved || value
}

function openLiquidFromOrigin(origin, onComplete) {
  const F = backdrop.value
  const U = container.value
  const X = windowEl.value
  const from = origin.getBoundingClientRect()
  const to = U?.getBoundingClientRect()
  if (!F || !U || !X || !from.width || !from.height || !to?.width || !to.height) {
    onComplete()
    return
  }

  const sourceStyle = window.getComputedStyle(origin)
  const sourceLook = { ...computedBox(origin), ...props.liquidOriginStyle }
  sourceLook.background = resolveCssValue('background', sourceLook.background)
  const targetStyle = window.getComputedStyle(X)
  const targetLook = computedBox(X)
  const savedWindowStyles = {
    position: X.style.position,
    top: X.style.top,
    left: X.style.left,
    width: X.style.width,
    height: X.style.height,
    transform: X.style.transform,
    transformOrigin: X.style.transformOrigin,
    filter: X.style.filter,
    opacity: X.style.opacity,
    overflow: X.style.overflow,
  }
  const savedZIndex = {
    value: F.style.getPropertyValue('z-index'),
    priority: F.style.getPropertyPriority('z-index'),
  }
  const sourceRadius = Number.parseFloat(sourceLook.borderRadius) || 0
  const targetRadius = Number.parseFloat(targetLook.borderRadius) || 0
  const geometry = {
    top: from.top,
    left: from.left,
    width: from.width,
    height: from.height,
    radius: sourceRadius,
    contentScale: 2,
    contentBlur: 8,
  }

  const gooLayer = document.createElement('div')
  const originBlob = document.createElement('div')
  const panelBlob = document.createElement('div')
  Object.assign(gooLayer.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10001',
    pointerEvents: 'none',
    filter: 'url(#liquidModalGoo)',
    overflow: 'hidden',
  })
  Object.assign(originBlob.style, {
    position: 'absolute',
    top: `${from.top}px`,
    left: `${from.left}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    borderRadius: `${sourceRadius}px`,
    background: sourceStyle.backgroundColor,
    pointerEvents: 'none',
  })
  Object.assign(panelBlob.style, {
    position: 'absolute',
    top: `${from.top}px`,
    left: `${from.left}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    borderRadius: `${sourceRadius}px`,
    background: sourceStyle.backgroundColor,
    pointerEvents: 'none',
    willChange: 'top, left, width, height, border-radius, background',
  })
  gooLayer.append(originBlob, panelBlob)
  document.body.append(gooLayer)
  liquidOpenLayer = gooLayer

  // Mantiene el goo por encima de la vista y por debajo del nuevo modal.
  // La capa vuelve a su z-index CSS original al completar o interrumpir.
  backdropInlineZIndex = savedZIndex
  F.style.setProperty('z-index', '10002', 'important')
  gsap.set(F, { opacity: 1 })
  Object.assign(U.style, {
    position: 'absolute',
    top: `${from.top}px`,
    left: `${from.left}px`,
    right: 'unset',
    bottom: 'unset',
    width: `${from.width}px`,
    height: `${from.height}px`,
    borderRadius: `${sourceRadius}px`,
    background: sourceLook.background,
    boxShadow: sourceLook.boxShadow,
    overflow: 'hidden',
    zIndex: '1',
  })
  Object.assign(X.style, {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: `${to.width}px`,
    height: `${to.height}px`,
    minWidth: `${to.width}px`,
    minHeight: `${to.height}px`,
    maxHeight: `${to.height}px`,
    transform: 'scale(2)',
    transformOrigin: 'center center',
    filter: 'blur(8px)',
    opacity: '0',
    overflow: 'hidden',
  })
  // El origen permanece oculto mientras Configuración está encima; el cierre
  // líquido lo restaura junto con su estilo de transición original.
  origin.style.transition = 'opacity 160ms ease'
  origin.style.opacity = '0'
  origin.style.pointerEvents = 'none'

  const paintGeometry = () => {
    const top = `${geometry.top}px`
    const left = `${geometry.left}px`
    const width = `${geometry.width}px`
    const height = `${geometry.height}px`
    const radius = `${geometry.radius}px`
    Object.assign(U.style, { top, left, width, height, borderRadius: radius })
    Object.assign(panelBlob.style, { top, left, width, height, borderRadius: radius })
    X.style.transform = `scale(${geometry.contentScale})`
    X.style.filter = `blur(${geometry.contentBlur}px)`
  }

  gsap.to(U, {
    background: targetLook.background,
    boxShadow: targetLook.boxShadow,
    duration: 0.4,
    delay: 0.15,
    ease: 'power2.out',
  })
  gsap.to(panelBlob, {
    background: targetStyle.backgroundColor,
    duration: 0.4,
    delay: 0.15,
    ease: 'power2.out',
  })
  gsap.to(originBlob, { opacity: 0, duration: 0.25, delay: 0.05, ease: 'power2.out' })
  gsap.to(X, {
    opacity: 1,
    duration: 0.4,
    delay: 0.15,
    ease: 'power2.out',
  })
  const energy = 2400
  const originCenterX = from.left + from.width / 2
  const originCenterY = from.top + from.height / 2
  liquidOpenMotionCancel = animateLiquidState(
    geometry,
    { top: to.top, left: to.left, width: to.width, height: to.height, radius: targetRadius, contentScale: 1, contentBlur: 0 },
    {
      top: { type: 'spring', stiffness: 144, damping: 14, velocity: energy, direction: originCenterY < window.innerHeight / 2 ? 1 : -1 },
      left: { type: 'spring', stiffness: 144, damping: 14, velocity: energy, direction: originCenterX < window.innerWidth / 2 ? 1 : -1 },
      width: { type: 'easing', duration: 0.3, ease: liquidSizeEase },
      height: { type: 'easing', duration: 0.3, ease: liquidSizeEase },
      radius: { type: 'easing', duration: 0.7, ease: (value) => 1 - (1 - value) ** 2 },
      contentScale: { type: 'easing', duration: 0.3, ease: (value) => 1 - (1 - value) ** 2 },
      contentBlur: { type: 'easing', duration: 0.3, ease: (value) => 1 - (1 - value) ** 2 },
    },
    paintGeometry,
  )
  liquidOpenTweens = [U, X, originBlob, panelBlob, geometry]
  liquidOpenTimer = window.setTimeout(() => {
    liquidOpenTimer = null
    liquidOpenMotionCancel?.()
    liquidOpenMotionCancel = null
    cleanupLiquidOpen()
    Object.assign(U.style, {
      top: `${to.top}px`,
      left: `${to.left}px`,
      width: `${to.width}px`,
      height: `${to.height}px`,
      borderRadius: targetLook.borderRadius,
      background: targetLook.background,
      boxShadow: targetLook.boxShadow,
      overflow: '',
      zIndex: '',
    })
    Object.assign(X.style, {
      position: savedWindowStyles.position,
      top: savedWindowStyles.top,
      left: savedWindowStyles.left,
      width: savedWindowStyles.width,
      height: savedWindowStyles.height,
      transform: savedWindowStyles.transform,
      transformOrigin: savedWindowStyles.transformOrigin,
      filter: savedWindowStyles.filter || 'none',
      opacity: savedWindowStyles.opacity || '1',
      overflow: savedWindowStyles.overflow,
    })
    onComplete()
  }, 1400)
}

function closeLiquidToOrigin(origin, onComplete) {
  const F = backdrop.value
  const U = container.value
  const X = windowEl.value
  const from = U?.getBoundingClientRect()
  const to = origin.getBoundingClientRect()
  if (!F || !U || !X || !from.width || !from.height || !to.width || !to.height) {
    restoreLiquidOrigin(origin)
    onComplete()
    return
  }

  const originStyle = window.getComputedStyle(origin)
  const originRestore = originInlineStyles
  const containerStyle = window.getComputedStyle(U)
  const windowStyle = window.getComputedStyle(X)
  // El override de origen define la superficie de entrada del modal. Al
  // cerrar, el morph debe volver al aspecto real del control (p. ej. un
  // botón transparente de Opciones), conservando solo el radio intencional.
  const originLook = computedBox(origin)
  if (props.liquidOriginStyle?.borderRadius) {
    originLook.borderRadius = props.liquidOriginStyle.borderRadius
  }
  originLook.background = resolveCssValue('background', originLook.background)
  const gooLayer = document.createElement('div')
  const originBlob = document.createElement('div')
  const panelBlob = document.createElement('div')
  Object.assign(gooLayer.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '10001',
    pointerEvents: 'none',
    filter: 'url(#liquidModalGoo)',
    overflow: 'hidden',
  })
  Object.assign(panelBlob.style, {
    position: 'absolute',
    top: `${from.top}px`,
    left: `${from.left}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    borderRadius: containerStyle.borderRadius,
    background: windowStyle.backgroundColor,
  })
  Object.assign(originBlob.style, {
    position: 'absolute',
    top: `${to.top}px`,
    left: `${to.left}px`,
    width: `${to.width}px`,
    height: `${to.height}px`,
    borderRadius: originStyle.borderRadius,
    background: originStyle.backgroundColor,
    opacity: '0',
  })
  gooLayer.append(originBlob, panelBlob)
  document.body.append(gooLayer)
  liquidCloseLayer = gooLayer

  const targetRadius = Number.parseFloat(originLook.borderRadius) || 0
  const startRadius = Number.parseFloat(containerStyle.borderRadius) || 0
  const startScale = Number(gsap.getProperty(X, 'scaleX')) || 1
  const animation = {
    top: from.top,
    left: from.left,
    width: from.width,
    height: from.height,
    radius: startRadius,
    contentScale: startScale,
    contentBlur: 0,
    contentOpacity: 1,
  }
  const paintGeometry = () => {
    const top = `${animation.top}px`
    const left = `${animation.left}px`
    const width = `${animation.width}px`
    const height = `${animation.height}px`
    const radius = `${animation.radius}px`
    Object.assign(U.style, { top, left, width, height, borderRadius: radius })
    Object.assign(panelBlob.style, { top, left, width, height, borderRadius: radius })
    X.style.transform = `scale(${animation.contentScale})`
    X.style.filter = `blur(${animation.contentBlur}px)`
    X.style.opacity = String(animation.contentOpacity)
  }

  gsap.set(F, { opacity: 1 })
  F.style.pointerEvents = 'none'
  Object.assign(U.style, {
    position: 'absolute',
    top: `${from.top}px`,
    left: `${from.left}px`,
    right: 'unset',
    bottom: 'unset',
    width: `${from.width}px`,
    height: `${from.height}px`,
    borderRadius: `${startRadius}px`,
    overflow: 'hidden',
  })
  Object.assign(X.style, {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: `${from.width}px`,
    height: `${from.height}px`,
    minWidth: `${from.width}px`,
    minHeight: `${from.height}px`,
    maxWidth: `${from.width}px`,
    maxHeight: `${from.height}px`,
    transformOrigin: startScale === 1 ? 'center center' : '0 0',
    filter: 'blur(0px)',
    opacity: '1',
  })
  origin.style.pointerEvents = originRestore?.pointerEvents ?? ''
  // La transición que oculta el botón en la apertura no debe competir con
  // GSAP durante el fade de retorno: ambas escrituras dejan una opacidad
  // intermedia pegada en el estilo inline.
  origin.style.transition = 'none'
  paintGeometry()

  gsap.to(U, {
    background: originLook.background,
    boxShadow: originLook.boxShadow,
    duration: 0.3,
    ease: 'power2.out',
  })
  gsap.to(panelBlob, {
    background: originLook.background,
    duration: 0.3,
    ease: 'power2.out',
  })
  gsap.to(origin, {
    opacity: originRestore?.computedOpacity ?? 1,
    duration: 0.3,
    delay: 0.2,
    ease: 'power2.out',
  })
  gsap.to(originBlob, { opacity: 1, duration: 0.3, delay: 0.2, ease: 'power2.out' })
  liquidCloseMotionCancel = animateLiquidState(
    animation,
    { top: to.top, left: to.left, width: to.width, height: to.height, radius: targetRadius, contentScale: 2, contentBlur: 8, contentOpacity: 0 },
    {
      top: { type: 'spring', stiffness: 130, damping: 18 },
      left: { type: 'spring', stiffness: 130, damping: 18 },
      width: { type: 'easing', duration: 0.25, ease: (value) => 1 - (1 - value) ** 2 },
      height: { type: 'easing', duration: 0.25, ease: (value) => 1 - (1 - value) ** 2 },
      radius: { type: 'easing', duration: 0.25, ease: (value) => 1 - (1 - value) ** 2 },
      contentScale: { type: 'easing', duration: 0.3, ease: (value) => 1 - (1 - value) ** 2 },
      contentBlur: { type: 'easing', duration: 0.3, ease: (value) => 1 - (1 - value) ** 2 },
      contentOpacity: { type: 'spring', stiffness: 137, damping: 20 },
    },
    paintGeometry,
  )
  gsap.to(F, { opacity: 0, duration: 0.5, ease: 'power3.in' })

  liquidCloseTweens = [U, X, F, origin, originBlob, panelBlob, animation]
  liquidCloseTimer = window.setTimeout(() => {
    liquidCloseTimer = null
    liquidCloseMotionCancel?.()
    liquidCloseMotionCancel = null
    cleanupLiquidClose()
    restoreLiquidOrigin(origin)
    onComplete()
  }, 1100)
}

function openAnimation() {
  const F = backdrop.value
  const X = container.value
  const G = windowEl.value
  const z = props.origin
  if (!F || !X || !G) return

  // Sin boton de origen no hay nada que morfear: entrada simple.
    if (!z || !z.isConnected) {
      gsap.set(F, { opacity: 1 })
      gsap.from(G, {
        opacity: 0,
        scale: 0.92,
        duration: 0.45,
        ease: customEase,
        onComplete: enableFloatingInteractions,
      })
      return
  }

  const flipId = `flip-animate-${++flipCounter}`
  const savedOverflow = G.style.overflow
  G.style.overflow = 'hidden'
  G.setAttribute('data-flip-id', flipId)
  X.setAttribute('data-flip-id', flipId)
  z.setAttribute('data-flip-id', flipId)

  const buttonState = Flip.getState(z)
  const look = computedBox(z)
  originInlineStyles = props.liquidAnimation
    ? {
        opacity: z.style.opacity,
        computedOpacity: Number(window.getComputedStyle(z).opacity) || 1,
        pointerEvents: z.style.pointerEvents,
        transition: z.style.transition,
      }
    : null
  const bounds = buttonState.elementStates[0].bounds

  Object.assign(X.style, {
    position: 'absolute',
    borderRadius: look.borderRadius,
    background: look.background,
    boxShadow: look.boxShadow,
    width: `${z.offsetWidth}px`,
    height: `${z.offsetHeight}px`,
    top: `${bounds.top}px`,
    bottom: `${bounds.bottom}px`,
    left: `${bounds.left}px`,
    right: `${bounds.right}px`,
  })
  X.getBoundingClientRect() // fuerza reflow
  const containerState = Flip.getState(X)
  X.removeAttribute('style')
  Object.assign(X.style, {
    background: look.background,
    borderRadius: look.borderRadius,
    boxShadow: look.boxShadow,
  })

  requestAnimationFrame(() => {
    const windowState = Flip.getState(G)
    const wBounds = windowState.elementStates[0].bounds
    const isMobile = window.innerWidth < 680
    const hasIncreased = G.classList.contains('increased')
    const isLeftPlacement = props.placement === 'left'
    const isMobileActionsPlacement = props.placement === 'mobile-actions'
    const isAgentPanelPlacement = props.placement === 'agent-panel'
    const isAgentChatPlacement = props.placement === 'agent-chat'
    const isCenteredPlacement = props.placement === 'center'
    const agentPanelBounds = isAgentPanelPlacement
      ? z.closest('.modal-window')?.getBoundingClientRect()
      : null
    const isSidePanel =
      G.classList.contains('side-panel') ||
      props.placement === 'bottom-right' ||
      isAgentChatPlacement
    const isCenteredSidePanel = G.classList.contains('side-panel-centered')
    const isBottomAnchoredSidePanel =
      G.classList.contains('side-panel-bottom') ||
      props.placement === 'bottom-right' ||
      isAgentChatPlacement

    Object.assign(X.style, {
      width: `${wBounds.width}px`,
      height: `${wBounds.height}px`,
      background: window.getComputedStyle(G).background,
      borderRadius: window.getComputedStyle(G).borderRadius,
    })
    Object.assign(G.style, {
      minWidth: `${wBounds.width}px`,
      minHeight: `${wBounds.height}px`,
      maxHeight: `${wBounds.height}px`,
    })

    if (props.placement || !(isMobile && hasIncreased)) {
      const padding = isCenteredPlacement && isMobile ? 0 : isMobile ? 16 : 8
      const centerX = bounds.left + (bounds.right - bounds.left) / 2
      const centerY = bounds.top + (bounds.bottom - bounds.top) / 2
      const nextControl = isLeftPlacement ? z.nextElementSibling : null
      const nextControlBounds = nextControl?.getBoundingClientRect()
      const left = isAgentPanelPlacement && agentPanelBounds
        ? Math.max(
            padding,
            Math.min(agentPanelBounds.left, window.innerWidth - wBounds.width - padding),
          )
        : isMobileActionsPlacement
        ? Math.max(
            padding,
            window.innerWidth - wBounds.width - padding,
          )
        : isCenteredPlacement
        ? Math.max(padding, (window.innerWidth - wBounds.width) / 2)
        : isLeftPlacement
        ? Math.max(
            padding,
            Math.min(
              (nextControlBounds?.width ? nextControlBounds.left : bounds.right + 8) - wBounds.width,
              window.innerWidth - wBounds.width - padding,
            ),
          )
        : isAgentChatPlacement && isMobile
          ? 0
        : isSidePanel
          ? Math.max(padding, window.innerWidth - wBounds.width - padding)
          : Math.max(
              padding,
              Math.min(centerX - wBounds.width / 2, window.innerWidth - wBounds.width - padding),
            )
      const top = isAgentPanelPlacement && agentPanelBounds
        ? Math.max(
            padding,
            Math.min(agentPanelBounds.top, window.innerHeight - wBounds.height - padding),
          )
        : isMobileActionsPlacement
        ? 16
        : isAgentChatPlacement && isMobile
        ? 0
        : isCenteredPlacement
        ? Math.max(padding, (window.innerHeight - wBounds.height) / 2)
        : isSidePanel
        ? isBottomAnchoredSidePanel
          ? props.placement === 'bottom-right' || isAgentChatPlacement
            ? Math.max(padding, window.innerHeight - wBounds.height - padding)
            : Math.max(
                padding,
                Math.min(
                  bounds.bottom - wBounds.height,
                  window.innerHeight - wBounds.height - padding,
                ),
              )
          : isCenteredSidePanel
            ? Math.max(padding, (window.innerHeight - wBounds.height) / 2)
            : padding
        : Math.max(
            padding,
            Math.min(centerY - wBounds.height / 2, window.innerHeight - wBounds.height - padding),
          )
      Object.assign(X.style, {
        position: 'absolute',
        top: `${Math.round(top)}px`,
        bottom: 'unset',
        left: `${Math.round(left)}px`,
        right: 'unset',
      })
      X.classList.add('modal-position-absolute')
    }

    G.getBoundingClientRect()

    if (props.liquidAnimation) {
      openLiquidFromOrigin(z, () => {
        G.style.overflow = savedOverflow
      })
      return
    }

    // Los elementos compartidos viajan en una capa independiente del panel:
    // así no reciben por segunda vez la transformación del FLIP exterior.
    animateSharedItems(z, G, 0.7)

    Flip.from(containerState, {
      targets: X,
      duration: 0.7,
      scale: false,
      absolute: false,
      ease: customEase,
      onStart() {
        gsap.from(X, { duration: 0.3, ease: customEase, ...look })
      },
    })

    Flip.from(buttonState, {
      targets: G,
      duration: 0.7,
      ease: customEase,
      scale: true,
      absolute: false,
      onStart() {
        gsap.set(F, { opacity: 1 })
        z.style.transition = 'opacity 160ms ease'
        z.style.opacity = '0'
        z.style.pointerEvents = 'none'
        gsap.from(G, {
          opacity: 0,
          duration: 0.7,
          filter: 'blur(8px)',
          ease: customEase,
        })
      },
      onComplete() {
        G.style.overflow = savedOverflow
        enableFloatingInteractions()
      },
    })
  })
}

function closeAnimation() {
  if (closing) return
  closing = true
  floatDragCleanup?.()
  floatDockTween?.kill()
  floatDockTween = null

  const F = backdrop.value
  const X = windowEl.value
  const U = container.value
  const k = props.origin
  const isAgentChat = Boolean(X?.querySelector('.chat[data-v-f0318d9e]'))
  const containerOnlyClose = isAgentChat || props.closeStrategy === 'container-only'

  clearSharedFlights()

  if (!F || !X || !U) {
    finishClose()
    return
  }

  F.style.pointerEvents = 'none'
  // El fondo del chat contiene blobs animados grandes. Mantener el recorte
  // durante el FLIP evita que se proyecten fuera del panel al reducirlo.
  X.style.overflow = 'hidden'

  if (!k || !k.isConnected) {
    gsap.to(F, { opacity: 0, duration: 0.3, ease: 'power3.in', onComplete: finishClose })
    return
  }

  if (props.liquidAnimation) {
    cleanupLiquidOpen()
    k.style.pointerEvents = ''
    closeLiquidToOrigin(k, finishClose)
    return
  }

  k.style.pointerEvents = ''
  gsap.to(k, { opacity: 1, duration: 0.3, delay: 0.2, ease: 'power2.out' })
  animateSharedItems(X, k, 0.5)

  const buttonState = Flip.getState(k)
  const containerState = Flip.getState(U)
  // El chat tiene un fondo animado compuesto por blobs grandes. Capturar y
  // hacer FLIP también de esta ventana mientras U se contrae duplica la
  // transformación y deja esos blobs pintándose fuera del panel. Para él,
  // solo el contenedor exterior hace FLIP; la ventana acompaña su tamaño.
  const windowState = containerOnlyClose ? null : Flip.getState(X)
  const look = computedBox(k)
  const b = buttonState.elementStates[0].bounds

  Object.assign(U.style, {
    position: 'absolute',
    top: `${b.top}px`,
    left: `${b.left}px`,
    width: `${b.width}px`,
    height: `${b.height}px`,
  })
  Flip.from(containerState, {
    targets: U,
    duration: 0.5,
    ease: customEase,
    scale: false,
    absolute: false,
    onComplete: containerOnlyClose ? finishClose : undefined,
  })
  gsap.to(U, {
    background: look.background,
    borderRadius: look.borderRadius,
    boxShadow: look.boxShadow,
    duration: 0.5,
    ease: customEase,
  })

  if (containerOnlyClose) {
    Object.assign(X.style, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '100%',
      height: '100%',
      minWidth: '0px',
      minHeight: '0px',
      maxWidth: 'none',
      maxHeight: 'none',
      borderRadius: look.borderRadius,
    })
    gsap.to(X, { opacity: 0, duration: 0.3, ease: closeEase1 })
  } else {
    Object.assign(X.style, {
      position: 'absolute',
      // La ventana hija debe volver a coordenadas locales del contenedor.
      top: '0px',
      left: '0px',
      width: `${b.width}px`,
      height: `${b.height}px`,
      minWidth: `${b.width}px`,
      minHeight: `${b.height}px`,
      maxWidth: `${b.width}px`,
      maxHeight: `${b.height}px`,
    })
    Flip.from(windowState, {
      targets: X,
      duration: 2,
      ease: customEase,
      scale: true,
      absolute: true,
      onStart() {
        gsap.to(X, { duration: 0.5, ease: closeEase1, borderRadius: '400px' })
        gsap.to(X, { duration: 0.5, ease: closeEase2, filter: 'blur(32px)' })
        gsap.to(X, { opacity: 0, duration: 0.5, ease: closeEase1 })
      },
      onComplete() {
        finishClose()
      },
    })
  }
  gsap.to(F, { opacity: 0, duration: 0.5, ease: 'power3.in' })
}

function onBackdropClick(e) {
  if (props.closeOnBackdrop && e.target === backdrop.value) closeAnimation()
}

function handleEscape() {
  closeAnimation()
}

function unstack() {
  const i = stack.indexOf(handleEscape)
  if (i !== -1) stack.splice(i, 1)
}

function finishClose() {
  unstack()
  emit('close')
}

onMounted(() => {
  stack.push(handleEscape)
  nextTick(openAnimation)
})
onBeforeUnmount(() => {
  unstack()
  floatDragCleanup?.()
  stopFloatTicker()
  clearSharedFlights()
  cleanupLiquidOpen()
  cleanupLiquidClose()
  restoreLiquidOrigin(props.origin)
})

defineExpose({ close: closeAnimation })
</script>

<template>
  <Teleport to="body">
    <div
      ref="backdrop"
      data-v-c84aa51e
      class="modal-backdrop"
      :class="[backdropClass, { 'is-floating': isFloating }]"
      @click="onBackdropClick"
    >
      <div
        ref="container"
        data-v-c84aa51e
        class="modal-window-container"
        :class="{ 'is-floating': isFloating }"
      >
        <div
          ref="windowEl"
          data-v-c84aa51e
          class="modal-window"
          :class="[windowClass, { 'is-floating': isFloating }]"
          role="dialog"
          :aria-modal="isFloating ? 'false' : 'true'"
          tabindex="-1"
        >
          <div
            v-bind="contentScope"
            :class="contentClass"
            :style="contentHeight ? { height: contentHeight } : null"
          >
            <slot :close="closeAnimation" />
          </div>
        </div>
        <template v-if="floatable">
          <div class="modal-float-bar" data-float-bar aria-hidden="true">
            <span class="modal-float-bar-pill"></span>
          </div>
          <div
            v-for="corner in ['tl', 'tr', 'bl', 'br']"
            :key="corner"
            class="modal-float-corner"
            :data-float-corner="corner"
            aria-hidden="true"
          ></div>
        </template>
      </div>
    </div>
  </Teleport>
</template>
