<template>
  <q-layout view="hHh LpR fFf">

    <q-header elevated class="bg-grey text-white" height-hint="98">
      <q-toolbar>
        <q-btn v-if="drawerBehavior === 'mobile' && $q.platform.is.desktop" flat @click="toggleLeftDrawer" round dense
          icon="menu" class="q-mr-sm" />
        <q-toolbar-title class="text-center flex justify-between items-center">
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar> -->
          slack clone
          <div class="row q-gutter-xs">
            <div class="row flex-end">
              <q-btn round flat @click="profileEditorOpen = true" class="p-0">
                <q-avatar>
                  <img src="https://cdn.quasar.dev/img/avatar.png">
                </q-avatar>
              </q-btn>
              <q-btn unelevated rounded color="negative" @click="onLogout" class="p-0">
                Log out
              </q-btn>

            </div>

            <updated-user-profile v-model="profileEditorOpen" :profile="profile" />

            <q-btn-dropdown unelevated rounded :color="statusIcon.color">
              <template #label>
                <q-icon :name="statusIcon.icon" />
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
      :side="activeDevice === 'desktop' ? 'left' : 'right'" :behavior="drawerBehavior" bordered
      class="q-pa-sm no-scrollbar">

      <div class="row justify-center q-gutter-xs">
        <q-tabs v-model="activeTab" dense class="text-dark col rounded-borders" active-color="primary"
          indicator-color="primary" v-show="!miniState">
          <q-tab name="channels" label="Channels" />
          <q-tab name="invites" label="Invites" />
        </q-tabs>
        <q-btn dense flat round :icon="miniState ? 'arrow_right' : 'arrow_left'" v-if="activeDevice === 'desktop'"
          @click="handleDrawerToggle" class="" />
      </div>

      <div v-show="!miniState" class="q-gutter-sm q-py-sm">
        <template v-if="activeTab === 'channels'">
          <q-input class="rounded-borders" outlined dense v-model="searchChannels" placeholder="Search..." clearable>
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <ChannelBadge v-for="value in channels" :key="value.id" :channelId="value.id" class=""
            @deleteChannelEvent="deleteThread(value.id)" />
          <div class="full-width flex justify-center q-py-md">
            <q-btn fab-mini icon="add" color="primary" @click="channelCreatorOpen = true" />
            <channel-creator v-model="channelCreatorOpen" />
          </div>
        </template>
        <template v-else-if="activeTab === 'invites'">
          <div class="full-width flex justify-center q-pl-sm">
            <InviteBadge v-for="value in invites" :key="value.id" :invite="value" />
          </div>
        </template>
      </div>
    </q-drawer>
    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>

  </q-layout>
</template>

<script lang="ts">
import ChannelBadge from 'src/components/ChannelBadge.vue';
import ChannelCreator from 'src/components/ChannelCreator.vue';
import UpdatedUserProfile from 'src/components/UpdatedUserProfile.vue';
import InviteBadge from 'src/components/InviteBadge.vue';
import { type TabName, type DeviceType, type ProfileAtr } from 'src/components/models';
import { Platform } from 'quasar'
import { useAuthStore } from 'src/stores/authStore';
import { useActivePage } from 'src/stores/threadStore';
import { type Channel } from 'src/contracts';

export default {
  data() {
    return {
      searchChannels: '',
      activeTab: 'channels' as TabName,
      miniState: false,
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
      leftDrawerOpen: Platform.is.desktop ? true : false,
      userStore: useAuthStore(),
      activePage: useActivePage(),
      channelCreatorOpen: false,
      profileEditorOpen: false,
    };
  },
  watch: {
    drawerBehavior(newBehavior) {
      if (newBehavior === 'mobile') {
        this.miniState = false;
      }
    }
  },
  methods: {
    handleDrawerToggle() {
      if (this.drawerBehavior === 'desktop') {
        this.toggleMini();
      } else {
        this.toggleLeftDrawer();
      }
    },
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    toggleMini() {
      this.miniState = !this.miniState;
    },
    deleteThread(id: number) {
      this.activePage.deleteThread(id);
      if (this.activePage.activePageId == id) {
        this.$router.push('/' + 'channel');
      }
    },
    async onLogout() {
      await this.userStore.logout()
    }
  },
  components: {
    ChannelBadge, UpdatedUserProfile, ChannelCreator, InviteBadge
  },
  computed: {
    drawerBehavior(): DeviceType {
      if (Platform.is.mobile) return 'mobile';
      return this.$q.screen.width >= 600 ? 'desktop' : 'mobile';
    },
    statusIcon() {
      switch (this.userStore.status) {
        case 'online':
          return { icon: 'check_circle', color: 'positive' }
        case 'offline':
          return { icon: 'cancel', color: 'negative' }
        case 'dnd':
          return { icon: 'do_not_disturb', color: 'orange' }
        default:
          return { icon: '', color: '' }
      }
    },
    channels() {
      return this.activePage.searchThreads('channel', this.searchChannels) as Channel[];
    },
    profile() {
      return { ...this.userStore.getProfileDetails() as ProfileAtr};
    },
    invites() {
      return this.activePage.getInvites(this.userStore.user?.id as number)
    }
  },
  created() {
    this.activePage.getChannels()
  }
}
</script>

<style>
.no-scrollbar {
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>