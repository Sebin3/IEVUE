<script setup>
/**
 * PAGE: INICIO — index.html lineas 419-655.
 * Markup identico: hero .pretty-container con .background/.noise (data-v-32393eee),
 * botones mobile/desktop y la lista de movimientos en estado vacio.
 */
import { useModal } from '../composables/useModal'
import ModalCreate from '../components/ModalCreate.vue'
import ModalChat from '../components/ModalChat.vue'
import ModalFilters from '../components/ModalFilters.vue'

const create = useModal()
const chat = useModal()
const filters = useModal()
</script>

<template>
  <div data-v-1f02e176 class="app-view align-center">
    <div
      data-v-1f02e176
      class="simple-container direction-column width-100 max-width-1000 gap-24"
    >
      <div data-v-1f02e176 class="simple-container direction-column gap-16">
        <!-- Card principal -->
        <div
          data-v-1f02e176
          class="pretty-container simple-container cursor-pointer box-sizing justify-right direction-column border-radius-40 position-relative"
        >
          <div
            data-v-32393eee
            data-v-1f02e176
            class="background"
            style="
              --v9501004a: 10s;
              --v4349373e: 0.5;
              --e43cd9c0: 1;
              --v49c3eedc: 15s;
              --v1448d375: 1;
            "
          >
            <div data-v-32393eee class="noise"></div>
          </div>
          <div
            data-v-c1cf7371
            data-v-1f02e176
            class="simple-container direction-column z-index-1"
          >
            <div data-v-c1cf7371 class="asyncstate-data asyncstate-fade-in">
              <div data-v-c1cf7371 class="simple-container direction-column gap-8">
                <div
                  data-v-c1cf7371
                  class="simple-container flex-wrap gap-4 padding-24"
                  style="text-align: left"
                ></div>
                <div data-v-c1cf7371 style="height: 50px"></div>
                <div data-v-c1cf7371 class="simple-container direction-column padding-32">
                  <div data-v-c1cf7371>
                    <span data-v-c1cf7371 class="headline-small opacity-0-8">total</span>
                  </div>
                  <div data-v-c1cf7371 class="overflow-auto">
                    <span
                      data-v-c1cf7371
                      class="money-total display-large weight-600"
                      style="--mobile-money-size: 57px"
                      >$0.00</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones mobile -->
        <div data-v-1f02e176 class="simple-container gap-16 only-on-mobile">
          <button
            data-v-1f02e176
            class="style-7 surface-container outline-text flex-1 nice-button"
            @click="chat.show"
          >
            <md-ripple data-v-1f02e176 aria-hidden="true"></md-ripple>
            <md-icon data-v-1f02e176 class="filled primary-text" aria-hidden="true">
              wand_stars
            </md-icon>
          </button>
          <button
            data-v-1f02e176
            class="style-7 primary-container on-primary-container-text nice-button"
            @click="create.show"
          >
            <md-ripple data-v-1f02e176 aria-hidden="true"></md-ripple>
            <md-icon data-v-1f02e176 aria-hidden="true">add</md-icon>
          </button>
        </div>
      </div>

      <!-- Botones desktop -->
      <div data-v-1f02e176 class="simple-container gap-16 hide-on-mobile">
        <div
          id="chatBtnDesktop"
          data-v-1f02e176
          class="content-box direction-row padding-32 border-radius-32 align-center justify-between background outline-light-1 cursor-text outline-text"
          @click="chat.show"
        >
          <md-ripple data-v-1f02e176 aria-hidden="true"></md-ripple>
          <span data-v-1f02e176>Chatea conmigo</span>
          <md-icon data-v-1f02e176 class="primary-text opacity-0-7" aria-hidden="true">
            wand_stars
          </md-icon>
        </div>
        <button
          id="openModalBtn"
          data-v-1f02e176
          class="style-7 primary-container on-primary-container-text"
          style="
            min-width: 88px;
            max-width: 88px;
            max-height: 88px;
            height: 88px;
            border-radius: 64px;
          "
          @click="create.show"
        >
          <md-ripple data-v-1f02e176 aria-hidden="true"></md-ripple>
          <md-icon data-v-1f02e176 aria-hidden="true">add</md-icon>
        </button>
      </div>

      <!-- Sección de movimientos -->
      <div data-v-1f02e176 class="simple-container justify-between gap-8 align-center">
        <span data-v-1f02e176 class="headline-small outline-text l-padding-16">Movimientos</span>
        <div data-v-1f02e176 class="simple-container gap-8">
          <button
            data-v-1f02e176
            class="style-7 background outline-light-1 rounded on-background-text"
            @click="filters.show"
          >
            <md-ripple data-v-1f02e176 aria-hidden="true"></md-ripple>
            <md-icon data-v-1f02e176 class="dynamic" aria-hidden="true">page_info</md-icon>
            <span data-v-1f02e176>Filtros</span>
          </button>
        </div>
      </div>

      <div data-v-1f02e176 class="simple-container direction-column">
        <div data-v-33d24f89 data-v-1f02e176 class="simple-container direction-column">
          <div data-v-33d24f89 class="simple-container grow-1">
            <div class="content-box light-color grow-1 align-center justify-center padding-24">
              <md-icon class="pretty-minimal outline-text" aria-hidden="true">
                border_clear
              </md-icon>
              <span class="headline-small weight-500 outline-text">
                No se encontraron movimientos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalCreate v-if="create.open.value" :origin="create.origin.value" @close="create.hide" />
  <ModalChat v-if="chat.open.value" :origin="chat.origin.value" @close="chat.hide" />
  <ModalFilters v-if="filters.open.value" :origin="filters.origin.value" @close="filters.hide" />
</template>
