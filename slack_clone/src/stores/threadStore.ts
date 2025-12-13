import { defineStore } from 'pinia';
import type { ChannelAtr, handleInviteType, KickVote, TypingActivity } from 'src/components/models';
import type { Activity, Channel, Invite, Member, Message } from 'src/contracts';
import HomeService from "src/services/HomeService";
import { useAuthStore } from 'src/stores/authStore';
import SocketService from 'src/services/SocketService';
import { router } from 'src/router';
import { notify } from 'src/utils/helperFunctions';

export const useActivePage = defineStore('channelPage', {
  state: () => ({
    activePageId: -1 as number,
    perPage: 25 as number, // how many chats are going to be loader per request
    kickvotes: [] as KickVote[],

    channels: [] as Channel[],
    invites: [] as Invite[],
    members: [] as Member[],
    messages: [] as Message[],
    typingActivity: [] as TypingActivity[],
  }),
  actions: {
    isAdmin(channel_id: number, userId: number) {
      const threadDetails = this.getThreadDetails(channel_id);
      if (threadDetails.creatorId == userId) {
        return true;
      }
      return false;
    },
    setActivePage(id: number | null) {
      console.log('got', id)
      if (id == null) return;
      this.activePageId = id;
      this.messages = [];
      //const userStore = useAuthStore();
      // if (userStore.user?.status === 'offline') {
      //   return;
      // }
      SocketService.subscribeToChannel(id);
    },
    loadMessages(messages: Message[], isNew: boolean) {
      if (isNew) {
        this.typingActivity = this.typingActivity.filter(el => el.activity.sender.id !== messages[0]?.sender.id);
      }
      this.messages = this.messages.concat(messages);
    },
    async getChannels() {
      this.channels = await HomeService.getChannels() ?? [];
    },
    async createChannel(channel: ChannelAtr) {
      const res = await HomeService.createChannel(channel);
      if (res?.ok) {
        await this.getChannels();
        return true;
      }
      return false;
    },
    async updateChannel(channel: ChannelAtr) {
      const res = await HomeService.updateChannel(channel);
      if (res?.ok) {
        await this.getChannels();
        return true;
      }
      return false;
    },
    async joinChannel(channelId: number) {
      const res = await HomeService.joinChannel(channelId);
      if (res?.ok) {
        await this.getChannels();
        return true;
      }
      return false;
    },
    async deleteChannel(channelId: number) {
      const res = await HomeService.deleteChannel(channelId);
      if (res?.ok) {
        await this.getChannels();  
      }
    },
    async getInvites() {
      this.invites = await HomeService.getInvites() ?? [];
    },
    async handleInvite(channelId: number, handle: handleInviteType) {
      const res = await HomeService.handleInvite(channelId,handle);
      if (res?.ok) {
        await this.getChannels();
        await this.getInvites();
        return true;
      }
      return false;
    },
    async getMembers(channel_id: number) {
      this.members = await HomeService.getMembers(channel_id) ?? [];
    },
    async removeChannel(channelId: number) {
      const auth = useAuthStore();
      const currentUserId = auth.user?.id ?? null;

      const isCurrentUserAdmin = this.isAdmin(channelId, currentUserId as number);

      this.channels = this.channels.filter(c => c.id !== channelId);
      this.invites = this.invites.filter(i => i.channelId !== channelId);
      this.members = this.members.filter(m => m.id !== channelId);

      if (this.activePageId === channelId) {
        this.activePageId = 0;
        this.messages = [];
      }
      await router?.push('/channel');
      // notify non-admin users that the channel was deleted by owner
      if (currentUserId !== null && !isCurrentUserAdmin) {
        notify('Channel you were in was deleted by its owner', 'negative', 'top');
      }
    },
    removeMember(channelId: number, userId: number) {
      const auth = useAuthStore();
      const currentUserId = auth.user?.id ?? null;
      const chIndex = this.channels.findIndex(c => c.id === channelId);
      if (chIndex !== -1) {
        type ChannelWithUsers = Channel & { users?: number[] };
        const ch = this.channels[chIndex] as ChannelWithUsers;
        if (Array.isArray(ch.users)) {
          ch.users = ch.users.filter((id: number) => id !== userId);
          this.channels.splice(chIndex, 1, { ...ch });
        }
      }
      this.members = this.members.filter(m => m.id !== userId);
      console.log('currentUserId', currentUserId, 'userId', userId);
      if (currentUserId === userId) {
        this.channels = this.channels.filter(c => c.id !== channelId);
        console.log('activePageId', this.activePageId, 'channelId', channelId);
        if (this.activePageId === channelId) {
          this.activePageId = 0;
          this.messages = [];
        }
      }
    },
    addActivity(activity: Activity) {
      let item = this.typingActivity.find(item => item.activity.sender.id === activity.sender.id);
      if (item) {
        item.activity.content = activity.content;
        clearTimeout(item.destroySelfFn!); //reset delete timeout
      }
      else {
        item = {
          activity, destroySelfFn: null
        };
        this.typingActivity.push(item);
      }
      item.destroySelfFn = setTimeout(() => {
        const id = this.typingActivity.indexOf(item);
        if (id >= 0) this.typingActivity.splice(id, 1);
      }, 3500);
    }
  },
  getters: {
    getThreadDetails: (state) => (id: number) => {
      return state.channels.find((ch) => ch.id == id) as Channel;
    },
    getThreadName: (state) => () => {
      return state.channels.find((ch) => ch.id == state.activePageId)?.name;
    },
    searchThreads: (state) => (term: string) => {
      return state.channels.filter((ch) => ch.name?.toLowerCase().includes(term.toLowerCase()));
    },
    getThreadId: (state) => (argument: string) => {
      const channel = state.channels.find((c) => c.name === argument);
      if (channel) {
        return channel;
      }
      return 0;
    },
  },
});