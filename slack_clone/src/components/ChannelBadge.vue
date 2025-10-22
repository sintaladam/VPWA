<template>
  <q-expansion-item
    expand-icon-toggle
    class="q-pa-none custom-class"
  >
    <template #header>
      <q-item class="full-width column q-pa-xs rounded-borders" @click="activeStore.setActivePage(channel.name)" :to="`/channels/${channel.id}`">
        <div class="text-weight-medium">{{ channel.name }}</div>
        <div class="text-caption text-grey">{{ channel.type }}</div>
      </q-item>
    </template>
    <q-card>
      <q-card-section>
        {{ channel.description }} <br>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti
        commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste
        eveniet doloribus ullam aliquid.
      <div class="column q-pt-md q-gutter-md">
        <q-btn color="white" text-color="black" label="edit channel" @click="editorOpen = true"/>
        <q-btn color="white" text-color="negative" label="leave channel" @click="deleteOpen = true"/>
        <channel-editor v-model=editorOpen />
        <leave-confirmation v-model="deleteOpen" title="Leave Channel" @deleteEvent="forwardDelete()"/>
      </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script lang="ts">
import type { ChannelAtr } from './models';
import { useActivePage } from '../stores/activePage';
import ChannelEditor from './ChannelEditor.vue';
import LeaveConfirmation from './LeaveConfirmation.vue';

export default {
  data() {
    return {
      isOpen: false,
      activeStore: useActivePage(),
      editorOpen: false,
      deleteOpen: false,
    }
  },
  props: {
    channel: {
      type: Object as () => ChannelAtr,
      required: true,
    }
  },
  components: {
    ChannelEditor,
    LeaveConfirmation,
  },
  methods: {
    forwardDelete() {
      this.$emit('deleteChannelEvent');
    }
  },
  emits: ['deleteChannelEvent']
  
}
</script>

<style scoped>
.custom-class:hover {
  box-shadow: 0 0 10px var(--q-secondary);
}
/* .custom-class :deep(.q-expansion-item__container > .q-item:hover) {
} */
</style>