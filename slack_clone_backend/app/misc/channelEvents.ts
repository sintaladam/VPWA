import { Server, Socket } from "socket.io";
import type { eventType } from "../contracts/ws_request.js";
import User from "#models/user";

export class BroadcastingChannels {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public getChannels() {
    return this.io.of('/').adapter.rooms;
  }

  public getSockets() {
    return this.io.fetchSockets();
  }
  
  public getSocketsByUserId(userId: number) {
    return this.getSockets().then(arr => arr.filter(el => el.data.user.id === userId));
  }

  public getInactiveSockets() {
    return this.getSockets().then(arr => arr.filter(el => el.rooms.size === 1));
  }

  broadcast(event: eventType, body: object, listener: ChannelListener) {
    const channel = listener.getCurrentChannel();
    if (channel) this.io.to(channel).emit(event, body);
  }

  broadcastToChannel(channelId: number, event: eventType, body: object) {
    this.io.to(channelId.toString()).emit(event, body);
  }

  async broadcastToActive(event: eventType, body: object, listener: ChannelListener) {
    const channel = listener.getCurrentChannel();
    let targets;
    if (channel) targets = await this.io.in(channel).fetchSockets();
    targets?.forEach(async el =>{
      let user = await User.query().where('id', el.data.user.id).first();
      if (user && user.status !== 'offline') {
        el.emit(event, body);
      }
    });
  }

  // getChannelOfListener(client: Socket) {
  //   const channel = this.channels.find(ch => ch.listeners.includes(client));
  //   return channel?.channelId ?? null;
  // }
}

export class ChannelListener {
  private currentChannel: string | null;
  private client: Socket;
  private channels: BroadcastingChannels;

  constructor(client: Socket, channels: BroadcastingChannels) {
    this.currentChannel = null;
    this.client = client;
    this.channels = channels;
  }

  getCurrentChannel() {
    return this.currentChannel;
  }
  
  subscribe(channelId: number) {
    if (this.currentChannel) this.unsubscribe();
    this.currentChannel = channelId.toString();
    this.client.join(this.currentChannel);
  }

  unsubscribe() {
    if (this.currentChannel) this.client.leave(this.currentChannel);
  }

  broadcast(event: eventType, body: object) {
    this.channels.broadcast(event, body, this);
  }

  broadcastToOthers(event: eventType, body: object) {
    if (this.currentChannel) this.client.to(this.currentChannel).emit(event, body)
  }

  send(event: eventType, body: object) {
    this.client.emit(event, body);
  }

  getUser(): User {
    return this.client.data.user;
  }

  getChannelId() {
    return this.currentChannel ? parseInt(this.currentChannel) : null;
  }
  
}
