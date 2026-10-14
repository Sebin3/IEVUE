<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from './composables/useTheme'
import AppNav from './components/AppNav.vue'
import LiquidGooDefs from './components/LiquidGooDefs.vue'
import AgentChatbot from './components/AgentChatbot.vue'
import { ToastHost } from 'super-beautiful-toast'
const route = useRoute()
const { initTheme } = useTheme()
const showNav = computed(() => route.name !== 'login')
onMounted(initTheme)
</script>

<template>
  <div class="app-main">
    <div class="app-container">
      <router-view />
      <AppNav v-if="showNav" />
    </div>
  </div>

  <AgentChatbot v-if="showNav" />
  <ToastHost icon-component="md-icon" />
  <LiquidGooDefs />
</template>
