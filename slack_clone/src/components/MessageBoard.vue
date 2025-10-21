<template>
  <div class="row full-height justify-evenly overflow-auto">
    <div class="col-11 column justify-end">
      <template v-for="(mess, index) in messages" :key="index">
        <q-chat-message :text="[mess.content]" :sent="mess.senderId === 1"
          :bg-color="mess.type === 'command' ? 'green' : userStore.id == mess.senderId ? 'blue' : 'grey'" class="" /> 
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import type { Message } from './models';
import { useUserStore } from 'src/stores/userUserStore';

export default {
  data() {
    return {
      userStore: useUserStore(),
      messages: [] as Message[]
    }
  },
  methods: {
    loadMessages(newMessages: Message[]) {
      this.messages.push(...newMessages)
    }
  }
}
</script>
