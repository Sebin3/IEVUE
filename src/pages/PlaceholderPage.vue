<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const info = computed(() =>
  route.name === 'sedes'
    ? { title: 'Estudiantes', icon: 'domain', text: 'El Apartado de Estudiantes no está disponible todavía' }
    : route.name === 'calendario'
      ? { title: 'Calendario', icon: 'calendar_month', text: 'No se encontraron eventos en el calendario' }
    : {
        title: 'Asistencias',
        icon: 'assignment_ind',
        text: 'No se encontraron Asistencias',
      },
)
</script>

<template>
  <div class="app-view">
    <div class="simple-container direction-column gap-24 grow-1">
      <div class="app-header">
        <span class="display-medium weight-500 text-gradient">{{ info.title }}</span>
      </div>

      <div class="simple-container direction-column grow-1">
        <div class="simple-container grow-1">
          <div class="content-box light-color grow-1 align-center justify-center padding-24">
            <md-icon class="pretty-minimal outline-text" aria-hidden="true">
              {{ info.icon }}
            </md-icon>
            <span class="headline-small weight-500 outline-text">{{ info.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
