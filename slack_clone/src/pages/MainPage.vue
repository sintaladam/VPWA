<template>
  <q-page padding class="" style="height: calc(100vh - 50px)"> <!-- this just sucks but it will have to do -->
    <!-- content -->
    <div class="column full-height no-wrap">
      <div class="bg-primary text-white q-pa-md rounded-borders rounded-t" style="height: 50px; flex: 0 0 auto;">
        {{ activeStore.activePage }}
      </div>
      <div class="col q-pa-md">
        <MessageBoard ref="msgBoard" />
      </div>

      <div class="bg-grey-3 q-pa-md" style="height: 75px; flex: 0 0 auto;">
        <CLI @submitMessageEvent="addMessage" />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import MessageBoard from 'src/components/MessageBoard.vue';
import CLI from 'src/components/CLI.vue';
import { useActivePage } from '../stores/activePage';
import type { messageType } from 'src/components/models';

export default {
  components: {
    MessageBoard,
    CLI,
  },
  methods: {
    addMessage (value:string, type: messageType) {
      (this.$refs.msgBoard as InstanceType<typeof MessageBoard>).loadMessages([
        {
          id: 0,
          timestamp: 'a',
          senderId: 1,
          senderName: 'ja',
          content: value,
          type: type
        },
      ]);
      this.message=value
    }
  },
  data() {
    return {
      message: '',
      activeStore: useActivePage()
    }
  }
}
</script>
