<template>
  <q-expansion-item expand-icon-toggle class="q-pa-none custom-class">
    <template #header>
      <q-item class="full-width column q-pa-xs rounded-borders" :to="`/channel/${channelId}`">
        <div class="text-weight-medium">{{ channel.name }}</div>
        <div class="text-caption text-grey">{{ channel.type }}</div>
      </q-item>
    </template>
    <q-card>
      <q-card-section>
        {{ channel.description }}
        <div class="column q-pt-md q-gutter-md">
          <q-btn color="white" text-color="black" label="Details" @click="editorOpen = true" />
          <q-btn color="white" text-color="black" label="User list" @click="openUserList" />
          <q-btn color="white" text-color="black" label="Invite" @click="inviteCreatorOpen = true" v-show="channel.creatorId===userStore.user?.id"/>
          <q-btn color="white" text-color="negative" :label="label" @click="deleteOpen = true" />
          <channel-editor v-if="channelId !== undefined" v-model=editorOpen :channel="channel" />
          <user-list v-model="listOpen" :users="activeUsers" :creatorId="channel.creatorId" :channelId="channel.id" @kick-member-event="getUsers"/>
          <leave-confirmation v-model="deleteOpen" :title="label" @deleteEvent="forwardDelete()" />
          <invite-creator v-model="inviteCreatorOpen" :channelId="channelId"/>
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script lang="ts">
import type { Channel, Member } from 'src/contracts';
import { useActivePage } from '../stores/threadStore';
import ChannelEditor from './ChannelEditor.vue';
import LeaveConfirmation from './LeaveConfirmation.vue';
import UserList from './UserList.vue'
import { HomeService } from 'src/services';
import { useAuthStore } from 'src/stores/authStore';
import InviteCreator from './InviteCreator.vue';

export default {
  data() {
    return {
      isOpen: false,
      activeStore: useActivePage(),
      userStore: useAuthStore(),
      editorOpen: false,
      deleteOpen: false,
      createOpen: false,
      inviteCreatorOpen: false,
      listOpen: false,
      activeUsers: [] as Member[],
      label: '',
    }
  },
  props: {
    channelId: {
      type: Number,
      required: true
    }
  },
  components: {
    ChannelEditor,
    LeaveConfirmation,
    UserList,
    InviteCreator
  },
  methods: {
    async getUsers() {
      //this.activeUsers = this.activeStore.getThreadUsers(this.activeStore.activePageId);
      this.activeUsers = await HomeService.getMembers(this.channel.id) ?? [];
    },
    async openUserList() {
      this.listOpen = true;
      await this.getUsers();
    },
    forwardDelete() {
      this.$emit('deleteChannelEvent');
    }
  },
  computed: {
    channel() {
      return this.activeStore.getThreadDetails(this.channelId as number) as Channel;
    }
  },
  emits: ['deleteChannelEvent'],
  created() {
    this.label = this.channel.creatorId===this.userStore.user!.id ? 'Delete Channel' : 'Leave Channel'
  }

}
</script>

<style scoped>
.custom-class:hover {
  box-shadow: 0 0 10px var(--q-secondary);
}

/* .custom-class :deep(.q-expansion-item__container > .q-item:hover) {
} */
</style>