<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import FlipModal from './FlipModal.vue'

const isOpen = ref(false)
const isNewChatConfirmationOpen = ref(false)
const origin = ref(null)
const newChatOrigin = ref(null)
const draft = ref('')
const messages = ref([])
const busy = ref(false)
const messagesEl = ref(null)
const textareaEl = ref(null)
const triggerEl = ref(null)
const cancelNewChatButton = ref(null)

let optionsResizeObserver

function alignTriggerAboveOptions() {
  const trigger = triggerEl.value
  if (!trigger) return

  if (window.matchMedia('(max-width: 1024px)').matches) {
    const optionsButton = document.getElementById('optionsBtn')
    const optionsRect = optionsButton?.getBoundingClientRect()

    if (optionsRect?.width && optionsRect.height) {
      trigger.style.width = `${optionsRect.width}px`
      trigger.style.height = `${optionsRect.height}px`

      if (window.matchMedia('(max-width: 680px)').matches) {
        trigger.style.right = `${Math.max(0, window.innerWidth - optionsRect.right)}px`
        trigger.style.bottom = `${Math.max(0, window.innerHeight - optionsRect.top + 8)}px`
      } else {
        const defaultLeft = window.innerWidth - optionsRect.width - 16
        const defaultTop = window.innerHeight - optionsRect.height - 16
        const overlapsOptions =
          defaultLeft < optionsRect.right &&
          defaultLeft + optionsRect.width > optionsRect.left &&
          defaultTop < optionsRect.bottom &&
          defaultTop + optionsRect.height > optionsRect.top

        if (overlapsOptions && optionsRect.left >= optionsRect.width + 8) {
          trigger.style.right = `${window.innerWidth - optionsRect.left + 8}px`
          trigger.style.bottom = `${Math.max(0, window.innerHeight - optionsRect.bottom)}px`
        } else {
          trigger.style.removeProperty('right')
          trigger.style.removeProperty('bottom')
        }
      }
      return
    }
  }

  trigger.style.removeProperty('right')
  trigger.style.removeProperty('bottom')
  trigger.style.removeProperty('width')
  trigger.style.removeProperty('height')
}

onMounted(async () => {
  await nextTick()
  alignTriggerAboveOptions()
  window.addEventListener('resize', alignTriggerAboveOptions)
  window.visualViewport?.addEventListener('resize', alignTriggerAboveOptions)
  window.visualViewport?.addEventListener('scroll', alignTriggerAboveOptions)

  const optionsButton = document.getElementById('optionsBtn')
  if (optionsButton && typeof ResizeObserver !== 'undefined') {
    optionsResizeObserver = new ResizeObserver(alignTriggerAboveOptions)
    optionsResizeObserver.observe(optionsButton)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', alignTriggerAboveOptions)
  window.visualViewport?.removeEventListener('resize', alignTriggerAboveOptions)
  window.visualViewport?.removeEventListener('scroll', alignTriggerAboveOptions)
  optionsResizeObserver?.disconnect()
})

function openChat(event) {
  origin.value = event.currentTarget
  isOpen.value = true
}

function closeChat() {
  isOpen.value = false
  origin.value = null
  messages.value = []
  draft.value = ''
  busy.value = false
}

async function scrollToBottom() {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

function startNewConversation() {
  messages.value = []
  draft.value = ''
  busy.value = false
  if (textareaEl.value) textareaEl.value.style.height = '64px'
}

function openNewChatConfirmation(event) {
  newChatOrigin.value = event.currentTarget
  isNewChatConfirmationOpen.value = true
  nextTick(() => cancelNewChatButton.value?.focus())
}

function closeNewChatConfirmation() {
  const trigger = newChatOrigin.value
  isNewChatConfirmationOpen.value = false
  newChatOrigin.value = null
  nextTick(() => trigger?.focus())
}

function confirmNewConversation(close) {
  startNewConversation()
  close()
}

async function sendMessage() {
  const text = draft.value.trim()
  if (!text || busy.value) return

  messages.value.push({ role: 'user', text })
  draft.value = ''
  if (textareaEl.value) textareaEl.value.style.height = '64px'
  busy.value = true
  await scrollToBottom()

  window.setTimeout(async () => {
    if (!isOpen.value) return
    messages.value.push({
      role: 'assistant',
      text: `Recibí tu mensaje: "${text}". Este chat es una maqueta, todavía no hay backend conectado.`,
    })
    busy.value = false
    await scrollToBottom()
    if (textareaEl.value && isOpen.value) textareaEl.value.focus()
  }, 600)
}

function onKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <button
    type="button"
    class="agent-button variant-bright agent-chatbot-trigger"
    ref="triggerEl"
    aria-label="Asistente"
    aria-haspopup="dialog"
    :aria-expanded="isOpen"
    @click="openChat"
  >
    <md-ripple aria-hidden="true"></md-ripple>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.16699 1.25C9.38908 1.25008 9.58341 1.33341 9.75 1.5L11.583 3.33301H14.167C14.403 3.33308 14.6011 3.41359 14.7607 3.57324C14.9202 3.73291 15 3.93104 15 4.16699V6.75L16.833 8.58301C16.9997 8.74967 17.083 8.94477 17.083 9.16699C17.0829 9.38908 16.9996 9.58341 16.833 9.75L15 11.583L17.3955 16.292C17.4927 16.4725 17.5211 16.6497 17.4795 16.8232C17.4378 16.9967 17.3611 17.1389 17.25 17.25C17.1389 17.3611 16.9967 17.4378 16.8232 17.4795C16.6497 17.5211 16.4725 17.4927 16.292 17.3955L11.583 15L9.75 16.833C9.58341 16.9996 9.38908 17.0829 9.16699 17.083C8.94477 17.083 8.74967 16.9997 8.58301 16.833L6.75 15H4.16699C3.93104 15 3.73291 14.9202 3.57324 14.7607C3.41359 14.6011 3.33308 14.403 3.33301 14.167V11.583L1.5 9.75C1.33341 9.58341 1.25008 9.38908 1.25 9.16699C1.25 8.94477 1.33333 8.74967 1.5 8.58301L3.33301 6.75V4.16699C3.33301 3.93088 3.41352 3.73296 3.57324 3.57324C3.73296 3.41352 3.93088 3.33301 4.16699 3.33301H6.75L8.58301 1.5C8.74967 1.33333 8.94477 1.25 9.16699 1.25ZM9.55762 3.55566C9.42329 3.19334 8.91084 3.19349 8.77637 3.55566L7.43262 7.18652C7.39041 7.30049 7.30049 7.39041 7.18652 7.43262L3.55566 8.77637C3.19349 8.91084 3.19334 9.42329 3.55566 9.55762L7.18652 10.9004C7.30044 10.9425 7.39035 11.0326 7.43262 11.1465L8.77637 14.7773C8.91072 15.1399 9.42341 15.14 9.55762 14.7773L10.9004 11.1465C10.9426 11.0327 11.0327 10.9426 11.1465 10.9004L14.7773 9.55762C15.14 9.42341 15.1399 8.91071 14.7773 8.77637L11.1465 7.43262C11.0326 7.39035 10.9425 7.30044 10.9004 7.18652L9.55762 3.55566Z"
        fill="currentColor"
      />
    </svg>
  </button>

  <FlipModal
    v-if="isOpen"
    :origin="origin"
    placement="agent-chat"
    floatable="chat"
    window-class="increased slim padding-8 border-radius-48"
    content-class="simple-container grow-1 direction-column chat-orchestrator"
    content-data-v="acac3886 bd92e8f3"
    @close="closeChat"
  >
    <template #default="{ close }">
      <div
        class="simple-container position-absolute left-16 top-16 gap-4 agent-chat-controls"
        data-v-acac3886
        style="z-index: 2"
      >
        <button
          type="button"
          class="style-7 variant-glass for-icon small rounded"
          data-v-acac3886
          aria-label="Cerrar asistente"
          @click="close()"
        >
          <md-ripple data-v-acac3886 aria-hidden="true"></md-ripple>
          <md-icon data-v-acac3886 aria-hidden="true">close</md-icon>
        </button>
        <button
          type="button"
          class="style-7 variant-glass for-icon small rounded"
          data-v-acac3886
          aria-label="Nueva conversación"
          @click="openNewChatConfirmation"
        >
          <md-icon data-v-acac3886 aria-hidden="true">maps_ugc</md-icon>
          <md-ripple data-v-acac3886 aria-hidden="true"></md-ripple>
        </button>
      </div>

      <div class="chat" data-v-f0318d9e data-v-acac3886>
        <div class="chat-background" data-v-f0318d9e>
          <div
            class="background"
            data-v-32393eee
            data-v-f0318d9e
            style="--v9501004a: 10s; --v4349373e: 0.5; --e43cd9c0: 1; --v49c3eedc: 15s; --v1448d375: 1"
            aria-hidden="true"
          >
            <div class="noise" data-v-32393eee></div>
          </div>
        </div>

        <div ref="messagesEl" class="messages" data-v-f0318d9e aria-live="polite">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="message.role"
            data-v-f0318d9e
          >
            <span class="message-text" data-v-f0318d9e>{{ message.text }}</span>
          </div>
        </div>

        <div class="input-area" data-v-f0318d9e>
          <textarea
            ref="textareaEl"
            v-model="draft"
            data-v-f0318d9e
            rows="1"
            placeholder="Escribe un mensaje..."
            aria-label="Escribe un mensaje"
            :aria-busy="busy ? 'true' : 'false'"
            :disabled="busy"
            data-autofocus
            style="height: 64px"
            @keydown="onKeydown"
          ></textarea>
          <div class="simple-container gap-8 direction-column" data-v-f0318d9e>
            <button
              type="button"
              class="variant-glass"
              data-v-f0318d9e
              style="z-index: 2"
              aria-label="Dictado por voz"
              :disabled="busy"
            >
              <md-ripple data-v-f0318d9e aria-hidden="true"></md-ripple>
              <md-icon data-v-f0318d9e aria-hidden="true">mic</md-icon>
            </button>
            <button
              type="button"
              class="variant-glass"
              data-v-f0318d9e
              aria-label="Enviar mensaje"
              :disabled="busy"
              @click="sendMessage"
            >
              <md-ripple data-v-f0318d9e aria-hidden="true"></md-ripple>
              <md-icon data-v-f0318d9e aria-hidden="true">arrow_upward</md-icon>
            </button>
          </div>
        </div>
      </div>

      <FlipModal
        v-if="isNewChatConfirmationOpen"
        :origin="newChatOrigin"
        placement="agent-panel"
        close-strategy="container-only"
        window-class="slim h-auto padding-24 border-radius-32 agent-chat-confirmation-window"
        content-class="simple-container direction-column gap-24"
        content-data-v="4aea44fd c84aa51e"
        backdrop-class="no-backdrop agent-chat-confirmation-backdrop"
        @close="closeNewChatConfirmation"
      >
        <template #default="{ close }">
          <div data-v-4aea44fd class="simple-container direction-column gap-16">
            <span
              id="agent-new-chat-title"
              data-v-4aea44fd
              class="display-small weight-600 title line-height-1"
              data-shared-item="title"
            >
              Nuevo chat
            </span>
            <span id="agent-new-chat-description" data-v-4aea44fd class="body-large">
              Se borrará la conversación actual.
            </span>
          </div>
          <div data-v-4aea44fd class="simple-container justify-right gap-8 agent-chat-confirmation-actions">
            <button
              ref="cancelNewChatButton"
              type="button"
              data-v-4aea44fd
              class="style-7 rounded variant-glass outline-text flex-0-1 justify-center"
              @click="close()"
            >
              <span data-v-4aea44fd>Cancelar</span>
            </button>
            <button
              type="button"
              data-v-4aea44fd
              class="style-7 rounded flex-0-1 justify-center text-wrap-nowrap primary-container on-primary-container-text variant-bright"
              @click="confirmNewConversation(close)"
            >
              Empezar de nuevo
            </button>
          </div>
        </template>
      </FlipModal>
    </template>
  </FlipModal>
</template>
