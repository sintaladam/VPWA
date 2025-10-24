<template>
  <q-expansion-item
    expand-icon-toggle
    class="q-pa-none custom-class"
  >
    <template #header>
      <q-item class="full-width column q-pa-xs rounded-borders" :to="`/channel/${channelId}`">
        <div class="text-weight-medium">{{ channel.name }}</div>
        <div class="text-caption text-grey">{{ channel.type }}</div>
      </q-item>
    </template>
    <q-card>
      <q-card-section>
        {{ channel.description}}
      <div class="column q-pt-md q-gutter-md">
        <q-btn color="white" text-color="black" label="Details" @click="editorOpen = true"/>
        <q-btn color="white" text-color="negative" label="leave channel" @click="deleteOpen = true"/>
        <channel-editor v-if="channelId !== undefined" v-model=editorOpen :channel="channel" />
        <leave-confirmation v-model="deleteOpen" title="Leave Channel" @deleteEvent="forwardDelete()"/>
      </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script lang="ts">
import { useActivePage } from '../stores/threadStore';
import ChannelEditor from './ChannelEditor.vue';
import LeaveConfirmation from './LeaveConfirmation.vue';
import { type ChannelAtr } from './models';

export default {
  data() {
    return {
      isOpen: false,
      activeStore: useActivePage(),
      editorOpen: false,
      deleteOpen: false,
      createOpen: false,
    }
  },
  props: {
    // channel: {
    //   type: Object as () => ChannelAtr,
    //   required: true,
    // }
    channelId: Number
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
  computed: {
    channel() {
      return this.activeStore.getThreadDetails(this.channelId as number, 'channel') as ChannelAtr;
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