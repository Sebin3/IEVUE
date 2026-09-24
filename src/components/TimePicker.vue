<script setup>
/*
    This component is a time picker inspired by Material Design 3,
    but it is a simplified version with some visual details that will be fixed soon.
 */
import { computed, ref } from 'vue'
import FlipModal from './FlipModal.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const origin = ref(null)
const dial = ref(null)
const activePart = ref('hour')
const dragging = ref(false)

function parseTime(value) {
  const [hour = '12', minute = '00'] = (value || '').split(':')
  const parsedHour = Number(hour)
  return {
    hour: Number.isFinite(parsedHour) ? parsedHour : 12,
    minute: Number(minute) || 0,
  }
}

const hour24 = computed(() => parseTime(props.modelValue).hour)
const minute = computed(() => parseTime(props.modelValue).minute)
const period = computed(() => (hour24.value >= 12 ? 'PM' : 'AM'))
const hour12 = computed(() => {
  const value = hour24.value % 12
  return value || 12
})

const displayTime = computed(
  () => `${String(hour12.value).padStart(2, '0')}:${String(minute.value).padStart(2, '0')} ${period.value}`,
)

const minuteValues = Array.from({ length: 12 }, (_, index) => index * 5)

function updateTime(nextHour, nextMinute) {
  emit(
    'update:modelValue',
    `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`,
  )
}

function openPicker(event) {
  origin.value = event.currentTarget
  open.value = true
}

function selectHour(value) {
  let nextHour = value % 12
  if (period.value === 'PM') nextHour += 12
  updateTime(nextHour, minute.value)
  activePart.value = 'minute'
}

function selectMinute(value) {
  updateTime(hour24.value, value)
}

function selectPeriod(value) {
  const baseHour = hour24.value % 12
  updateTime(value === 'PM' ? baseHour + 12 : baseHour, minute.value)
}

function point(value, radius, isHour = activePart.value === 'hour') {
  const normalized = isHour ? value % 12 : value
  const angle = (normalized / (isHour ? 12 : 60)) * Math.PI * 2 - Math.PI / 2
  const size = radius ?? (isHour ? 96 : 60)
  return {
    x: 120 + Math.cos(angle) * size,
    y: 120 + Math.sin(angle) * size,
  }
}

function handAngle() {
  if (activePart.value === 'hour') return (hour12.value % 12) * 30
  return minute.value * 6
}

function setFromPointer(event) {
  if (!dial.value) return
  const rect = dial.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 240
  const y = ((event.clientY - rect.top) / rect.height) * 240
  const rawAngle = (Math.atan2(y - 120, x - 120) * 180) / Math.PI + 90
  const angle = (rawAngle + 360) % 360

  if (activePart.value === 'hour') {
    const index = Math.round(angle / 30) % 12
    const value = index || 12
    let nextHour = value % 12
    if (period.value === 'PM') nextHour += 12
    updateTime(nextHour, minute.value)
    return
  }

  const nextMinute = Math.round(angle / 6) % 60
  selectMinute(nextMinute)
}

function onPointerDown(event) {
  event.preventDefault()
  dragging.value = true
  event.currentTarget.setPointerCapture?.(event.pointerId)
  setFromPointer(event)
}

function onPointerMove(event) {
  if (dragging.value) setFromPointer(event)
}

function onPointerUp(event) {
  dragging.value = false
  event.currentTarget.releasePointerCapture?.(event.pointerId)
}
</script>

<template>
  <div class="time-picker-control">
    <input
      :value="displayTime"
      type="text"
      class="style-2"
      name="time"
      placeholder="Selecciona una hora"
      readonly
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click="openPicker"
    />
    <md-icon class="time-picker-icon" aria-hidden="true">schedule</md-icon>

    <FlipModal
      v-if="open"
      :origin="origin"
      window-class="slim padding-8 border-radius-48"
      content-class="picker-content"
      @close="open = false"
    >
      <template #default>
        <div class="time-picker time-picker-popup" data-v-b437f2ac>
          <div class="header" data-v-b437f2ac>
            <button
              type="button"
              class="time-chip"
              data-v-b437f2ac
              :class="{ active: activePart === 'hour' }"
              @click="activePart = 'hour'"
            >
              {{ String(hour12).padStart(2, '0') }}
            </button>
            <span class="colon" data-v-b437f2ac>:</span>
            <button
              type="button"
              class="time-chip"
              data-v-b437f2ac
              :class="{ active: activePart === 'minute' }"
              @click="activePart = 'minute'"
            >
              {{ String(minute).padStart(2, '0') }}
            </button>
          </div>

          <div class="dial-wrapper" data-v-b437f2ac>
            <svg
              ref="dial"
              class="dial"
              data-v-b437f2ac
              data-no-drag
              viewBox="0 0 240 240"
              aria-label="Selector de hora"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
            >
              <circle class="face" data-v-b437f2ac cx="120" cy="120" r="112" />
              <g class="ticks" data-v-b437f2ac>
                <line
                  v-for="tick in 60"
                  :key="tick"
                  class="tick"
                  data-v-b437f2ac
                  :class="{ hour: tick % 5 === 0 }"
                  x1="120"
                  y1="12"
                  x2="120"
                  :y2="tick % 5 === 0 ? 20 : 16"
                  :transform="`rotate(${tick * 6} 120 120)`"
                />
              </g>

              <g
                class="hand-group"
                data-v-b437f2ac
                :class="{ dragging }"
                :style="{ transform: `rotate(${handAngle()}deg)` }"
              >
                <line
                  class="hand-line"
                  data-v-b437f2ac
                  x1="120"
                  y1="120"
                  x2="120"
                  :y2="activePart === 'hour' ? 24 : 60"
                />
                <circle
                  class="hand-tip"
                  data-v-b437f2ac
                  cx="120"
                  :cy="activePart === 'hour' ? 24 : 60"
                  :r="activePart === 'hour' ? 18 : 15"
                />
              </g>
              <circle class="center-dot" data-v-b437f2ac cx="120" cy="120" r="3.5" />

              <g
                class="ring outer-ring"
                data-v-b437f2ac
                :class="{ active: activePart === 'hour' }"
              >
                <g
                  v-for="value in 12"
                  :key="`hour-${value}`"
                  class="num-cell"
                  data-v-b437f2ac
                  @click.stop="selectHour(value)"
                >
                  <circle
                    class="num-hit"
                    data-v-b437f2ac
                    :cx="point(value, 96, true).x"
                    :cy="point(value, 96, true).y"
                    r="16"
                  />
                  <text
                    class="num num-hour"
                    data-v-b437f2ac
                    :class="{ selected: value === hour12 }"
                    :x="point(value, 96, true).x"
                    :y="point(value, 96, true).y"
                  >
                    {{ value }}
                  </text>
                </g>
              </g>

              <g
                class="ring inner-ring"
                data-v-b437f2ac
                :class="{ active: activePart === 'minute' }"
              >
                <g
                  v-for="value in minuteValues"
                  :key="`minute-${value}`"
                  class="num-cell"
                  data-v-b437f2ac
                  @click.stop="selectMinute(value)"
                >
                  <circle
                    class="num-hit"
                    data-v-b437f2ac
                    :cx="point(value, 60, false).x"
                    :cy="point(value, 60, false).y"
                    r="14"
                  />
                  <text
                    class="num num-minute"
                    data-v-b437f2ac
                    :class="{ selected: value === minute }"
                    :x="point(value, 60, false).x"
                    :y="point(value, 60, false).y"
                  >
                    {{ String(value).padStart(2, '0') }}
                  </text>
                </g>
              </g>
            </svg>
          </div>

          <div class="period-row" data-v-b437f2ac>
            <button
              v-for="option in ['AM', 'PM']"
              :key="option"
              type="button"
              class="period-chip"
              data-v-b437f2ac
              :class="{ active: period === option }"
              @click="selectPeriod(option)"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </template>
    </FlipModal>
  </div>
</template>
