<template>
  <div class="custom-border full-height">
  <q-input autogrow v-model="messageInput" class="input-field full-height full-width overflow-auto q-pa-sm no-scrollbar" style="max-height: 65px;"
    @keyup.enter.exact.prevent="submitMessage" />
  </div>
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
        const parts = mess.slice(1).split(' ');
        const command = parts[0] as string;
        const argument = parts.slice(1);

        const messageOutput = this.command.handle(command, argument);
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
.custom-border {
  border: 1px solid var(--q-primary);
}
</style>
