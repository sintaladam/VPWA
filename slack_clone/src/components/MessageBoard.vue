<template>
  <div class="row full-height justify-evenly overflow-auto" >
    <!-- <button @click="loadMessages" class="">daj</button> -->
    <div class="col-11 column justify-end">
      <template v-for="(mess,index) in messages" :key="index">
        <q-chat-message :text="[mess.content]" :sent="mess.senderId===1" class=""/>
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
    loadMessages(newMessages: Message[]) {
      this.messages.push(...newMessages)
    }
  }
}
</script>
