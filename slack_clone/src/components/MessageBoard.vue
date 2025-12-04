<template>
  <div class="q-pr-sm full-height overflow-auto" ref="messageContainer">
    <div class="col-11 column">
      <q-infinite-scroll
        :offset="250"
        @load="onLoad"
        class="column"
        reverse
      >
        <template v-slot:loading>
          <div class="row justify-center q-my-md" style="height:40px;">
            <q-spinner-dots color="primary" size="40px" v-show="loading" />
          </div>
        </template>

        <template v-for="mess in messages" :key="mess.id">
          <q-chat-message
            :text="[mess.content]"
            :sent="mess.sender.id === userStore.user?.id"
            :name="mess.sender.nickname"
            :bg-color="getMessageBgColor(mess)"
          >
            <template v-slot:avatar>
              <q-avatar
                square
                class="q-mx-sm"
                :text-color="getMessageBgColor(mess)"
                :style="{
                  border: '1px solid ' + colors.getPaletteColor(getMessageBgColor(mess)),
                  borderRadius: '4px'
                }"
              >
                {{ mess.sender.nickname?.[0]?.toUpperCase() }}
              </q-avatar>
            </template>
          </q-chat-message>
        </template>

      </q-infinite-scroll>

      <div v-for="item in activity" :key="item.sender.id" class="column">
        <q-chat-message v-show="showTyping"
          :text="[item.content]"
          :sent="false"
          :name="item.sender.nickname + ' is typing...'"
          bg-color="grey"
        >
          <template v-slot:avatar>
            <q-avatar
              square
              class="q-mx-sm"
              text-color="grey"
              :style="{
                border: '1px solid ' + 'grey',
                borderRadius: '4px'
              }"
            >
              {{ item.sender.nickname?.[0]?.toUpperCase() }}
            </q-avatar>
          </template>
        </q-chat-message>
      </div>
      <q-item-label v-show="activity.length" v-on:click="showTyping = !showTyping" class="cursor-pointer text-secondary q-hoverable">{{ peopleTyping }}</q-item-label>
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
import { colors } from 'quasar'

export default {
  data() {
    return {
      loading: false,
      userStore: useAuthStore(),
      activePage: useActivePage(),
      localMessages: [] as (Message & { type: messageType })[],
      // Quasar colors helper exposed to the template
      colors,
      // when true, skip auto-scrolling to bottom for the next update (used by onLoad)
      preventAutoScroll: false,
      showTyping: false,
    }
  },
  methods: {
    isPing(mess: Message & { type?: messageType }): boolean {
      const currentUsername = this.userStore.user?.nickname;
      return currentUsername ? mess.content.includes(`@${currentUsername}`) : false;
    },
    getMessageBgColor(mess: Message & { type?: messageType }): string {
      // check if message is a command
      if (mess?.type === 'command') {
        return 'green';
      }
      
      // check if message mentions current user
      if (this.isPing(mess)) {
        return 'yellow-9'; // highlight color for mentions
      }
      
      // default colors based on sender
      return this.userStore.user?.id === mess.sender.id ? 'primary' : 'grey';
    },
    async onLoad(index: number, done: (stop?: boolean) => void) {

      // Prevent concurrent loads
      if (this.loading) {
        done(true);
        return;
      }

      this.loading = true;
      // mark that we're loading older messages so the watcher won't scroll to bottom
      this.preventAutoScroll = true;
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
      if (!container) return;

      const threshold = 80;
      const distanceFromBottom =
        container.scrollHeight - (container.scrollTop + container.clientHeight);
      console.log(distanceFromBottom)

      const isAtBottom = distanceFromBottom <= threshold;

      if (isAtBottom) {
        container.scrollTop = container.scrollHeight;
      }
    },
  },
  watch: {
    'activePage.messages': {
      async handler() {
        await nextTick();
        // if an infinite-load just happened, skip a single auto-scroll
        if (this.preventAutoScroll) {
          this.preventAutoScroll = false;
          return;
        }
        this.scrollToBottom();
      },
      deep: true,
    },
    showTyping: {
      async handler() {
        await nextTick();
        // if an infinite-load just happened, skip a single auto-scroll
        if (this.preventAutoScroll) {
          this.preventAutoScroll = false;
          return;
        }
        this.scrollToBottom();
      },
      deep: true,
    },
    activity: {
      async handler(newVal) {
        if (!newVal.length) this.showTyping = false;

        await nextTick();
        // if an infinite-load just happened, skip a single auto-scroll
        if (this.preventAutoScroll) {
          this.preventAutoScroll = false;
          return;
        }
        this.scrollToBottom();
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
    },
    activity() {
      return this.activePage.typingActivity.map(el => el.activity).filter(el => el.sender.id !== this.userStore.user!.id);
    },
    peopleTyping() {
      if (this.activePage.typingActivity.length > 3) {
        return 'multiple people typing';
      }
      return this.activity.map(el => el.sender.name).join(', ') + ' typing...';
    },
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