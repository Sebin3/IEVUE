<script setup>
/*
    This component is a date picker inspired by Material Design 3,
    but it is a simplified version with some visual details that will be fixed soon.
 */
import { computed, ref, watch } from 'vue'
import FlipModal from './FlipModal.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const origin = ref(null)
const today = new Date()
const viewDate = ref(parseDate(props.modelValue) || new Date(today.getFullYear(), today.getMonth(), 1))

const weekdays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

function parseDate(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function toIso(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDate(value) {
  const date = parseDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  }).format(date)
}

function isToday(date) {
  return toIso(date) === toIso(today)
}

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(viewDate.value),
)

const days = computed(() => {
  const first = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  const total = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 0).getDate()
  const previousTotal = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 0).getDate()
  const cells = []

  for (let index = offset - 1; index >= 0; index -= 1) {
    const date = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, previousTotal - index)
    cells.push({ date, day: date.getDate(), outside: true })
  }

  for (let day = 1; day <= total; day += 1) {
    const date = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), day)
    cells.push({ date, day, outside: false })
  }

  while (cells.length < 42) {
    const date = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, cells.length - offset - total + 1)
    cells.push({ date, day: date.getDate(), outside: true })
  }

  return cells
})

function changeMonth(amount) {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + amount, 1)
}

function openPicker(event) {
  origin.value = event.currentTarget
  open.value = true
}

function selectDate(item, close) {
  if (item.outside) return
  emit('update:modelValue', toIso(item.date))
  close()
}

watch(
  () => props.modelValue,
  (value) => {
    const date = parseDate(value)
    if (date) viewDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
  },
)
</script>

<template>
  <div class="date-picker-control">
    <input
      :value="formatDate(modelValue)"
      type="text"
      class="style-2"
      name="date"
      placeholder="Selecciona una fecha"
      readonly
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="openPicker"
    />
    <md-icon class="date-picker-icon" aria-hidden="true">calendar_month</md-icon>

    <FlipModal
      v-if="open"
      :origin="origin"
      window-class="slim padding-8 border-radius-48"
      content-class="picker-content"
      @close="open = false"
    >
      <template #default="{ close }">
        <div class="calendar date-picker-popup" data-v-d977793a>
          <div class="calendar-header" data-v-d977793a>
            <span class="month-label" data-v-d977793a>{{ monthLabel }}</span>
            <div class="nav-buttons" data-v-d977793a>
              <button
                type="button"
                class="nav-btn"
                data-v-d977793a
                aria-label="Mes anterior"
                @click="changeMonth(-1)"
              >
                <md-icon aria-hidden="true">chevron_left</md-icon>
              </button>
              <button
                type="button"
                class="nav-btn"
                data-v-d977793a
                aria-label="Mes siguiente"
                @click="changeMonth(1)"
              >
                <md-icon aria-hidden="true">chevron_right</md-icon>
              </button>
            </div>
          </div>

          <div class="calendar-grid" data-v-d977793a>
            <span
              v-for="(weekday, index) in weekdays"
              :key="`${weekday}-${index}`"
              class="weekday"
              data-v-d977793a
            >
              {{ weekday }}
            </span>
            <div
              v-for="item in days"
              :key="toIso(item.date)"
              class="day"
              data-v-d977793a
              :class="{
                outside: item.outside,
                today: isToday(item.date),
                selected: toIso(item.date) === modelValue,
              }"
              :role="item.outside ? undefined : 'button'"
              :tabindex="item.outside ? -1 : 0"
              @click="selectDate(item, close)"
              @keydown.enter.prevent="selectDate(item, close)"
            >
              {{ item.day }}
            </div>
          </div>
        </div>
      </template>
    </FlipModal>
  </div>
</template>
