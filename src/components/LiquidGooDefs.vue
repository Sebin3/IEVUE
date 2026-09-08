<script setup>
// Filtro SVG que index.html usa para el efecto "goo" al fusionar modales.
// Vive una sola vez en el arbol, igual que en index.html (fuera de #app).
</script>

<template>
  <svg data-v-c84aa51e class="liquid-goo-defs" aria-hidden="true">
    <defs data-v-c84aa51e>
      <filter data-v-c84aa51e id="liquidModalGoo" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur data-v-c84aa51e in="SourceGraphic" stdDeviation="20"></feGaussianBlur>
        <feColorMatrix
          data-v-c84aa51e
          type="matrix"
          values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -9"
        ></feColorMatrix>
      </filter>
    </defs>
  </svg>
</template>
