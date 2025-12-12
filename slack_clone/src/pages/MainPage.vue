<template>
  <q-page class="q-pa-sm" v-if="!activeStore.getThreadDetails(activeStore.activePageId)" >
    <div class="column full-height no-wrap">
      <div class="flex column flex-center"  style="height: calc(100vh - 140px)">
        <q-icon name="sentiment_very_satisfied" size="64px" color="secondary" />
        <div class="text-h5 q-mt-md text-primary">Welcome back</div>
        <div class="text-subtitle2 q-mt-sm text-secondary">
          Select a channel to get started
        </div>
      </div>
      <div class="bg-white-1" style="height: 75px; flex: 0 0 auto;">
        <CLI @submitMessageEvent="addMessage" @showList="showList" />
      </div>
    </div>

    <UserList v-model="editorOpen" v-if="activeStore.activePageId != -1" />
  </q-page>
  <q-page v-else class="q-pa-sm" style="height: calc(100vh - 50px)">
    <div class="column full-height no-wrap">
      <div class="bg-primary text-white q-pa-md rounded-borders rounded-t" style="height: 50px; flex: 0 0 auto;">
        {{ channelName }}
      </div>
      <div class="col q-py-xs" style="flex: 1 1 auto;">
        <MessageBoard ref="msgBoard" />
      </div>
      <div class="bg-white-1" style="height: 75px; flex: 0 0 auto;">
        <CLI @submitMessageEvent="addMessage" @showList="showList" />
      </div>
    </div>

    <UserList v-model="editorOpen" v-if="activeStore.activePageId != -1" />
  </q-page>
</template>
<!-- 
<q-page class="flex flex-center" v-if="!activeStore.getThreadDetails(activeStore.activePageId)">
  <div class="text-center">
    <q-icon name="sentiment_very_satisfied" size="64px" color="secondary" />
    <div class="text-h5 q-mt-md text-primary">Welcome back</div>
    <div class="text-subtitle2 q-mt-sm text-secondary">
      Select a channel to get started
    </div>
  </div>
</q-page> -->

<script lang="ts">
import MessageBoard from 'src/components/MessageBoard.vue';
import CLI from 'src/components/CLI.vue';
import { useActivePage } from '../stores/threadStore';
import type { messageType, UserAtr } from 'src/components/models';
import { useAuthStore } from 'src/stores/authStore';
import UserList from 'src/components/UserList.vue'
import { ref } from 'vue';
import type { User } from 'src/contracts';
import SocketService from 'src/services/SocketService';

export default {
  components: {
    MessageBoard,
    CLI,
    UserList
  },
  methods: {
    addMessage(value: string, type: messageType) {
      if (type === 'message') {
        console.log('sending', type, value);
        SocketService.send('message', { message: value })
      }
      else {
        (this.$refs.msgBoard as InstanceType<typeof MessageBoard>).addLocalMessage({
          id: -1,
          sender: this.userStore.user as User,
          content: value,
          createdAt: new Date().toISOString(),
          type
        });
      }

    },
    showList(data: UserAtr[], messageType: messageType) {
      if (messageType === 'component') {
        this.editorOpen = true;
      }
    }
  },
  data() {
    return {
      activeStore: useActivePage(),
      userStore: useAuthStore(),
      editorOpen: ref(false),
    }
  },
  created() {
    console.log('id:', this.$route.params.id)
    this.activeStore.setActivePage(this.$route.params.id ? Number(this.$route.params.id) : null)
  },
  computed: {
    channelName() {
      return this.activeStore.getThreadName();
    },
    getCreatorId(): number {
      const channel = this.activeStore.getThreadDetails(this.activeStore.activePageId);
      return channel?.creatorId ?? this.userStore.user?.id ?? 0;
    }
  },
}
</script>
