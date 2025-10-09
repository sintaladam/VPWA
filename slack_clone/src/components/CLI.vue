<template>
  <q-input outlined v-model="messageInput"
    class="input-field full-height full-width"
    @keyup.enter.exact.prevent="submitMessage"
  />
</template>

<script lang="ts">
export default {
  data() {
    return {
      messageInput: '',
    };
  },
  methods: {
    submitMessage() {
      const mess = this.messageInput.trim();
      if (!mess) return;
      this.$emit('submitMessageEvent', mess);
      this.messageInput=''
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
