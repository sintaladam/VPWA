<template>
  <q-dialog v-model="localDialogOpen" :maximized="activeDevice=='mobile'" @hide="restore">
    <q-card>
      <q-card-section class="row items-center q-pb-none q-gutter-sm">
        <div class="text-h6">Channel details</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="column q-gutter-sm" :style="activeDevice==='desktop' && 'max-width: 500px; width: 50vw;'">
        <q-input v-model="localChannel.name" filled :readonly="!editing" hint="Name"/>
        <q-input v-model="localChannel.description" filled type="textarea" :readonly="!editing" hint="Description"/>
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
          hint="Type"
        />
        <q-btn label="Edit" v-show="channel.creatorId===userStore.user?.id && !editing" @click="editing=true"/>
        <div v-show="editing" class="row q-gutter-sm full-width q-mt-lg q-pa-none">
          <q-btn label="Confirm" @click="updateChannel" class="col" text-color="positive"/>
          <q-btn label="Cancel" @click="restore" class="col"/>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useActivePage } from 'src/stores/threadStore';
import type {  ChannelAtr} from './models';
import { type DeviceType } from './models';
import { Platform } from 'quasar'
import { useAuthStore } from 'src/stores/authStore';
import type { Channel } from 'src/contracts';
import { notify } from 'src/utils/helperFunctions';

export default {
  data() {
    return {
      localChannel: this.channel as Channel,
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
      editing: false,
      activePage: useActivePage(),
      userStore: useAuthStore(),
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    channel: {
      type: Object as () => Channel,
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
    async updateChannel() {
      const res = await this.activePage.updateChannel(this.extractAtr(this.localChannel) as ChannelAtr);
      if (res) {
        this.editing = false;
        this.localChannel = this.channel
        notify('updated successfuly', 'positive', 'top');
      }else {
        notify('update failed', 'negative', 'top');
      }
    },
    restore() {
      this.editing = false;
      this.localChannel = this.channel
    },
    extractAtr(channel: Channel) {
      return {
        channelId: channel.id,
        name: channel.name,
        type: channel.type,
        description: channel.description
      }
    }
  },
  emits: ['update:modelValue'],
}
</script>
