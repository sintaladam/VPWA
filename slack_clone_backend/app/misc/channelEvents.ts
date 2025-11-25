import { Socket } from "socket.io";
import type { eventType } from "../contracts/ws_request.js";
import User from "#models/user";

export class BroadcastingChannels {
  private channels: {
    channelId: number,
    listeners: Socket[];
  }[];

  constructor() {
    this.channels = [];
  }

  subscribe(channelId: number, client: Socket) {
    let channel = this.channels.find(ch => ch.channelId === channelId);

    if (channel) channel.listeners.push(client);
    else {
      channel = {
        channelId,
        listeners: [client]
      }
      this.channels.push(channel);
    }

    return () => { //unsub function
      const id = channel.listeners.indexOf(client);
      if (id >= 0) channel.listeners.splice(id, 1);
    }
  }

  broadcast(event: eventType, body: object, client: Socket) {
    const channel = this.channels.find(ch => ch.listeners.includes(client));
    if (channel) {
      channel.listeners.forEach(client => {
        client.emit(event, body);
      });
    }
  }

  broadcastToChannel(channelId: number, event: eventType, body: object) {
    const channel = this.channels.find(ch => ch.channelId === channelId);
    if (!channel) return;
    channel.listeners.forEach(client => client.emit(event, body));
  }

  getChannelOfListener(client: Socket) {
    const channel = this.channels.find(ch => ch.listeners.includes(client));
    return channel?.channelId ?? null;
  }
}

// export a singleton for app-wide use
export const broadcastingChannels = new BroadcastingChannels();

export class ChannelListener {
  private unsubscribeFn: (() => void) | null;
  private client: Socket;
  private channels: BroadcastingChannels;

  constructor(client: Socket, channels: BroadcastingChannels) {
    this.unsubscribeFn = null;
    this.client = client;
    this.channels = channels;
  }

  subscribe(channelId: number) {
    if (this.unsubscribeFn) this.unsubscribeFn();
    this.unsubscribeFn = this.channels.subscribe(channelId, this.client);
  }

  unsubscribe() {
    if (this.unsubscribeFn) this.unsubscribeFn();
    this.unsubscribeFn = null;
  }

  broadcast(event: eventType, body: object) {
    this.channels.broadcast(event, body, this.client);
  }

  send(event: eventType, body: object) {
    this.client.emit(event, body);
  }

  getUser: () => User = () => {
    return this.client.data.user;
  }

  getChannelId() {
    return this.channels.getChannelOfListener(this.client);
  }
  
}
