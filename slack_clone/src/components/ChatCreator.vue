<template>
  <q-dialog v-model="localDialogOpen" :maximized="activeDevice=='mobile'">
    <q-card>
      <q-card-section class="row items-center q-pb-none q-gutter-sm">
        <div class="text-h6">Send new message</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="column q-gutter-sm" :style="activeDevice==='desktop' && 'max-width: 500px; width: 50vw;'">
        <div>Enter recipient's nickname or email</div>
        <q-input v-model="recipient" filled></q-input>
        <q-btn label="Confirm" @click="createChat"></q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useActivePage } from 'src/stores/threadStore';
import { Platform } from 'quasar';
import { type DeviceType } from './models';

export default {
  data() {
    return {
      activePage: useActivePage(),
      recipient: '',
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    localDialogOpen: {
      get() { return this.modelValue; },
      set(value: boolean) { this.$emit('update:modelValue', value); }
    }
  },
  methods: {
    createChat() {
      this.activePage.createChat(this.recipient);
      this.localDialogOpen = false
    }
  },
  emits: ['update:modelValue']
}
</script>
