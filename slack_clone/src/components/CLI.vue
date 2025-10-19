<template>
  <q-input outlined v-model="messageInput"
    class="input-field full-height full-width"
    @keyup.enter.exact.prevent="submitMessage"
  />
</template>

<script lang="ts">
import { CommandHandler } from 'src/utils/CommandHandler';

export default {
  data() {
    return {
      messageInput: '',
      command: new CommandHandler()

    };
  },
  methods: {
    isCommand(message: string): boolean {
      return message.startsWith('/');
    },
    submitMessage() {
      const mess = this.messageInput.trim();
      if (!mess) return;
      if (this.isCommand(mess)) {
        console.log('Command detected:', mess);
        const command = mess.slice(1); 
        this.command.handle(command);
      }else {
        this.$emit('submitMessageEvent', mess);
        this.messageInput=''
      }
    }
  },
  emits: {
    submitMessageEvent: (msg: string) => typeof msg === 'string'
  },
}
</script>

<style scoped>
  input.input-field {
    border-radius: 20px;
  }
</style>
