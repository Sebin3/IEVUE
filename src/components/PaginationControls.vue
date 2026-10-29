<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  total: { type: Number, required: true },
})

const emit = defineEmits(['update:page'])
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const firstItem = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1)
const lastItem = computed(() => Math.min(props.page * props.pageSize, props.total))

function changePage(page) {
  emit('update:page', Math.min(pageCount.value, Math.max(1, page)))
}
</script>

<template>
  <nav v-if="total > pageSize" class="pagination-controls" aria-label="Paginación de registros">
    <span class="body-medium outline-text pagination-summary" aria-live="polite">
      Mostrando {{ firstItem }}–{{ lastItem }} de {{ total }}
    </span>

    <div class="pagination-navigation">
      <button
        type="button"
        class="style-7 for-icon small hover-border-radius-round background outline-text pagination-button"
        aria-label="Página anterior"
        :disabled="page <= 1"
        @click="changePage(page - 1)"
      >
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon aria-hidden="true">chevron_left</md-icon>
      </button>
      <span class="body-medium outline-text pagination-page" aria-current="page">
        Página {{ page }} de {{ pageCount }}
      </span>
      <button
        type="button"
        class="style-7 for-icon small hover-border-radius-round background outline-text pagination-button"
        aria-label="Página siguiente"
        :disabled="page >= pageCount"
        @click="changePage(page + 1)"
      >
        <md-ripple aria-hidden="true"></md-ripple>
        <md-icon aria-hidden="true">chevron_right</md-icon>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 0;
}

.pagination-summary {
  min-width: 0;
}

.pagination-navigation {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-left: auto;
}

.pagination-button {
  width: 40px;
  height: 40px;
  padding: 10px !important;
}

.pagination-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pagination-page {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 420px) {
  .pagination-controls {
    justify-content: center;
  }

  .pagination-summary {
    flex: 1 1 100%;
    text-align: center;
  }

  .pagination-navigation {
    margin-left: 0;
  }
}
</style>
