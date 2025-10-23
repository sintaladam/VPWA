<template>
  <q-dialog v-model="localDialogOpen" :maximized="activeDevice=='mobile'" @hide="editing = false; localChannel={...channel}">
    <q-card>
      <q-card-section class="row items-center q-pb-none q-gutter-sm">
        <div class="text-h6">Channel details</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="column q-gutter-sm" style="max-width: 500px; width: 50vw;">
        <q-input v-model="localChannel.name" filled :readonly="!editing"></q-input>
        <q-input v-model="localChannel.description" filled type="textarea" :readonly="!editing"></q-input>
        <q-btn-toggle
          v-model="localChannel.type"
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
          :readonly="!editing"
        />
        <q-btn label="Edit" v-show="!editing" @click="editing=true"></q-btn>
        <div v-show="editing" class="row q-gutter-sm full-width q-pt-lg">
          <q-btn label="Confirm" @click="updateChannel" class="col" text-color="positive"></q-btn>
          <q-btn label="Cancel" @click="editing = false; localChannel={...channel}" class="col"></q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useActivePage } from 'src/stores/activePage';
import { type ChannelAtr, type DeviceType } from './models';
import { Platform } from 'quasar'

export default {
  data() {
    return {
      localChannel: { ...this.channel },
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
      editing: false,
      activePage: useActivePage(),
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    channel: {
      type: Object as () => ChannelAtr,
      required: true,
    }
  },
  computed: {
    localDialogOpen: {
      get() { return this.modelValue; },
      set(value: boolean) { this.$emit('update:modelValue', value) }
    }
  },
  watch: {
    channel: {
      handler(newVal) {
        this.localChannel = { ...newVal } // update when prop changes
      },
      immediate: true
    },
  },
  methods: {
    updateChannel() {
      this.activePage.updateChannel(this.localChannel);
      this.editing = false; this.localChannel={...this.channel}
    }
  },
  emits: ['update:modelValue']
}
</script>
