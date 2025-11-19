import { Socket } from "socket.io";
import type { requestType } from "../contracts/ws_request.js";

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

  broadcast(channelId:number, type: requestType, body: object) {
    const channel = this.channels.find(ch => ch.channelId === channelId);
    if (channel) {
      channel.listeners.forEach(client => {
        client.emit('message', body);
      });
    }
  }
}

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

  broadcast(channelId: number, type: requestType, body: object) {
    this.channels.broadcast(channelId, type, body);
  }
  
}
