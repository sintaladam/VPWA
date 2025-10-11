<template>
  <q-expansion-item
    expand-icon-toggle
    expand-separator
    :label="channel.name"
    :caption="channel.type"
  >
    <template #header>
      <q-item class="full-width column" @click="activeStore.setActivePage(channel.name)" clickable :to="`/channels/${channel.id}`">
        <div class="text-weight-medium">{{ channel.name }}</div>
        <div class="text-caption text-grey">{{ channel.description }}</div>
    </q-item>
    </template>
    <q-card>
      <q-card-section>
        {{ channel.description }} <br>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti
        commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste
        eveniet doloribus ullam aliquid.
      <div class="column q-pt-md q-gutter-md">
        <q-btn color="white" text-color="black" label="edit channel" />
        <q-btn color="white" text-color="red-10" label="leave channel" />
      </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script lang="ts">
import type { ChannelAtr } from './models';
import { useActivePage } from '../stores/activePage';

export default {
  data() {
    return {
      isOpen: false,
      activeStore: useActivePage()

    }
  },
  props: {
    channel: {
      type: Object as () => ChannelAtr,
      required: true,
    }
  }
}
</script>
