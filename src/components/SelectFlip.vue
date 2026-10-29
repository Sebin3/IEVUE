<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { gsap, Flip, customEase } from '../composables/useGsap'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  // [{ value, label }]. El label es lo que se pinta en el input.
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Selecciona una opción' },
  name: { type: String, default: '' },
  ariaLabel: { type: String, default: '' },
  // Hash de scope del wrapper, tal como lo escribe index.html.
  scope: { type: String, default: '3020d431' },
  // Altura asignada a cada opción en el popup.
  optionHeight: { type: Number, default: 48 },
  width: { type: Number, default: 368 },
  searchable: { type: Boolean, default: false },
  grouped: { type: Boolean, default: false },
  maxPopupHeight: { type: Number, default: null },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const inputEl = ref(null)
const open = ref(false)
const backdrop = ref(null)
const container = ref(null)
const windowEl = ref(null)
const searchQuery = ref('')
const optionsEl = ref(null)

let closing = false
let flipCounter = 0

const scopeAttr = computed(() => ({ [`data-v-${props.scope}`]: '' }))

const label = computed(() => {
  const found = props.options.find((o) => String(o.value) === String(props.modelValue))
  return found ? found.label : props.modelValue || ''
})

const normalizedQuery = computed(() => searchQuery.value
  .trim()
  .toLocaleLowerCase('es-PE')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, ''))

const visibleOptions = computed(() => {
  if (!normalizedQuery.value) return props.options
  return props.options.filter((option) => {
    const text = `${option.label || ''} ${option.group || ''}`
      .toLocaleLowerCase('es-PE')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    return text.includes(normalizedQuery.value)
  })
})

const groupedOptions = computed(() => {
  const groups = new Map()
  for (const option of visibleOptions.value) {
    const groupName = option.group || 'Salones'
    if (!groups.has(groupName)) groups.set(groupName, [])
    groups.get(groupName).push(option)
  }
  return Array.from(groups, ([name, options]) => ({ name, options }))
})

watch(searchQuery, async () => {
  await nextTick()
  if (optionsEl.value) optionsEl.value.scrollTop = 0
})

// El menú limita su altura al espacio del viewport; las opciones pueden desplazarse dentro.
const popupHeight = computed(() => {
  const optionCount = visibleOptions.value.length
  const groupCount = props.grouped ? groupedOptions.value.length : 0
  const searchHeight = props.searchable ? 56 : 0
  return optionCount * props.optionHeight + groupCount * 32 + searchHeight + 16
})

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
  searchQuery.value = ''
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

  const gap = 8
  const MODAL_W = Math.min(props.width, window.innerWidth - gap * 2)
  const MODAL_H = Math.min(
    popupHeight.value,
    props.maxPopupHeight || popupHeight.value,
    window.innerHeight - gap * 2,
  )
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
      :aria-label="ariaLabel || undefined"
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
            :class="{ 'select-popup-searchable': searchable }"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
          >
            <div data-v-8d68f20e v-bind="scopeAttr" class="container select-options-root">
              <div v-if="searchable" class="select-search">
                <div class="select-search-input">
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="style-2"
                    :aria-label="`Buscar en ${ariaLabel || placeholder.toLocaleLowerCase('es-PE')}`"
                    autocomplete="off"
                    @keydown.stop
                  />
                  <md-icon aria-hidden="true">search</md-icon>
                </div>
              </div>
              <div ref="optionsEl" data-v-8d68f20e class="options-container">
                <template v-if="grouped">
                  <section v-for="group in groupedOptions" :key="group.name" class="select-option-group">
                    <span data-v-8d68f20e class="select-option-group-label">{{ group.name }}</span>
                    <div
                      v-for="opt in group.options"
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
                  </section>
                </template>
                <template v-else>
                  <div
                    v-for="opt in visibleOptions"
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
                </template>
                <div v-if="!visibleOptions.length" class="select-empty-result">
                  No se encontraron salones
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
