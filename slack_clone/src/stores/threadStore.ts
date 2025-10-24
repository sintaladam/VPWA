import { defineStore } from 'pinia';
import { type Message, type pageType, type messageType } from 'src/components/models';
import type { ChannelAtr, ChatAtr, KickVote, StatusType, UserAtr } from 'src/components/models';

export const useActivePage = defineStore('channelPage', {
  state: () => ({
    activePageId: 0 as number, // current active page or channel name
    activePageType: '' as pageType,
    users: {
      1: {
        id: 1,
        email: 'karolina1@gmail.com',
        nickname: 'karolina_one',
        name: 'Karolina',
        surname: 'Loplotova',
        status: 'online' as StatusType,
      },
      2: {
        id: 2,
        email: 'michael2@example.com',
        nickname: 'mike_2',
        name: 'Michael',
        surname: 'Davis',
        status: 'online' as StatusType,
      },
      3: {
        id: 3,
        email: 'lucy3@example.com',
        nickname: 'lucy_rocks',
        name: 'Lucy',
        surname: 'Stone',
        status: 'online' as StatusType,
      },
      4: {
        id: 4,
        email: 'john4@example.com',
        nickname: 'johnny_four',
        name: 'John',
        surname: 'Doe',
        status: 'online' as StatusType,
      },
      5: {
        id: 5,
        email: 'emily5@example.com',
        nickname: 'emily_star',
        name: 'Emily',
        surname: 'Blake',
        status: 'online' as StatusType,
      }
    } as Record<number, UserAtr>,

    channels: [
      {
        id: 0,
        type: 'public',
        name: 'AdminChannel',
        description: 'channel where you are admin user',
        creatorId: 1,
        users: [1, 2, 3]
      },
      {
        id: 1,
        type: 'public',
        name: 'Basic Public Channel',
        description: 'channel where you are basic user',
        creatorId: 2,
        users: [1, 2, 3, 4],
        kickVotes: [] as KickVote[],
      },
      {
        id: 2,
        type: 'public',
        name: 'Generic name2',
        description: 'generic description',
        users: [1, 2, 3]
      },

      {
        id: 3,
        type: 'public',
        name: 'Generic name4',
        description: 'generic description',
        users: [1, 2, 3]
      },
      {
        id: 4,
        type: 'public',
        name: 'Generic name5',
        description: 'generic description',
        users: [1, 2, 3]
      },
    ] as ChannelAtr[],
    chats: [
      {
        id: 0,
        senderId: 123,
        senderNickname: 'Alice'
      },
      {
        id: 1,
        senderId: 124,
        senderNickname: 'Bob'
      },
      {
        id: 2,
        senderId: 125,
        senderNickname: 'Charlie'
      },
      {
        id: 3,
        senderId: 126,
        senderNickname: 'David'
      },
      {
        id: 4,
        senderId: 127,
        senderNickname: 'Eve'
      },
    ] as ChatAtr[],
    messageGroups: [
      {
        threadId: 0,
        threadType: 'channel' as pageType,
        messages: [
          {
            id: 0,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
            senderId: 1,
            senderName: 'nvm',
            content: 'first message in channel 0',
            type: 'message'
          },
          {
            id: 1,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
            senderId: 2,
            senderName: 'alice',
            content: 'second message in channel 0',
            type: 'message'
          }
        ] as Message[]
      },
      {
        threadId: 1,
        threadType: 'channel' as pageType,
        messages: [
          {
            id: 2,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
            senderId: 3,
            senderName: 'bob',
            content: 'first message in channel 1',
            type: 'message'
          },
          {
            id: 3,
            timestamp: Date.now(),
            senderId: 1,
            senderName: 'nvm',
            content: 'second message in channel 1',
            type: 'message'
          }
        ] as Message[]
      },
      {
        threadId: 0,
        threadType: 'chat' as pageType,
        messages: [
          {
            id: 4,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
            senderId: 4,
            senderName: 'jane',
            content: 'first message in chat 0',
            type: 'message'
          },
          {
            id: 5,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
            senderId: 1,
            senderName: 'nvm',
            content: 'second message in chat 0',
            type: 'message'
          }
        ] as Message[]
      },
      {
        threadId: 1,
        threadType: 'chat' as pageType,
        messages: [
          {
            id: 6,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
            senderId: 2,
            senderName: 'alice',
            content: 'first message in chat 1',
            type: 'message'
          },
          {
            id: 7,
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1,
            senderId: 3,
            senderName: 'bob',
            content: 'second message in chat 1',
            type: 'message'
          }
        ] as Message[]
      }
    ]
  }),
  actions: {
    isAdmin (channelId: number, userId: number) {//current implementation is dependant on the fact that data are hardcoded in right order
      if (this.channels[channelId]?.creatorId == userId) {
        return true;
      }
      return false;
    },
    voteKickUser(targetUserNick: string, voterId: number, channelId: number) {
      const channel = this.channels.find(c => c.id === channelId);
      
      if (!channel) return;

      const targetUserId = channel.users
        .map(id => this.users[id])         
        .find(u => u?.nickname === targetUserNick)?.id;

      if (!targetUserId) {
          return;
      }

      if (channel.kickVotes) {
        const existingVote = channel.kickVotes.find(vote => vote.targetUserId === targetUserId);
        if (existingVote) {
          existingVote.voters.add(voterId)
          if (existingVote.voters.size >= 3) {
            this.removeUsersFromThread(channelId, targetUserId);
            channel.kickVotes = channel.kickVotes.filter(v => v.targetUserId !== targetUserId);
            return `${targetUserNick} was kicked`;
          }
          return `${existingVote.voters.size} kick ${existingVote.voters.size > 1 ? 'votes' : 'vote'} to kick ${targetUserNick}` 
        } else {
          channel.kickVotes.push({
            targetUserId,
            voters: new Set([voterId])
          })
          return '1 kick vote'
        }
      }
      
    },
    setActivePage(id: number, type: pageType) {
      this.activePageId = id;
      this.activePageType = type;
    },
    createThread(type: pageType) {
      switch (type) {
        case 'channel':
          this.channels.push({
            id: this.channels.length ? (this.channels[this.channels.length - 1]?.id ?? 0) + 1 : 0,
            type: 'public',
            name: 'New Channel',
            description: 'New channel description',
            createdAt: Date.now()
          } as ChannelAtr);
          break;
        case 'chat':
          this.chats.push({
            id: this.chats.length ? (this.chats[this.chats.length - 1]?.id ?? 0) + 1 : 0,
            senderId: Math.floor(Math.random() * 100),
            senderNickname: 'New Chat User'
          });
          break;
      };
    },
    createChannel({ name, type, description }: ChannelAtr) {
      this.channels.push({
        id: this.channels.length ? (this.channels[this.channels.length - 1]?.id ?? 0) + 1 : 0,
        type,
        name,
        description,
        createdAt: Date.now()
      } as ChannelAtr);
    },
    createChat(recipient: string) {
      this.chats.push({
        id: this.chats.length ? (this.chats[this.chats.length - 1]?.id ?? 0) + 1 : 0,
        senderId: Math.floor(Math.random() * 100),
        senderNickname: recipient
      });
    },
    deleteThread(id: number, type: pageType) {
      switch (type) {
        case 'channel':
          this.channels = this.channels.filter(ch => ch.id != id);
          break;
        case 'chat':
          this.chats = this.chats.filter(ch => ch.id != id);
          break;
      };
    },
    updateChannel({ id, name, description, type }: ChannelAtr) {
      const channel = this.channels.find(ch => ch.id === id);
      if (channel) {
        channel.name = name;
        channel.description = description;
        channel.type = type;
      }
    },
    addMessage({
      threadId,
      threadType,
      timestamp,
      senderId,
      content,
      type
    }: {
      threadId: number;
      threadType: pageType;
      timestamp: number;
      senderId: number;
      content: string;
      type: messageType;
    }) {
      let group = this.messageGroups.find(group => group.threadId === threadId && group.threadType === threadType);
      if (!group) {
        group = {
          threadId: threadId,
          threadType: threadType,
          messages: [] as Message[]
        };
        this.messageGroups.push(group);
      }

      group.messages.push({
        id: this.channels.length ? (this.channels[this.channels.length - 1]?.id ?? 0) + 1 : 0,
        senderId,
        senderName: 'nvm',
        type,
        content,
        timestamp
      });
    },
    removeUsersFromThread(channelId: number, userIds: number | number[]) {
      const idsToRemove = new Set(Array.isArray(userIds) ? userIds : [userIds]); 
      const channel = this.channels.find(c => c.id === channelId);

      if (!channel) return;

      channel.users = channel.users.filter(userId => !idsToRemove.has(userId));
    }
  },
  getters: {
    getThreadDetails: (state) => (id: number, type: pageType) => {
      switch (type) {
        case 'channel':
          return state.channels.find(ch => ch.id == id);
        case 'chat':
          return state.chats.find(ch => ch.id == id);
      };
    },
    getThreadName: (state) => (id: number, type: pageType) => {
      switch (type) {
        case 'channel':
          return state.channels.find(ch => ch.id == id)?.name;
        case 'chat':
          return state.chats.find(ch => ch.id == id)?.senderNickname;
      };
    },
    searchThreads: (state) => (type: pageType, term: string) => {
      switch (type) {
        case 'channel':
          return state.channels.filter(ch => ch.name?.toLowerCase().includes(term.toLowerCase()));
        case 'chat':
          return state.chats.filter(ch => ch.senderNickname.toLowerCase().includes(term.toLowerCase()));
      };
    },
    getThreadMessages: (state) => (id: number, type: pageType) => {
      const group = state.messageGroups.find(group => group.threadId === id && group.threadType === type);
      return (group?.messages ?? []) as Message[];
      // console.log(state, id, type);
      // return [] as Message[];
    },
    getThreadId: (state) => (argument: string) => {
      const channel = state.channels.find(c => c.name === argument);
      if (channel) {
        return channel;
      }
      return 0;
    },
    getThreadUsers: (state) => (id: number) => {
      const channel = state.channels.find(c => c.id === id);
      if (!channel) return [];

      return channel.users
        .map(userId => state.users[userId])
        .filter(Boolean);
    },
  },
  persist: {
    key: 'threadStore',
    storage: sessionStorage,
  }
});
