<template>
  <button @click="loadMessages">daj</button>
  <div class="row justify-evenly">
    <div class="col-10">
      <template v-for="(mess,index) in messages" :key="index">
        <q-chat-message :text="[mess.content]" :sent="mess.senderId===1" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import type { Message } from './models';

export default {
  data() {
    return {
      messages: [] as Message[]
    }
  },
  methods: {
    loadMessages() {
      const newMessages = [
        {
          id: 0,
          timestamp: 'a',
          senderId: 1,
          senderName: 'ja',
          content: 'ab'
        },
        {
          id: 0,
          timestamp: 'a',
          senderId: 2,
          senderName: 'ja',
          content: 'cd'
        },
      ]
      this.messages.push(...newMessages)
    }
  }
}
</script>
