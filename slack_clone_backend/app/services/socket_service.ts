import { eventType, messageBody, request } from "../contracts/ws_request.js";
import { ChannelListener } from "../misc/channelEvents.js";
import db from "@adonisjs/lucid/services/db";
import Channel from "#models/channel";

class SocketService {
  async handle(event: string, data: request, listener: ChannelListener) {
    console.log(event, data);
    if (event === 'message') {
      const body = data.body as messageBody;
      this.handleMessage(body, listener);
    }
    else if (event === 'subscribe') listener.subscribe(data.channelId!);
    else if (event === 'loadMessages') this.loadMessages(listener, data);
    else if (event === 'deleteChannel') this.deleteChannel(listener, data.channelId);
  }

  private broadcast(event: eventType, data: object, listener: ChannelListener) {
    listener.broadcast(event, data);
  }

  private send(event: eventType, data: object, listener: ChannelListener) {
    listener.send(event, data)
  }

  private async handleMessage(body: messageBody, listener: ChannelListener) {
    const user = listener.getUser();
    const channel_id = listener.getChannelId();

    if (!channel_id) {
      console.error('No subscription to channel');
      this.send('error', { message: 'No subscription to channel' }, listener);
      return;
    }

    const txn = await db.transaction();

    try {
      const message = await user
        .useTransaction(txn)
        .related('messages')
        .create({ content: body.message, channel_id });

      await txn.commit();

      await message.load('sender');

      this.broadcast('message', { messages: [message] }, listener);
    } catch (error) {
      await txn.rollback();

      console.error(error.message);
    }
  }

  private async loadMessages(listener: ChannelListener, data?: request) {
    const channel_id = listener.getChannelId();

    if (!channel_id) {
      console.error('No subscription to channel');
      this.send('error', { message: 'No subscription to channel' }, listener);
      return;
    }
    // read pagination params only from top-level
    // we need only limit (perPage) and createdAt (cursor)
    const perPageRaw = (data && data.perPage) ?? 25;
    const perPage = Math.max(1, Number(perPageRaw) || 25);

    const channel = await Channel
      .query()
      .where('id', channel_id)
      .first();
    
    if (!channel) {
      console.error('Invalid channel');
      this.send('error', { message: 'Invalid channel' }, listener);
      return;
    }

    
    const cutoff = (() => {
      if (!data?.createdAt) {
        // first page
        return new Date().toISOString();
      }

      const parsed = new Date(data.createdAt);

      if (isNaN(parsed.getTime())) {
        // invalid input sent by the client
        this.send('error', { message: 'Invalid createdAt format' }, listener);
      }

      return parsed.toISOString();
    })();

    const messages = await channel
      .related('messages')
      .query()
      .preload('sender')
      .where('created_at', '<', cutoff)
      .orderBy('created_at', 'desc')
      .limit(perPage);

    this.send('message', { messages }, listener);
  }

  private async deleteChannel(listener: ChannelListener, channelId?: number) {
    if (!channelId) {
      this.send('error', { message: 'No channelId provided' }, listener);
      return;
    }

    const channel = await Channel.query().where('id', channelId).first();
    if (!channel) {
      this.send('error', { message: 'Invalid channel' }, listener);
      return;
    }

    //permission check
    //for now frontend only allows admin to delete channel
    const txn = await db.transaction();
    try {
      // delete channel
      await channel.useTransaction(txn).delete();
      await txn.commit();

      // notify all listeners in the channel (and the requester)
      this.broadcast('channelDeleted', { channelId }, listener);
      this.send('channelDeleted', { channelId }, listener);
    } catch (error) {
      await txn.rollback();
      console.error('deleteChannel error', error);
      this.send('error', { message: 'Failed to delete channel' }, listener);
    }
  }
}

export default new SocketService();