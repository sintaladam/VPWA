<template>
  <q-layout view="hHh LpR fFf">

    <q-header elevated class="bg-grey text-white" height-hint="98">
      <q-toolbar>
        

        <q-toolbar-title class="text-center">
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar> -->
          slack clone
        </q-toolbar-title>
      </q-toolbar>

      <!-- <q-tabs align="left">
        <q-route-tab to="/page1" label="Page One" />
        <q-route-tab to="/page2" label="Page Two" />
        <q-route-tab to="/page3" label="Page Three" />
      </q-tabs> -->
    </q-header>

    <q-drawer show-if-above :mini= "!leftDrawerOpen" :mini-width="60" side="left" bordered>
      <!-- drawer content -->
      <div class="row q-pa-sm" :class="leftDrawerOpen ? 'justify-end' : 'justify-center'">
        <q-btn dense flat round :icon= "leftDrawerOpen ? 'arrow_left' : 'arrow_right'" @click="toggleLeftDrawer"/>
      </div>
      <div class="row"></div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script lang="ts">
//import { ref } from 'vue'

export default {
  
  // setup () {
  //   const leftDrawerOpen = ref(false)

  //   return {
  //     leftDrawerOpen,
  //     toggleLeftDrawer () {
  //       leftDrawerOpen.value = !leftDrawerOpen.value
  //     }
  //   }
  // }

  data() {
    return {
      leftDrawerOpen: false
    }
  },
  methods: {
    toggleLeftDrawer () {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    }
  }
}
</script>