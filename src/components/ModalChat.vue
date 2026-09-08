<script setup>
/**
 * MODAL: chat — index.html createChatModal() (2145-2201) + openChatModal
 * (2203-2381).
 * Markup 1:1. index.html llama a `${API}/management/chatbot/`; aqui, como todo
 * el proyecto va con mocks, la respuesta del asistente se simula en local.
 */
import { ref, nextTick } from 'vue'
import FlipModal from './FlipModal.vue'

defineProps({
  origin: { type: Object, default: null },
})

const emit = defineEmits(['close'])

// index.html arranca con una burbuja de asistente vacia.
const messages = ref([{ role: 'assistant', text: '' }])
const draft = ref('')
const busy = ref(false)

const messagesEl = ref(null)
const textareaEl = ref(null)

async function scrollToBottom() {
  await nextTick()
  const el = messagesEl.value
  if (el) el.scrollTop = el.scrollHeight
}

function reset() {
  messages.value = [{ role: 'assistant', text: '' }]
  draft.value = ''
  busy.value = false
  if (textareaEl.value) textareaEl.value.style.height = '64px'
}

async function send() {
  const text = draft.value.trim()
  if (!text || busy.value) return

  messages.value.push({ role: 'user', text })
  draft.value = ''
  if (textareaEl.value) textareaEl.value.style.height = '64px'
  busy.value = true
  await scrollToBottom()

  // Mock: index.html hace POST al chatbot; aqui se responde en local.
  window.setTimeout(async () => {
    messages.value.push({
      role: 'assistant',
      text: `Recibi tu mensaje: "${text}". Este chat es una maqueta, todavia no hay backend conectado.`,
    })
    busy.value = false
    await scrollToBottom()
    if (textareaEl.value) textareaEl.value.focus()
  }, 600)
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <FlipModal
    :origin="origin"
    window-class="increased semi-slim padding-8"
    content-class="simple-container grow-1 direction-column chat-orchestrator"
    content-data-v="fd4a7cc8"
    @close="emit('close')"
  >
    <template #default="{ close }">
      <div
        data-v-fd4a7cc8
        class="simple-container direction-column position-absolute left-8 top-8 gap-4"
        style="z-index: 2"
      >
        <button
          data-v-fd4a7cc8
          class="style-7 variant-glass for-icon small rounded chat-close-btn"
          @click="close()"
        >
          <md-ripple data-v-fd4a7cc8 aria-hidden="true"></md-ripple>
          <md-icon data-v-fd4a7cc8 aria-hidden="true">close</md-icon>
        </button>
        <button
          data-v-fd4a7cc8
          class="style-7 variant-glass for-icon small rounded chat-reset-btn"
          @click="reset"
        >
          <md-icon data-v-fd4a7cc8 aria-hidden="true">maps_ugc</md-icon>
          <md-ripple data-v-fd4a7cc8 aria-hidden="true"></md-ripple>
        </button>
      </div>

      <div data-v-f998e4ff data-v-fd4a7cc8 class="chat">
        <div
          data-v-32393eee
          data-v-f998e4ff
          class="background"
          style="
            --v9501004a: 10s;
            --v4349373e: 0.5;
            --e43cd9c0: 1;
            --v49c3eedc: 15s;
            --v1448d375: 1;
          "
        >
          <div data-v-32393eee class="noise"></div>
        </div>

        <div ref="messagesEl" data-v-f998e4ff class="messages">
          <div v-for="(m, i) in messages" :key="i" data-v-f998e4ff class="message-pair">
            <div data-v-f998e4ff class="message" :class="m.role">
              <span data-v-f998e4ff class="message-text">{{ m.text }}</span>
            </div>
          </div>
        </div>

        <div data-v-f998e4ff class="input-area">
          <textarea
            ref="textareaEl"
            v-model="draft"
            data-v-f998e4ff
            rows="1"
            placeholder="Escribe un mensaje..."
            :aria-busy="busy ? 'true' : 'false'"
            :disabled="busy"
            data-autofocus
            style="height: 64px"
            @keydown="onKeydown"
          ></textarea>
          <div data-v-f998e4ff class="simple-container gap-8 direction-column">
            <button data-v-f998e4ff class="" style="z-index: 2" type="button">
              <md-ripple data-v-f998e4ff aria-hidden="true"></md-ripple>
              <md-icon data-v-f998e4ff aria-hidden="true">mic</md-icon>
            </button>
            <button data-v-f998e4ff class="chat-send-btn" type="button" @click="send">
              <md-ripple data-v-f998e4ff aria-hidden="true"></md-ripple>
              <md-icon data-v-f998e4ff aria-hidden="true">arrow_upward</md-icon>
            </button>
          </div>
        </div>
      </div>
    </template>
  </FlipModal>
</template>
