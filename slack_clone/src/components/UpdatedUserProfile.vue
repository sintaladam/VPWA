<template>
  <q-dialog v-model="localDialogOpen" :maximized="activeDevice == 'mobile'" @hide="restore">
    <q-card>
      <q-card-section class="row items-center q-pb-none q-gutter-sm">
        <div class="text-h6">{{ profile.email }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="column q-gutter-sm"
        :style="activeDevice === 'desktop' && 'max-width: 500px; width: 50vw;'">
        <q-input v-model="localProfile.nickname" filled :readonly="!editing" hint="Nickname" />
        <div class="row q-gutter-sm full-width">
          <q-input v-model="localProfile.name" filled :readonly="!editing" hint="Name" class="col" />
          <q-input v-model="localProfile.surname" filled :readonly="!editing" hint="Surname" class="col" />
        </div>
        <q-input v-model="localProfile.description" filled type="textarea" :readonly="!editing" hint="Description" />
        <q-toggle
          v-model="mentionsToggle"
          class="q-ma-none q-my-sm"
          color="primary"
          icon="mail"
          label="only notify when mentioned"
          :disable="!editing"
        />
        <q-btn label="Edit" v-show="!editing" @click="editing = true" />
        <div v-show="editing" class="row q-gutter-sm full-width q-mt-lg">
          <q-btn label="Confirm" @click="updateProfile" class="col" text-color="positive" />
          <q-btn label="Cancel" @click="restore" class="col" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useAuthStore } from 'src/stores/authStore';
import { type ProfileAtr, type DeviceType } from './models';
import { Platform } from 'quasar';
import { type PropType } from 'vue';
import type { User } from 'src/contracts';

export default {
  data() {
    return {
      localProfile: { ...(this.profile as User) } as User,
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
      editing: false,
      activePage: useAuthStore(),
      mentionsToggle: Boolean((this.profile)?.mentionsOnly)
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    profile: {
      type: Object as PropType<User>,
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
    profile: {
      handler(newVal) {
        this.localProfile = { ...newVal } // update when prop changes
        this.mentionsToggle = Boolean((newVal)?.mentionsOnly)
      },
      immediate: true
    },
  },
  methods: {
    async updateProfile() {
      const payload = { 
        ...this.extractAtr(this.localProfile), 
        mentionsOnly: this.mentionsToggle 
      } as ProfileAtr & { mentionsOnly?: boolean }
      
      console.log('Updating profile with mentionsOnly:', this.mentionsToggle);
      const res = await this.activePage.updateProfile(payload);
      if (res) {
        this.editing = false;
        this.localProfile = { ...this.activePage.user } as User;
        this.mentionsToggle = Boolean((this.activePage.user)?.mentionsOnly);
        this.$q.notify({ type: 'positive', message: `updated successfuly` });
      }
      else {
        this.$q.notify({ type: 'negative', message: `update failed` })
      }
    },
    restore() {
      this.editing = false;
      this.localProfile = { ...this.profile };
      this.mentionsToggle = Boolean((this.profile)?.mentionsOnly);
    },
    extractAtr(profile: User) {
      return {
        nickname: profile.nickname,
        name: profile.name,
        surname: profile.surname,
        description: profile.description,
        mentionsOnly: profile.mentionsOnly
      }
    }
  },
  emits: ['update:modelValue']
}
</script>
