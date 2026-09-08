import { ref } from 'vue'

/**
 * Estado minimo que necesita un FlipModal: si esta abierto y desde que boton
 * nacio la animacion. `show` se engancha directo al @click del boton.
 *
 *   const crear = useModal()
 *   <button @click="crear.show">...</button>
 *   <FlipModal v-if="crear.open.value" :origin="crear.origin.value" @close="crear.hide" />
 */
export function useModal() {
  const open = ref(false)
  const origin = ref(null)
  const payload = ref(null)

  function show(event, data = null) {
    origin.value = event && event.currentTarget ? event.currentTarget : null
    payload.value = data
    open.value = true
  }

  function hide() {
    open.value = false
    origin.value = null
    payload.value = null
  }

  return { open, origin, payload, show, hide }
}
