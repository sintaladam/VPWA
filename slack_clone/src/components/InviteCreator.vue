<template>
  <q-dialog v-model="localDialogOpen" :maximized="activeDevice=='mobile'">
    <q-card>
      <q-card-section class="row items-center q-pb-none q-gutter-sm">
        <div class="text-h6">Create Invite</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="column q-gutter-sm" :style="activeDevice==='desktop' && 'max-width: 500px; width: 50vw;'">
        <q-input v-model="slug" filled hint="User nickname or email"></q-input>
        
        <q-btn label="Confirm" @click="createInvite"></q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useActivePage } from 'src/stores/threadStore';
import { Platform } from 'quasar';
import { type DeviceType } from './models';
import { useAuthStore } from 'src/stores/authStore';
import { HomeService } from 'src/services';
import { socket } from 'src/boot/socket';

export default {
  data() {
    return {
      activeStore: useActivePage(),
      userStore: useAuthStore(),
      slug: '',
      targetUserId: null, 
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    channelId: {
      type: Number,
      required: true
    },
  },
  computed: {
    localDialogOpen: {
      get() { return this.modelValue; },
      set(value: boolean) { this.$emit('update:modelValue', value); }
    }
  },
  methods: {
    async createInvite() {
      socket.emit('inviteUser', {
        channelId: this.channelId,
        slug: this.slug,
      });
      const res = await HomeService.createInvite(this.channelId, this.slug);
      if (res) {
        this.$q.notify({ type: 'positive', message: `invitation to ${this.channelId} was successful` });
        this.localDialogOpen = false;
      }
      else {
          this.$q.notify({ type: 'negative', message: `invitation to ${this.channelId} failed` })
      }
    }
  },
  emits: ['update:modelValue']
}
</script>
