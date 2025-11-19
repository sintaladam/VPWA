import User from "#models/user";
import { eventType, messageBody, request } from "../contracts/ws_request.js";
import { ChannelListener } from "../misc/channelEvents.js";

class SocketService {
  private id = 1;
  async handle(event: string, data: request, listener: ChannelListener) {
    console.log(event, data);
    if (event === 'message') {
      const body = data.body as messageBody;
      this.send(event, {
        id: this.id++,
        sender: await User.query().where('id', listener.getUser().id).first(),
        content: body.message,
        createdAt: new Date().toISOString()
      }, listener);
    }
    else if (event === 'subscribe') listener.subscribe(data.channelId!);
  }

  private send(event: eventType, data:object, listener: ChannelListener) {
    listener.send(event, data);
  }
}

export default new SocketService();