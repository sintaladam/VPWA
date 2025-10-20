<template>
  <q-input outlined v-model="messageInput" class="input-field full-height full-width"
    @keyup.enter.exact.prevent="submitMessage" />
</template>

<script lang="ts">
import { CommandHandler } from 'src/utils/CommandHandler';
import type { messageType } from 'src/components/models';

export default {
  data() {
    return {
      messageInput: '',
      messageType: '' as messageType,
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
        const messageOutput = this.command.handle(command);
        this.$emit('submitMessageEvent', messageOutput, this.messageType = 'command');
        this.messageInput = ''
      } else {
        this.$emit('submitMessageEvent', mess, this.messageType = 'message');
        this.messageInput = ''
      }
    }
  },
  emits: {
    submitMessageEvent: (msg: string, messageType: messageType) => {
      void messageType;
      return typeof msg === 'string';
    },
  }
}
</script>

<style scoped>
input.input-field {
  border-radius: 20px;
}
</style>
