<template>
  <div class="row full-height justify-evenly overflow-auto" ref="messageContainer">
    <div class="col-11 column justify-end">
      <template v-for="(mess, index) in messages" :key="index">
        <q-chat-message :text="[mess.content]" :sent="mess.senderId === 1" :name="mess.senderName"
          :bg-color="mess.type === 'command' ? 'green' : userStore.id == mess.senderId ? 'primary' : 'grey'" class="" /> 
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import type { Message, messageType } from './models';
import { useUserStore } from 'src/stores/userUserStore';
import { useActivePage } from 'src/stores/activePage';
import { nextTick } from 'vue';

export default {
  data() {
    return {
      userStore: useUserStore(),
      activePage: useActivePage(),
      localMessages: [] as Message[]
    }
  },
  methods: {
    addMessage(newMessage: {
      timestamp: number,
      senderId: number,
      content: string,
      type: messageType;
    }) {
      if (newMessage.type === 'command') {
        this.localMessages.push({ ...newMessage, id: -1, senderName: 'System' });
      }
      else {
        this.activePage.addMessage({ threadId:this.activePage.activePageId, threadType: this.activePage.activePageType, ...newMessage});
      }
    },
    async scrollToBottom() {
      await nextTick()
      const container = this.$refs.messageContainer as HTMLDivElement | undefined
      if (!container) return

      container.scrollTop = container.scrollHeight
      if ('scrollTo' in container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      }
    }
  },
  computed: {
    messages() {
      const allMessages: Message[] = [
        ...this.activePage.getThreadMessages(this.activePage.activePageId, this.activePage.activePageType),
        ...this.localMessages
      ];
      return allMessages.sort((a, b) => a.timestamp - b.timestamp);
    }
  },
  mounted() {
    this.scrollToBottom()
  },
  watch: {
    messages: {
      handler() {
        this.scrollToBottom()
      },
      deep: true,
    },
  }
}
</script>
