<template>
  <q-expansion-item
    expand-icon-toggle
    expand-separator
    :label="chat.senderNickname"
  >
    <template #header>
      <q-item class="full-width column" @click="activeStore.setActivePage(chat.senderNickname)" clickable :to="`/chats/${chat.id}`">
        <div class="text-weight-medium">{{ chat.senderNickname }}</div>
        <div class="text-caption text-grey">Sender ID: {{ chat.senderId }}</div>
      </q-item>
    </template>

    <q-card @click="console.log('random')">
      <q-card-section>
        Chat ID: {{ chat.id }} <br>
        Sender ID: {{ chat.senderId }}
        <div class="column q-pt-md q-gutter-md">
          <q-btn color="white" text-color="red-10" label="delete chat" />
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script lang="ts">
import type { ChatAtr } from './models';
import { useActivePage } from '../stores/activePage'

export default {
  data() {
    return {
      isOpen: false,
      activeStore: useActivePage()
    }
  },
  props: {
    chat: {
      type: Object as () => ChatAtr,
      required: true,
    }
  }
}
</script>
