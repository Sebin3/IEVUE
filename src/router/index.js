import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { moduleAvailability } from '../config/modules'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'inicio',
    component: () => import('../pages/InicioPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/movimientos',
    name: 'movimientos',
    component: () => import('../pages/MovimientosPage.vue'),
    meta: { requiresAuth: true, module: 'movimientos' },
  },
  {
    path: '/estudiantes',
    name: 'estudiantes',
    component: () => import('../pages/EstudiantesPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/sedes',
    redirect: { name: 'estudiantes' },
    meta: { requiresAuth: true },
  },
  {
    path: '/empleados',
    name: 'empleados',
    component: () => import('../pages/EmpleadosPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/asistencias',
    name: 'asistencias',
    component: () => import('../pages/AsistenciasPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/calendario',
    name: 'calendario',
    component: () => import('../pages/CalendarPage.vue'),
    meta: { requiresAuth: true, module: 'calendario' },
  },
  // Ruta comodin -> inicio. Se redirige por path y no por `name` para no
  // arrastrar el param `pathMatch` a una ruta que no lo declara (vue-router 5
  // avisa con R0100 y lo descarta).
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// vue-router 5 depreco el callback `next()`: el guard devuelve el destino.
router.beforeEach((to) => {
  const auth = useAuthStore()
  const hasValidSession = auth.hasValidSession()
  if (to.meta.requiresAuth && !hasValidSession) return { name: 'login' }
  if (to.meta.module && !moduleAvailability[to.meta.module]) return { name: 'inicio' }
  if (to.name === 'login' && hasValidSession) return { name: 'inicio' }
})

export default router
