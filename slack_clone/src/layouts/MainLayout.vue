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
      <div class="row" :class="leftDrawerOpen ? '' : 'hidden'">
        <ChannelBadge v-for="(value, index) in channels" :key="index" :channel="value" class="full-width"/>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script lang="ts">
import ChannelBadge from 'src/components/ChannelBadge.vue';
import type { ChannelAtr } from 'src/components/models';

export default {
  data() {
    return {
      leftDrawerOpen: false,
      channels: [
        {
          id: 0,
          type: 'public',
          name: 'generic name',
          description: 'generic description'
        },
        {
          id: 1,
          type: 'public',
          name: 'generic name',
          description: 'generic description'
        },
        {
          id: 2,
          type: 'public',
          name: 'generic name',
          description: 'generic description'
        },
        {
          id: 3,
          type: 'public',
          name: 'generic name',
          description: 'generic description'
        },
        {
          id: 4,
          type: 'public',
          name: 'generic name',
          description: 'generic description'
        },
      ] as ChannelAtr[]
    }
  },
  methods: {
    toggleLeftDrawer () {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    }
  },
  components: {
    ChannelBadge,
  }
}
</script>