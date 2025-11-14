<template>
  <q-page class="q-pa-sm" style="height: calc(100vh - 50px)"> <!-- this just sucks but it will have to do -->
    <!-- content -->
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

    <!-- <UserList :users="activeUsers" v-model="editorOpen" /> -->


  </q-page>
</template>

<script lang="ts">
import MessageBoard from 'src/components/MessageBoard.vue';
import CLI from 'src/components/CLI.vue';
import { useActivePage } from '../stores/threadStore';
import type { messageType, pageType, UserAtr } from 'src/components/models';
import { useAuthStore } from 'src/stores/authStore';
//import UserList from 'src/components/UserList.vue'
import { ref } from 'vue';

export default {
  components: {
    MessageBoard,
    CLI,
    //UserList
  },
  methods: {
    addMessage(value: string, type: messageType) {
      (this.$refs.msgBoard as InstanceType<typeof MessageBoard>).addMessage({
        timestamp: Date.now(),
        senderId: this.userStore.user?.id as number,
        content: value,
        type: type
      });
    },
    showList(data: UserAtr[], messageType: messageType) {
      if (messageType === 'component') {
        this.editorOpen = !this.editorOpen;
        this.activeUsers = data;
      }
    }
  },
  data() {
    return {
      activeStore: useActivePage(),
      userStore: useAuthStore(),
      editorOpen: ref(false),
      activeUsers: [] as UserAtr[]
    }
  },
  created() {
    this.activeStore.setActivePage(Number(this.$route.params.id), this.$route.name as pageType)
  },
  computed: {
    channelName() {
      return this.activeStore.getThreadName();
    }
  },
}
</script>
