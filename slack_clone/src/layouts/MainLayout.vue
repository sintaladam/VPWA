<template>
  <q-layout view="hHh LpR fFf">

    <q-header elevated class="bg-grey text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title class="text-center flex justify-between items-center">
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar> -->
          slack clone
          <div class="row q-gutter-xs">
            
            <q-avatar>
            <img src="https://cdn.quasar.dev/img/avatar.png">
            </q-avatar>
            <q-btn-dropdown unelevated rounded :color="modeIcon.color">
              <template #label>
                <q-icon  :name="modeIcon.icon" />
              </template>
              <q-list>
                <q-item clickable v-close-popup @click="changeMode('on')">
                  <q-item-section>
                    <q-item-label class="flex justify-center">Online</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="changeMode('dnd')">
                  <q-item-section>
                    <q-item-label class="flex justify-center">DND</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="changeMode('off')">
                  <q-item-section>
                    <q-item-label class="flex justify-center">Offline</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-btn v-if="activeDevice === 'mobile'" flat @click="toggleLeftDrawer" round dense icon="menu"
              class="flex justify-end" />
          </div>
          
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" :mini="miniState" :mini-width="60"
      :side="activeDevice === 'desktop' ? 'left' : 'right'" :behavior="activeDevice" bordered class="q-pa-sm no-scrollbar">
      
      <div class="row justify-center q-gutter-xs">
        <q-tabs v-model="activeTab" dense class="text-dark col rounded-borders"
          active-color="primary" indicator-color="primary" v-show="!miniState">
          <q-tab name="channels" label="Channels" />
          <q-tab name="chats" label="Chats" />
          <!-- <q-tab name="profile" label="Profile" /> -->
        </q-tabs>
        <q-btn dense flat round :icon="miniState ? 'arrow_right' : 'arrow_left'" v-if="activeDevice === 'desktop'"
              @click="toggleMini" class=""/>
      </div>

      <div v-show="!miniState" class="q-gutter-sm q-py-sm">
          <template v-if="activeTab === 'chats'">
            <q-input class="" outlined dense v-model="searchChats" placeholder="Search..." clearable>
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <ChatBadge v-for="value in chats" :key="value.id" :chat="value" class=""
              @deleteChatEvent="deleteChat(value.id)" />
            <div class="full-width flex justify-end q-pr-md q-py-md">
              <q-btn fab icon="add" color="primary" @click="addNewChat" />
            </div>

          </template>

          <template v-else-if="activeTab === 'channels'">
            <q-input class="rounded-borders" outlined dense v-model="searchChannels" placeholder="Search..." clearable>
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <ChannelBadge v-for="value in channels" :key="value.id" :channel="value" class=""
              @deleteChannelEvent="deleteChannel(value.id)" />
            <div class="full-width flex justify-center q-py-md">
              <q-btn fab-mini icon="add" color="primary" @click="addNewChannel" />
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
import { ChannelType, type ChannelAtr, type ChatAtr, type ProfileAtr, type TabName, type DeviceType, type userMode } from 'src/components/models';
import { ref } from 'vue';
import { Platform } from 'quasar'

export default {
  data() {
    return {
      searchChats: ref(''),
      searchChannels: ref(''),
      activeTab: 'channels' as TabName,
      miniState: false,
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
      leftDrawerOpen: Platform.is.desktop ? true : false,
      currMode: 'on' as userMode,
    

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
    toggleMini() {
      this.miniState = !this.miniState;
    },
    deleteChannel(id: number) {
      this.channels = this.channels.filter(ch => ch.id !== id);
    },
    deleteChat(id: number) {
      this.chats = this.chats.filter(ch => ch.id !== id);
    },
    addNewChannel() {
      const time = new Date();
      const newChannel: ChannelAtr = {
        id: this.channels.length ? (this.channels[this.channels.length - 1]?.id ?? 0) + 1 : 0,
        type: ChannelType.Public,
        name: 'New Channel',
        description: 'New channel description',
        createdAt: time
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
    },
    changeMode(mode:userMode) {
      this.currMode = mode;
    }
  },
  components: {
    ChannelBadge, ChatBadge, UserProfile
  },
  computed: {
    modeIcon() {
      switch (this.currMode) {
        case 'on':
          return { icon:'check_circle', color:'positive' }
        case 'off':
          return { icon: 'cancel', color: 'negative' }
        case 'dnd':
          return { icon: 'do_not_disturb', color: 'orange' }
        default:
          return { icon: '', color: '' }
      }
    }
  }
}
</script>
<style>
.no-scrollbar  {
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar  {
  display: none;
}
</style>