import { defineStore } from 'pinia';
import { type Message, type pageType, type messageType } from 'src/components/models';
import type { KickVote } from 'src/components/models';
import { socket } from 'src/boot/socket';
import type { Channel, Invite, Member } from 'src/contracts';
import { HomeService } from 'src/services';

export const useActivePage = defineStore('channelPage', {
  state: () => ({
    activePageId: 0 as number,
    activePageType: '' as pageType,

    kickvotes: [] as KickVote[],

    messageGroups: [
      {
        threadId: 0,
        threadType: 'channel',
        messages: [
          {
            id: 0,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
            senderId: 1,
            senderName: 'nvm',
            content: 'first message in channel 0',
            type: 'message',
          },
          {
            id: 1,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
            senderId: 2,
            senderName: 'alice',
            content: 'second message in channel 0',
            type: 'message',
          },
        ] as Message[],
      },
      {
        threadId: 1,
        threadType: 'channel',
        messages: [
          {
            id: 2,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
            senderId: 3,
            senderName: 'bob',
            content: 'first message in channel 1',
            type: 'message',
          },
          {
            id: 3,
            timestamp: Date.now(),
            senderId: 1,
            senderName: 'nvm',
            content: 'second message in channel 1',
            type: 'message',
          },
        ] as Message[],
      },
    ],
    channels: [] as Channel[],
    invites: [] as Invite[],
    members: [] as Member[],
  }),
  actions: {
    isAdmin(channel_id: number, userId: number) {
      //current implementation is dependant on the fact that data are hardcoded in right order
      if (this.channels[channel_id]?.creatorId == userId) {
        return true;
      }
      return false;
    },
    // voteKickUser(targetUserNick: string, voterId: number, channelId: number) {
    //   const channel = this.channels.find((c) => c.id === channelId);

    //   if (!channel) return;

    //   const targetUserId = channel.users
    //     .map((id) => this.users[id])
    //     .find((u) => u?.nickname === targetUserNick)?.id;

    //   if (!targetUserId) {
    //     return;
    //   }

    //   if (channel.kickVotes) {
    //     const existingVote = channel.kickVotes.find((vote) => vote.targetUserId === targetUserId);
    //     if (existingVote) {
    //       existingVote.voters.add(voterId);
    //       if (existingVote.voters.size >= 3) {
    //         this.removeUsersFromThread(channelId, targetUserId);
    //         channel.kickVotes = channel.kickVotes.filter((v) => v.targetUserId !== targetUserId);
    //         return `${targetUserNick} was kicked`;
    //       }
    //       return `${existingVote.voters.size} kick ${existingVote.voters.size > 1 ? 'votes' : 'vote'} to kick ${targetUserNick}`;
    //     } else {
    //       channel.kickVotes.push({
    //         targetUserId,
    //         voters: new Set([voterId]),
    //       });
    //       return '1 kick vote to kick ' + targetUserNick;
    //     }
    //   }
    // },
    setActivePage(id: number, type: pageType) {
      this.activePageId = id;
      this.activePageType = type;
    },
    // createThread(type: pageType) {
    //   switch (type) {
    //     case 'channel':
    //       this.channels.push({
    //         id: this.channels.length ? (this.channels[this.channels.length - 1]?.id ?? 0) + 1 : 0,
    //         type: 'public',
    //         name: 'New Channel',
    //         description: 'New channel description',
    //         createdAt: Date.now(),
    //       } as ChannelAtr);
    //       break;
    //   }
    // },
    createChannel({ name, type, description }: Channel, creatorId:number) {
      this.channels.push({
        id: this.channels.length ? (this.channels[this.channels.length - 1]?.id ?? 0) + 1 : 0,
        type,
        name,
        description,
        creatorId,
        createdAt: Date.now(),
      } as Channel);
    },
    // updateChannel({ id, name, description, type }: ChannelAtr) {
    //   const channel = this.channels.find((ch) => ch.id === id);
    //   if (channel) {
    //     channel.name = name;
    //     channel.description = description;
    //     channel.type = type;
    //   }
    // },
    addMessage({
      threadId,
      threadType,
      timestamp,
      senderId,
      content,
      type,
    }: {
      threadId: number;
      threadType: pageType;
      timestamp: number;
      senderId: number;
      content: string;
      type: messageType;
    }) {
      let group = this.messageGroups.find(
        (group) => group.threadId === threadId && group.threadType === threadType,
      );
      if (!group) {
        group = {
          threadId: threadId,
          threadType: threadType,
          messages: [] as Message[],
        };
        this.messageGroups.push(group);
      }

      group.messages.push({
        id: this.channels.length ? (this.channels[this.channels.length - 1]?.id ?? 0) + 1 : 0,
        senderId,
        senderName: 'nvm',
        type,
        content,
        timestamp,
      });

      this.sendMsg(content);
    },
    // removeUsersFromThread(channelId: number, userIds: number | number[]) {
    //   const idsToRemove = new Set(Array.isArray(userIds) ? userIds : [userIds]);
    //   const channel = this.channels.find((c) => c.id === channelId);

    //   if (!channel) return;

    //   //channel.users = channel.users.filter((userId) => !idsToRemove.has(userId));
      
    // },
    sendMsg(msg:string) {
      socket.emit('message', { msg });
    },
    async getChannels() {
      this.channels = await HomeService.getChannels() ?? [];
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
    async getMembers(channel_id: number) {
      this.members = await HomeService.getMembers(channel_id) ?? [];
    }
  },
  getters: {
    // getInvites: (state) => (userId: number) => {
    //   return Object.values(state.invites).filter((invite) => invite.invitedUserId === userId);
    // },
    getThreadDetails: (state) => (id: number, type: pageType) => {
      switch (type) {
        case 'channel':
          return state.channels.find((ch) => ch.id == id) as Channel;
      }
    },
    // getThreadName: (state) => (id: number, type: pageType) => {
    //   switch (type) {
    //     case 'channel':
    //       return state.channels.find((ch) => ch.id == id)?.name;
    //   }
    // },
    getThreadName: (state) => () => {
      return state.channels.find((ch) => ch.id == state.activePageId)?.name;
    },
    searchThreads: (state) => (type: pageType, term: string) => {
      switch (type) {
        case 'channel':
          return state.channels.filter((ch) => ch.name?.toLowerCase().includes(term.toLowerCase()));
      }
    },
    getThreadMessages: (state) => (id: number, type: pageType) => {
      const group = state.messageGroups.find(
        (group) => group.threadId === id && group.threadType === type,
      );
      return (group?.messages ?? []) as Message[];
      // console.log(state, id, type);
      // return [] as Message[];
    },
    getThreadId: (state) => (argument: string) => {
      const channel = state.channels.find((c) => c.name === argument);
      if (channel) {
        return channel;
      }
      return 0;
    },
    // getThreadUsers: (state) => (id: number) => {
    //   const channel = state.channels.find((c) => c.id === id);
    //   if (!channel) return [];

    //   return channel.users
    //     .map((userId) => state.users[userId])
    //     .filter((u): u is UserAtr => u !== undefined);
    // },
  },
  // persist: {
  //   key: 'threadStore',
  //   storage: sessionStorage,
  // },
});
