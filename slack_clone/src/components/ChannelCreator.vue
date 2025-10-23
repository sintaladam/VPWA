<template>
  <q-dialog v-model="localDialogOpen" :maximized="activeDevice=='mobile'">
    <q-card>
      <q-card-section class="row items-center q-pb-none q-gutter-sm">
        <div class="text-h6">Create Channel</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="column q-gutter-sm" :style="activeDevice==='desktop' && 'max-width: 500px; width: 50vw;'">
        <q-input v-model="newChannel.name" filled hint="Name"></q-input>
        <q-input v-model="newChannel.description" filled type="textarea" hint="Description"></q-input>
        <q-btn-toggle
          v-model="newChannel.type"
          no-caps
          spread
          unelevated
          toggle-color="primary"
          color="white"
          text-color="primary"
          :options="[
            {label: 'private', value: 'private'},
            {label: 'public', value: 'public'},
          ]"
          hint="Type"
        />
        <q-btn label="Confirm" @click="createChannel"></q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useActivePage } from 'src/stores/activePage';
import { Platform } from 'quasar';
import { type ChannelAtr, type DeviceType } from './models';

export default {
  data() {
    return {
      activePage: useActivePage(),
      newChannel: {
        name: '',
        type: '',
        description: ''
      },
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
    createChannel() {
      this.activePage.createChannel(this.newChannel as ChannelAtr);
      this.localDialogOpen = false
    }
  },
  emits: ['update:modelValue']
}
</script>
