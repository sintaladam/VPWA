<template>
  <div class="row full-height justify-evenly overflow-auto" ref="messageContainer">
    <div class="col-11 column justify-end">
      <q-infinite-scroll :offset="250" @load="onLoad" class="column" reverse>
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>

        <template v-for="(mess, index) in messages" :key="index">
          <q-chat-message :text="[mess.content]" :sent="mess.sender.id === userStore.user?.id"
            :name="mess.sender.nickname"
            :bg-color="mess?.type === 'command' ? 'green' : userStore.user?.id == mess.sender.id ? 'primary' : 'grey'"
            class="" />
          <q-chat-message :text="[mess.content]" :sent="mess.sender.id === userStore.user?.id"
            :name="mess.sender.nickname"
            :bg-color="mess?.type === 'command' ? 'green' : userStore.user?.id == mess.sender.id ? 'primary' : 'grey'"
            class="" />
        </template>
      </q-infinite-scroll>
    </div>
  </div>
</template>

<script lang="ts">
import type { messageType } from './models';
import { useAuthStore } from 'src/stores/authStore';
import { useActivePage } from 'src/stores/threadStore';
import type { Message } from 'src/contracts';
import { socket } from 'src/boot/socket';
import { nextTick } from 'vue';

export default {
  data() {
    return {
      loading: false,
      userStore: useAuthStore(),
      activePage: useActivePage(),
      localMessages: [] as (Message & { type: messageType })[],
      ignoreInitialLoad: true,
    }
  },
  methods: {
    async onLoad(index: number, done: (stop?: boolean) => void) {

      // Prevent concurrent loads
      if (this.loading) {
        done(true);
        return;
      }

      this.loading = true;
      const minDisplayMs = 800; // minimum time to show the loader (increase to show loader longer)
      const start = Date.now();

      const perPage = (this.activePage && this.activePage.perPage) ?? 25;

      console.log('q-infinite-scroll @load triggered, index=', this.messages[0]?.id, this.messages[0]?.content, this.messages[0]?.createdAt);

      const olderMessages: Message[] = await new Promise(resolve => {
        let settled = false;
        const handler = (data: { messages: Message[] }) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          socket.off('message', handler);
          resolve(data.messages || []);
        };

        socket.on('message', handler);
        socket.emit('loadMessages', { perPage, createdAt: this.messages[0]?.createdAt });

        const timeoutId = setTimeout(() => {
          if (settled) return;
          settled = true;
          socket.off('message', handler);
          resolve([]);
        }, 5000);
      });

      // ensure loader is visible for at least minDisplayMs
      const elapsed = Date.now() - start;
      if (elapsed < minDisplayMs) {
        await new Promise(res => setTimeout(res, minDisplayMs - elapsed));
      }

      this.loading = false;
      // stop infinite-scroll if server returned no more messages
      done(olderMessages.length === 0);
    },
    async fetchOlderMessages() {
      return new Promise<(Message & { type: messageType })[]>(resolve => {
        const perPage = (this.activePage && this.activePage.perPage) ?? 25;
        socket.emit('loadMessages', { perPage: perPage });
        setTimeout(() => resolve([]), 500);
      });
    },
    addLocalMessage(newMessage: (Message & { type: messageType })) {
      this.activePage.messages.push(newMessage);
    },
    scrollToBottom() {
      const container = this.$refs.messageContainer as HTMLElement | null;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
  },
  watch: {
    'activePage.messages': {
      async handler() {
        await nextTick()
        this.scrollToBottom()
      },
      deep: true,
    }
  },
  computed: {
    messages() {
      const allMessages: (Message & { type?: messageType })[] = [
        ...this.activePage.messages,
        ...this.localMessages
      ];
      return allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  },
  async mounted() {
    // wait until messages exist
    if (this.messages.length === 0) {
      const waitForMessages = async () => {
        while (this.messages.length === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      };
      await waitForMessages();
    }
  },
}
</script>
