import { defineStore } from 'pinia';
import { type pageType } from 'src/components/models';
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
            createdAt: new Date()
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
        createdAt: new Date()
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
    getChannelName: (state) => (id: number) => {
      return state.channels.find(ch => ch.id == id)?.name;
    },
  },
  persist: {
    key: 'activePageStore',
    storage: sessionStorage,
  }
});
