import { computed, ref, watch } from 'vue'

export function usePagination(items, pageSize) {
  const currentPage = ref(1)
  const pageCount = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize)))
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return items.value.slice(start, start + pageSize)
  })

  watch(pageCount, (count) => {
    if (currentPage.value > count) currentPage.value = count
  })

  function setPage(page) {
    currentPage.value = Math.min(pageCount.value, Math.max(1, page))
  }

  return { currentPage, pageCount, paginatedItems, setPage }
}
