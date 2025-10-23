import { defineStore } from 'pinia';
import { type Message, type pageType, type messageType } from 'src/components/models';
import { type ChannelAtr, type ChatAtr } from 'src/components/models';

export const useActivePage = defineStore('channelPage', {
  state: () => ({
    activePageId: 0 as number, // current active page or channel name
    activePageType: '' as pageType,
    channels: [
      {
        id: 0,
        type: 'public',
        name: 'Generic name1',
        description: 'generic description'
      },
      {
        id: 1,
        type: 'public',
        name: 'Generic name2',
        description: 'generic description'
      },
      {
        id: 2,
        type: 'public',
        name: 'Generic name3',
        description: 'generic description'
      },
      {
        id: 3,
        type: 'public',
        name: 'Generic name4',
        description: 'generic description'
      },
      {
        id: 4,
        type: 'public',
        name: 'Generic name5',
        description: 'generic description'
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
          console.log(state.channels)
          return state.channels.filter(ch => ch.name?.toLowerCase().includes(term.toLowerCase()));
        case 'chat':
          console.log(state.channels)
          return state.chats.filter(ch => ch.senderNickname.toLowerCase().includes(term.toLowerCase()));
      };
    },
    getThreadMessages: (state) => (id: number, type: pageType) => {
      const group = state.messageGroups.find(group => group.threadId === id && group.threadType === type);
      return (group?.messages ?? []) as Message[];
      // console.log(state, id, type);
      // return [] as Message[];
    }
  },
  persist: {
    key: 'activePageStore',
    storage: sessionStorage,
  }
});
