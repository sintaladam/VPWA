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

    <q-drawer show-if-above :mini="!leftDrawerOpen" :mini-width="60" side="left" bordered>
      <!-- drawer content -->
      <div class="row q-pa-sm" :class="leftDrawerOpen ? 'justify-end' : 'justify-center'">
        <q-btn dense flat round :icon="leftDrawerOpen ? 'arrow_left' : 'arrow_right'" @click="toggleLeftDrawer" />
      </div>
      <q-tabs :class="leftDrawerOpen ? '' : 'hidden'" v-model="activeTab" dense class="text-dark" active-color="primary"
        indicator-color="primary">
        <q-tab name="channels" label="Channels" />
        <q-tab name="chats" label="Chats" />
        <q-tab name="profile" label="Profile" />
      </q-tabs>

      <div class="row" :class="leftDrawerOpen ? '' : 'hidden'">
        <template v-if="activeTab === 'chats'">
          <ChatBadge v-for="(value, index) in chats" :key="index" :chat="value" class="full-width" />
        </template>

        <template v-else-if="activeTab === 'channels'">
          <ChannelBadge v-for="(value, index) in channels" :key="index" :channel="value" class="full-width" />
        </template>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script lang="ts">
import ChannelBadge from 'src/components/ChannelBadge.vue';
import ChatBadge from 'src/components/ChatBadge.vue';
import type { ChannelAtr, ChatAtr } from 'src/components/models';

type TabName = 'channels' | 'chats' | 'profile';

export default {
  data() {
    return {
      leftDrawerOpen: false,
      activeTab: 'channels' as TabName,
      channels: [
        {
          id: 0,
          type: 'public',
          name: 'Generic name1',
          description: 'generic description'
        },
        {
          id: 1,
          type: 'public',
          name: 'Generic name2',
          description: 'generic description'
        },
        {
          id: 2,
          type: 'public',
          name: 'Generic name3',
          description: 'generic description'
        },
        {
          id: 3,
          type: 'public',
          name: 'Generic name4',
          description: 'generic description'
        },
        {
          id: 4,
          type: 'public',
          name: 'Generic name5',
          description: 'generic description'
        },
      ] as ChannelAtr[],
      chats: [
        {
          id: 0,
          senderId: 123,
          senderNickname: 'Alice'
        },
        {
          id: 1,
          senderId: 124,
          senderNickname: 'Bob'
        },
        {
          id: 2,
          senderId: 125,
          senderNickname: 'Charlie'
        },
        {
          id: 3,
          senderId: 126,
          senderNickname: 'David'
        },
        {
          id: 4,
          senderId: 127,
          senderNickname: 'Eve'
        },
      ] as ChatAtr[],
    }
  },
  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    }
  },
  components: {
    ChannelBadge, ChatBadge
  },
  watch: {
    activeTab(newTab: TabName) {
      console.log('Active tab changed to:', newTab);
    }
  }
}
</script>