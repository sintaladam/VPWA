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
            
            <q-btn round flat @click="profileEditorOpen = true" class="p-0">
              <q-avatar>
                <img src="https://cdn.quasar.dev/img/avatar.png">
              </q-avatar>
            </q-btn>

            <updated-user-profile v-model="profileEditorOpen" :profile="profile"/>

            <q-btn-dropdown unelevated rounded :color="statusIcon.color">
              <template #label>
                <q-icon  :name="statusIcon.icon" />
              </template>
              <q-list>
                <q-item clickable v-close-popup @click="userStore.changeStatus('online')">
                  <q-item-section>
                    <q-item-label class="flex justify-center">Online</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="userStore.changeStatus('dnd')">
                  <q-item-section>
                    <q-item-label class="flex justify-center">DND</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="userStore.changeStatus('offline')">
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

          <ChatBadge v-for="value in chats" :key="value.id" :chatId="value.id" class=""
            @deleteChatEvent="deleteThread(value.id, 'chat')" />
          <div class="full-width flex justify-center q-py-md">
            <q-btn fab-mini icon="add" color="primary" @click="chatCreatorOpen=true" />
            <ChatCreator v-model="chatCreatorOpen"/>
          </div>

        </template>

        <template v-else-if="activeTab === 'channels'">
          <q-input class="rounded-borders" outlined dense v-model="searchChannels" placeholder="Search..." clearable>
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <ChannelBadge v-for="value in channels" :key="value.id" :channelId="value.id" class=""
            @deleteChannelEvent="deleteThread(value.id, 'channel')" />
          <div class="full-width flex justify-center q-py-md">
            <q-btn fab-mini icon="add" color="primary" @click="channelCreatorOpen=true" />
            <channel-creator v-model="channelCreatorOpen"/>
          </div>
        </template>
        <!-- <template v-else-if="activeTab === 'profile'">
          <UserProfile class="full-width" :profile="profile" />
        </template> -->
      </div>
    </q-drawer>

    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>

  </q-layout>
</template>

<script lang="ts">
import ChannelBadge from 'src/components/ChannelBadge.vue';
import ChatBadge from 'src/components/ChatBadge.vue';
import ChannelCreator from 'src/components/ChannelCreator.vue';
import ChatCreator from 'src/components/ChatCreator.vue';
import UpdatedUserProfile from 'src/components/UpdatedUserProfile.vue';
import { type TabName, type DeviceType, type pageType, type ChannelAtr, type ChatAtr } from 'src/components/models';
import { Platform } from 'quasar'
import { useUserStore } from 'src/stores/userUserStore';
import { useActivePage } from 'src/stores/activePage';

export default {
  data() {
    return {
      searchChats: '',
      searchChannels: '',
      activeTab: 'channels' as TabName,
      miniState: false,
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
      leftDrawerOpen: Platform.is.desktop ? true : false,
      userStore: useUserStore(),
      activePage: useActivePage(),
      channelCreatorOpen: false,
      chatCreatorOpen: false,
      profileEditorOpen: false,

      // profile: {
      //   id: 0,
      //   email: 'johndough@gmail.com',
      //   nickname: 'johndough33',
      //   name: 'John',
      //   surname: 'Dough',
      //   description: 'Just a generic user profile description.'
      // } as ProfileAtr,
    };
  },
  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    toggleMini() {
      this.miniState = !this.miniState;
    },
    deleteThread(id: number, type: pageType) {
      this.activePage.deleteThread(id, type);
      if (this.activePage.activePageId == id && this.activePage.activePageType == type) {
        this.$router.push('/' + type);
      }
    }
  },
  components: {
    ChannelBadge, ChatBadge, UpdatedUserProfile, ChannelCreator, ChatCreator
  },
  computed: {
    statusIcon() {
      switch (this.userStore.status) {
        case 'online':
          return { icon:'check_circle', color:'positive' }
        case 'offline':
          return { icon: 'cancel', color: 'negative' }
        case 'dnd':
          return { icon: 'do_not_disturb', color: 'orange' }
        default:
          return { icon: '', color: '' }
      }
    },
    channels() {
      return this.activePage.searchThreads('channel', this.searchChannels) as ChannelAtr[];
    },
    chats() {
      return this.activePage.searchThreads('chat', this.searchChats) as ChatAtr[];
    },
    profile() {
      return { ...this.userStore.getProfileDetails() };
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