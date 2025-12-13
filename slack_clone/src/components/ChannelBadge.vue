<template>
  <q-expansion-item expand-icon-toggle class="q-pa-none custom-class"
  v-model="isOpen" 
  @input="onExpansionChange"
  >
    <template #header>
      <q-item class="full-width column q-pa-xs rounded-borders" :to="`/channel/${channelId}`"
      style="max-width: 200px;">
        <div class="text-weight-medium" style="overflow-wrap: break-word;">
          {{ isOpen ? channel.name : nameTooLong(channel.name) }}</div>
        <div class="text-caption text-grey">{{ channel.type }}</div>
      </q-item>
    </template>
    <q-card>
      <q-card-section>
        <div class="ellipsis">{{ channel.description }}</div>
        <div class="column q-pt-md q-gutter-md">
          <q-btn color="white" text-color="black" label="Details" @click="editorOpen = true" />
          <q-btn color="white" text-color="black" label="User list" @click="openUserList" />
          <q-btn color="white" text-color="black" label="Invite" @click="inviteCreatorOpen = true" v-show="channel.creatorId===userStore.user?.id || channel.type === ChannelType.Public" />
          <q-btn color="white" text-color="negative" :label="label" @click="deleteOpen = true" />
          <channel-editor v-if="channelId !== undefined" v-model=editorOpen :channel="channel" />
          <UserList v-model="listOpen" :channelId="channel.id" @kick-member-event="getUsers"/>
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
import SocketService from 'src/services/SocketService';
import { ChannelType } from 'src/components/models'

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
      ChannelType: ChannelType,
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
    nameTooLong(name: string) {
      return name.length > 20 ? name.slice(0, 25) + '...' : name;
    },  
    async getUsers() {
      //this.activeUsers = this.activeStore.getThreadUsers(this.activeStore.activePageId);
      this.activeUsers = await HomeService.getMembers(this.channel.id) ?? [];
    },
    openUserList() {
      this.listOpen = true;
    },
    forwardDelete() {
      if (this.activeStore.isAdmin(this.activeStore.activePageId, this.userStore.user?.id as number)) {
        SocketService.deleteChannel(this.activeStore.activePageId);
      } else {
        console.log('leaving channel...')
        if (this.userStore.user) {
          SocketService.leaveChannel(this.activeStore.activePageId, this.userStore.user.id);
        } else {
          console.error('User is not logged in.');
        }
      }    
    },
    onExpansionChange(isExpanded: boolean) {
      this.isOpen = isExpanded;
    },
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