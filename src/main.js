import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Mismo orden de carga que index.html:
// iconos -> fuentes -> frontend.css (el diseño real) -> parches encima.
import './assets/styles/iconstyle.css'
import './assets/styles/font-geist-mono.css'
import './assets/styles/font-dm-sans.css'
import './assets/styles/frontend.css'
import 'super-beautiful-toast/style.css'
import './assets/styles/patches.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('No se pudo registrar el service worker:', error)
    })
  })
}
