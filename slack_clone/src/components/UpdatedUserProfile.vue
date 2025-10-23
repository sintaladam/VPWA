<template>
  <q-dialog v-model="localDialogOpen" :maximized="activeDevice=='mobile'" @hide="restore">
    <q-card>
      <q-card-section class="row items-center q-pb-none q-gutter-sm">
        <div class="text-h6">{{ localProfile.email }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="column q-gutter-sm" :style="activeDevice==='desktop' && 'max-width: 500px; width: 50vw;'">
        <q-input v-model="localProfile.nickname" filled :readonly="!editing" hint="Nickname" />
        <div class="row q-gutter-sm full-width">
          <q-input v-model="localProfile.name" filled :readonly="!editing" hint="Name" class="col"/>
          <q-input v-model="localProfile.surname" filled :readonly="!editing" hint="Surname" class="col"/>
        </div>
        <q-input v-model="localProfile.description" filled type="textarea" :readonly="!editing" hint="Description"/>
        <q-btn label="Edit" v-show="!editing" @click="editing=true" />
        <div v-show="editing" class="row q-gutter-sm full-width q-mt-lg">
          <q-btn label="Confirm" @click="updateProfile" class="col" text-color="positive"/>
          <q-btn label="Cancel" @click="restore" class="col" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useUserStore } from 'src/stores/userUserStore';
import { type ProfileAtr, type DeviceType } from './models';
import { Platform } from 'quasar';
import { type PropType } from 'vue';

export default {
  data() {
    return {
      localProfile: { ...this.profile },
      activeDevice: Platform.is.desktop ? 'desktop' : 'mobile' as DeviceType,
      editing: false,
      activePage: useUserStore(),
    }
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    profile: {
      type: Object as PropType<ProfileAtr>,
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
      },
      immediate: true
    },
  },
  methods: {
    updateProfile() {
      this.activePage.updateProfile(this.localProfile);
      this.editing = false;
      this.localProfile = { ...this.profile }
    },
    restore() {
      this.editing = false;
      this.localProfile = { ...this.profile }
    }
  },
  emits: ['update:modelValue']
}
</script>
