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
        <CLI @submitMessageEvent="addMessage" />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import MessageBoard from 'src/components/MessageBoard.vue';
import CLI from 'src/components/CLI.vue';
import { useActivePage } from '../stores/activePage';
import type { messageType, pageType } from 'src/components/models';
import { useUserStore } from 'src/stores/userUserStore';

export default {
  components: {
    MessageBoard,
    CLI,
  },
  methods: {
    addMessage (value:string, type: messageType) {
      (this.$refs.msgBoard as InstanceType<typeof MessageBoard>).addMessage({
        timestamp: Date.now(),
        senderId: this.userStore.id as number,
        content: value,
        type: type
      });
    }
  },
  data() {
    return {
      activeStore: useActivePage(),
      userStore: useUserStore(),
    }
  },
  created() {
    this.activeStore.setActivePage(Number(this.$route.params.id), this.$route.name as pageType)
    console.log(this.$route.name);
  },
  computed: {
    channelName() {
      return this.activeStore.getThreadName(this.activeStore.activePageId, this.activeStore.activePageType);
    }
  }
}
</script>
