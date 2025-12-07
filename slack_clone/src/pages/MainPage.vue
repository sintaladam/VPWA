<template>
  <q-page class="q-pa-sm" style="height: calc(100vh - 50px)">
    <div class="column full-height no-wrap">
      <div class="bg-primary text-white q-pa-md rounded-borders rounded-t" style="height: 50px; flex: 0 0 auto;">
        {{ channelName }}
      </div>
      <div class="col q-pa-md">
        <MessageBoard ref="msgBoard" />
      </div>
      <div class="bg-white-1" style="height: 75px; flex: 0 0 auto;">
        <CLI @submitMessageEvent="addMessage" @showList="showList" />
      </div>
    </div>

    <UserList 
      v-model="editorOpen"  
    />
  </q-page>
</template>

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
    this.activeStore.setActivePage(Number(this.$route.params.id))
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
