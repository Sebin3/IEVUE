<script setup>
/**
 * SelectFlip
 * Puerto de openSelectModal()/closeSelectModal() de index.html (4271-4625):
 * un input readonly que al pulsarse se "estira" hasta convertirse en una
 * ventanita con las opciones, y al elegir vuelve a colapsar sobre el input.
 *
 * El chevron/calendario/reloj se pasa por el slot `icon`; si no se pasa, se usa
 * el chevron que index.html pone en los selects (data-v-3020d431).
 */
import { ref, computed, nextTick } from 'vue'
import { gsap, Flip, customEase } from '../composables/useGsap'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  // [{ value, label }]. El label es lo que se pinta en el input.
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Selecciona una opción' },
  name: { type: String, default: '' },
  // Hash de scope del wrapper, tal como lo escribe index.html.
  scope: { type: String, default: '3020d431' },
  // index.html calcula el alto del popup: nº opciones * 48 + 16.
  optionHeight: { type: Number, default: 48 },
  width: { type: Number, default: 368 },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const inputEl = ref(null)
const open = ref(false)
const backdrop = ref(null)
const container = ref(null)
const windowEl = ref(null)

let closing = false
let flipCounter = 0

const scopeAttr = computed(() => ({ [`data-v-${props.scope}`]: '' }))

const label = computed(() => {
  const found = props.options.find((o) => String(o.value) === String(props.modelValue))
  return found ? found.label : props.modelValue || ''
})

// index.html oculta del listado la opcion ya seleccionada en el modal de estado;
// aqui se muestran todas y se marca la activa con `.selected`.
const popupHeight = computed(() => props.options.length * props.optionHeight + 16)

function look(el) {
  const cs = window.getComputedStyle(el)
  return {
    borderRadius: cs.borderRadius,
    background: cs.background,
    boxShadow: cs.boxShadow,
  }
}

async function openPopup() {
  if (props.disabled || open.value) return
  open.value = true
  closing = false
  await nextTick()

  const input = inputEl.value
  const F = backdrop.value
  const X = container.value
  const G = windowEl.value
  if (!input || !F || !X || !G) return

  const flipId = `flip-select-${++flipCounter}`
  input.setAttribute('data-flip-id', flipId)
  G.setAttribute('data-flip-id', flipId)
  X.setAttribute('data-flip-id', flipId)

  const MODAL_W = props.width
  const MODAL_H = popupHeight.value
  const gap = 8
  const rect = input.getBoundingClientRect()
  const left = Math.max(
    gap,
    Math.min(
      Math.round(rect.left + rect.width / 2 - MODAL_W / 2),
      window.innerWidth - MODAL_W - gap,
    ),
  )
  const top = Math.max(
    gap,
    Math.min(Math.round(rect.top - gap), window.innerHeight - MODAL_H - gap),
  )

  const inputProps = look(input)
  Object.assign(X.style, {
    position: 'absolute',
    borderRadius: inputProps.borderRadius,
    background: inputProps.background,
    boxShadow: inputProps.boxShadow,
    width: `${input.offsetWidth}px`,
    height: `${input.offsetHeight}px`,
    top: `${rect.top}px`,
    left: `${rect.left}px`,
  })
  G.style.overflow = 'hidden'
  X.getBoundingClientRect()
  const state = Flip.getState(X)
  X.removeAttribute('style')
  Object.assign(X.style, {
    background: inputProps.background,
    borderRadius: inputProps.borderRadius,
    boxShadow: inputProps.boxShadow,
  })

  requestAnimationFrame(() => {
    Object.assign(X.style, {
      width: `${MODAL_W}px`,
      height: `${MODAL_H}px`,
      background: window.getComputedStyle(G).background,
      borderRadius: window.getComputedStyle(G).borderRadius,
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      bottom: 'unset',
      right: 'unset',
    })
    Object.assign(G.style, {
      minWidth: `${MODAL_W}px`,
      minHeight: `${MODAL_H}px`,
      maxHeight: `${MODAL_H}px`,
    })
    X.classList.add('modal-position-absolute')
    G.getBoundingClientRect()
    Flip.from(state, {
      targets: X,
      duration: 0.5,
      scale: false,
      absolute: false,
      ease: customEase,
      onComplete() {
        G.style.overflow = ''
      },
    })
  })
}

function closePopup() {
  if (!open.value || closing) return
  closing = true

  const input = inputEl.value
  const F = backdrop.value
  const X = windowEl.value
  const U = container.value
  if (!F || !X || !U || !input) {
    open.value = false
    return
  }

  F.style.pointerEvents = 'none'
  X.style.opacity = '0'
  X.style.removeProperty('min-width')
  X.style.removeProperty('min-height')
  X.style.removeProperty('max-height')
  X.style.overflow = 'hidden'

  const state = Flip.getState(input)
  const inputProps = look(input)

  gsap.killTweensOf([U, F, X])
  Flip.to(state, {
    targets: U,
    duration: 0.5,
    ease: customEase,
    scale: false,
    absolute: false,
    onComplete() {
      input.removeAttribute('data-flip-id')
      gsap.killTweensOf(input)
      open.value = false
    },
  })
  gsap.to(U, {
    background: inputProps.background,
    borderRadius: inputProps.borderRadius,
    boxShadow: inputProps.boxShadow,
    duration: 0.5,
    ease: customEase,
  })
  gsap.to(F, { opacity: 0, duration: 0.5, ease: 'power3.in' })
}

function pick(opt) {
  emit('update:modelValue', opt.value)
  closePopup()
}
</script>

<template>
  <div v-bind="scopeAttr" class="container" :style="disabled ? 'pointer-events:none;opacity:0.7;' : ''">
    <input
      ref="inputEl"
      v-bind="scopeAttr"
      type="text"
      class="style-2"
      readonly
      :name="name"
      :placeholder="placeholder"
      :value="label"
      @click="openPopup"
    />
    <slot name="icon">
      <svg
        v-bind="scopeAttr"
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        width="24px"
        viewBox="0 -960 960 960"
        fill="var(--md-sys-color-outline)"
      >
        <path
          d="M459-381 314-526q-3-3-4.5-6.5T308-540q0-8 5.5-14t14.5-6h304q9 0 14.5 6t5.5 14q0 2-6 14L501-381q-5 5-10 7t-11 2q-6 0-11-2t-10-7Z"
        ></path>
      </svg>
    </slot>

    <Teleport v-if="open" to="body">
      <div
        ref="backdrop"
        data-v-c84aa51e
        class="modal-backdrop"
        style="z-index: 1001"
        @click.self="closePopup"
      >
        <div
          ref="container"
          data-v-c84aa51e
          class="modal-window-container modal-position-absolute"
        >
          <div
            ref="windowEl"
            data-v-c84aa51e
            class="modal-window slim padding-8"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
          >
            <div data-v-8d68f20e v-bind="scopeAttr" class="container">
              <div data-v-8d68f20e class="options-container">
                <div
                  v-for="opt in options"
                  :key="String(opt.value)"
                  data-v-8d68f20e
                  class="option"
                  :class="{ selected: String(opt.value) === String(modelValue) }"
                  :data-value="opt.value"
                  tabindex="0"
                  @click="pick(opt)"
                >
                  {{ opt.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
