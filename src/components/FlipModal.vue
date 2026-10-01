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

// Pila de modales abiertos: index.html cierra con Escape solo el de arriba
// (KEYBOARD SHORTCUTS, linea 6194). Se registra a nivel de modulo para que un
// unico listener sirva a todas las instancias.
const stack = []

function onKeydown(e) {
  if (e.key !== 'Escape') return
  const top = stack[stack.length - 1]
  if (top) {
    e.stopPropagation()
    top()
  }
}

if (typeof document !== 'undefined' && !document.__flipModalEsc) {
  document.__flipModalEsc = true
  document.addEventListener('keydown', onKeydown)
}

const backdrop = ref(null)
const container = ref(null)
const windowEl = ref(null)

let closing = false
let flipCounter = 0

function computedBox(el) {
  const cs = window.getComputedStyle(el)
  return {
    borderRadius: cs.borderRadius,
    background: cs.background,
    boxShadow: cs.boxShadow,
  }
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
    gsap.from(G, { opacity: 0, scale: 0.92, duration: 0.45, ease: customEase })
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
    const isSidePanel = G.classList.contains('side-panel')

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

    if (!(isMobile && hasIncreased)) {
      const padding = isMobile ? 16 : 8
      const centerX = bounds.left + (bounds.right - bounds.left) / 2
      const centerY = bounds.top + (bounds.bottom - bounds.top) / 2
      const left = isSidePanel
        ? Math.max(padding, window.innerWidth - wBounds.width - padding)
        : Math.max(
            padding,
            Math.min(centerX - wBounds.width / 2, window.innerWidth - wBounds.width - padding),
          )
      const top = isSidePanel
        ? padding
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
      },
    })
  })
}

function closeAnimation() {
  if (closing) return
  closing = true
  unstack()

  const F = backdrop.value
  const X = windowEl.value
  const U = container.value
  const k = props.origin

  if (!F || !X || !U) {
    emit('close')
    return
  }

  F.style.pointerEvents = 'none'

  if (!k || !k.isConnected) {
    gsap.to(F, { opacity: 0, duration: 0.3, ease: 'power3.in', onComplete: () => emit('close') })
    return
  }

  k.style.pointerEvents = ''
  gsap.to(k, { opacity: 1, duration: 0.3, delay: 0.2, ease: 'power2.out' })

  const buttonState = Flip.getState(k)
  const containerState = Flip.getState(U)
  const windowState = Flip.getState(X)
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
  })
  gsap.to(U, {
    background: look.background,
    borderRadius: look.borderRadius,
    boxShadow: look.boxShadow,
    duration: 0.5,
    ease: customEase,
  })

  Object.assign(X.style, {
    position: 'absolute',
    top: `${b.top}px`,
    left: `${b.left}px`,
    width: `${b.width}px`,
    height: `${b.height}px`,
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
      emit('close')
    },
  })
  gsap.to(F, { opacity: 0, duration: 0.5, ease: 'power3.in' })
}

function onBackdropClick(e) {
  if (props.closeOnBackdrop && e.target === backdrop.value) closeAnimation()
}

function unstack() {
  const i = stack.indexOf(closeAnimation)
  if (i !== -1) stack.splice(i, 1)
}

onMounted(() => {
  stack.push(closeAnimation)
  nextTick(openAnimation)
})
onBeforeUnmount(unstack)

defineExpose({ close: closeAnimation })
</script>

<template>
  <Teleport to="body">
    <div
      ref="backdrop"
      data-v-c84aa51e
      class="modal-backdrop"
      :class="backdropClass"
      @click="onBackdropClick"
    >
      <div ref="container" data-v-c84aa51e class="modal-window-container">
        <div
          ref="windowEl"
          data-v-c84aa51e
          class="modal-window"
          :class="windowClass"
          role="dialog"
          aria-modal="true"
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
      </div>
    </div>
  </Teleport>
</template>
