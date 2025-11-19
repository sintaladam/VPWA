<template>
  <div class="row full-height justify-evenly overflow-auto" ref="messageContainer">
    <div class="col-11 column justify-end">
      <template v-for="(mess, index) in messages" :key="index">
        <q-chat-message :text="[mess.content]" :sent="mess.sender.id === userStore.user?.id" :name="mess.sender.nickname"
          :bg-color="mess?.type === 'command' ? 'green' : userStore.user?.id == mess.sender.id ? 'primary' : 'grey'" class="" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import type { messageType } from './models';
import { useAuthStore } from 'src/stores/authStore';
import { useActivePage } from 'src/stores/threadStore';
import { nextTick } from 'vue';
import type { Message } from 'src/contracts';

export default {
  data() {
    return {
      userStore: useAuthStore(),
      activePage: useActivePage(),
      localMessages: [] as (Message & {type:messageType})[]
    }
  },
  methods: {
    addLocalMessage(newMessage: (Message & {type:messageType})) {
      this.localMessages.push(newMessage);
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
      const allMessages: (Message & {type?: messageType})[] = [
        ...this.activePage.messages,
        ...this.localMessages
      ];
      return allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
