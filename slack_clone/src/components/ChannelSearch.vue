<template>
  <q-dialog v-model="localDialogOpen" :maximized="activeDevice=='mobile'">
    <q-card>
      <q-card-section class="row items-center q-pb-none q-gutter-sm">
        <div class="text-h6">Search public channels</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="column q-gutter-sm" :style="activeDevice==='desktop' && 'max-width: 500px; width: 50vw;'">
        <q-input v-model="slug" filled hint="User nickname or email"></q-input>
        
        <q-btn label="Confirm" @click="searchForChannel" ></q-btn>
      </q-card-section>

      <q-card-section v-show="channels.length">
        <q-list bordered padding class="rounded-borders bg-grey-1">
          <q-item v-for="channel in channels" :key="channel.id">
            <q-item-section>
                <q-item-label>{{ channel.name }}</q-item-label>
                <q-item-label caption class="text-grey">public</q-item-label>
            </q-item-section>
            <q-item-section side >
                <q-btn round flat color="positive" icon="login" size="md" @click="joinChannel(channel.id)"/>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useActivePage } from 'src/stores/threadStore';
import { Platform } from 'quasar';
import type { DeviceType } from './models';
import { useAuthStore } from 'src/stores/authStore';
import { HomeService } from 'src/services';
import type { Channel } from 'src/contracts';
import { notify } from 'src/utils/helperFunctions';

export default {
  data() {
    return {
      activePage: useActivePage(),
      userStore: useAuthStore(),
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
      slug: '',
      channels: [] as Channel[],
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
    async searchForChannel() {
      const res = await HomeService.searchChannels(this.slug);
      if (res) {
        this.channels = res
        notify(`showing results for ${this.slug}`, 'positive', 'top');
      }
      else {
        notify('search failed', 'negative', 'top');
      }
    },
    async joinChannel(channelId: number) {
      const res = await this.activePage.joinChannel(channelId);
      if (res) {
        notify(`channel ${channelId} successfuly added`, 'positive', 'top');
        this.channels = [];
        this.slug = '';
        this.localDialogOpen = false;
      }
      else {
          notify('join failed', 'negative', 'top');
      }
    }
  },
  emits: ['update:modelValue']
}
</script>
