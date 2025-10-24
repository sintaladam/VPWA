<template>
  <q-expansion-item
    expand-icon-toggle
    class="q-pa-none custom-class"
  >
    <template #header>
      <q-item class="full-width column q-pa-xs rounded-borders" clickable :to="`/chat/${chat.id}`">
        <div class="text-weight-medium">{{ chat.senderNickname }}</div>
        <div class="text-caption text-grey">Sender ID: {{ chat.senderId }}</div>
      </q-item>
    </template>

    <q-card>
      <q-card-section>
        Chat ID: {{ chat.id }} <br>
        Sender ID: {{ chat.senderId }}
        <div class="column q-pt-md q-gutter-md">
          <q-btn color="white" text-color="negative" label="delete chat" @click="deleteOpen = true"/>
          <leave-confirmation v-model="deleteOpen" title="Delete Chat" @deleteEvent="forwardDelete()"/>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script lang="ts">
import type { ChatAtr } from './models';
import { useActivePage } from '../stores/threadStore'
import LeaveConfirmation from './LeaveConfirmation.vue';

export default {
  data() {
    return {
      isOpen: false,
      activeStore: useActivePage(),
      deleteOpen: false,
    }
  },
  props: {
    chatId: Number,
  },
  components: {
    LeaveConfirmation,
  },
  methods: {
    forwardDelete() {
      this.$emit('deleteChatEvent');
    }
  },
  computed: {
    chat() {
      return this.activeStore.getThreadDetails(this.chatId as number, 'chat') as ChatAtr;
    }
  },
  emits: ['deleteChatEvent']
}
</script>

<style scoped>
.custom-class:hover {
  box-shadow: 0 0 10px var(--q-secondary);
}
/* .custom-class :deep(.q-expansion-item__container > .q-item:hover) {
} */
</style>
