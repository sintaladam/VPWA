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
    </q-header>

    <q-drawer show-if-above persistent :behavior="activeDevice" :mini="!leftDrawerOpen" :mini-width="60" :side="activeDevice === 'desktop' ? 'left' : 'right'"
      bordered>
      <!-- drawer content -->
      <div class="row q-pa-sm" :class="leftDrawerOpen ? 'justify-end' : ''">
        <q-btn dense flat round :icon="leftDrawerOpen ? 'arrow_left' : 'arrow_right'"
          :class="activeDevice === 'mobile' ? 'hidden' : 'visible'" @click="toggleLeftDrawer" />
      </div>
      <q-tabs :class="leftDrawerOpen ? '' : 'hidden'" v-model="activeTab" dense class="text-dark" active-color="primary"
        indicator-color="primary">
        <q-tab name="channels" label="Channels" />
        <q-tab name="chats" label="Chats" />
        <q-tab name="profile" label="Profile" />
      </q-tabs>

      <div class="row" :class="leftDrawerOpen ? '' : 'hidden'">
        <template v-if="activeTab === 'chats'">
          <q-input class="full-width" filled dense v-model="searchChats" placeholder="Search..." clearable>
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <ChatBadge v-for="value in chats" :key="value.id" :chat="value" class="full-width"
            @deleteChatEvent="deleteChat(value.id)" />
          <div class="full-width flex justify-end q-pr-md q-py-md">
            <q-btn fab icon="add" color="primary" @click="addNewChat" />
          </div>

        </template>

        <template v-else-if="activeTab === 'channels'">
          <q-input class="full-width" filled dense v-model="searchChannels" placeholder="Search..." clearable>
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <ChannelBadge v-for="value in channels" :key="value.id" :channel="value" class="full-width"
            @deleteChannelEvent="deleteChannel(value.id)" />
          <div class="full-width flex justify-end q-pr-md q-py-md">
            <q-btn fab icon="add" color="primary" @click="addNewChannel" />
          </div>
        </template>
        <template v-else-if="activeTab === 'profile'">
          <UserProfile class="full-width" :profile="profile" />
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
import UserProfile from 'src/components/UserProfile.vue';
import { ChannelType, type ChannelAtr, type ChatAtr, type ProfileAtr, type TabName, type DeviceType } from 'src/components/models';
import { ref } from 'vue';
import { Platform } from 'quasar'

export default {
  data() {
    return {
      searchChats: ref(''),
      searchChannels: ref(''),
      leftDrawerOpen: true,
      activeTab: 'channels' as TabName,
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
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
      profile: {
        id: 0,
        email: 'johndough@gmail.com',
        nickname: 'johndough33',
        name: 'John',
        surname: 'Dough',
        description: 'Just a generic user profile description.'
      } as ProfileAtr,
    };
  },
  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    deleteChannel(id: number) {
      this.channels = this.channels.filter(ch => ch.id !== id);
    },
    deleteChat(id: number) {
      this.chats = this.chats.filter(ch => ch.id !== id);
    },
    addNewChannel() {
      const newChannel: ChannelAtr = {
        id: this.channels.length ? (this.channels[this.channels.length - 1]?.id ?? 0) + 1 : 0,
        type: ChannelType.Public,
        name: 'New Channel',
        description: 'New channel description'
      };
      this.channels.push(newChannel);
    },
    addNewChat() {
      const newChat: ChatAtr = {
        id: this.chats.length ? (this.chats[this.chats.length - 1]?.id ?? 0) + 1 : 0,
        senderId: Math.floor(Math.random() * 100),
        senderNickname: 'New Chat User'
      };
      this.chats.push(newChat);
    }
  },
  components: {
    ChannelBadge, ChatBadge, UserProfile
  },
}
</script>