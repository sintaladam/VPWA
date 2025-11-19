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
    else if (event === 'loadMessages') this.loadMessages(listener);
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

  private async loadMessages(listener: ChannelListener) {
    const channel_id = listener.getChannelId();

    if (!channel_id) {
      console.error('No subscription to channel');
      this.send('error', { message: 'No subscription to channel' }, listener);
      return;
    }

    const channel = await Channel
      .query()
      .where('id', channel_id)
      .first();
    
    if (!channel) {
      console.error('Invalid channel');
      this.send('error', { message: 'Invalid channel' }, listener);
      return;
    }
    const messages = await channel
      .related('messages')
      .query()
      .preload('sender');
    this.send('message', { messages }, listener);
  }
}

export default new SocketService();

// {
//   id: this.id++,
//     sender: await User.query().where('id', listener.getUser().id).first(),
//       content: body.message,
//         createdAt: new Date().toISOString();
// }