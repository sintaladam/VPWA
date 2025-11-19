import { request } from "../contracts/ws_request.js";
import { ChannelListener } from "../misc/channelEvents.js";

class SocketService {
  handle(event: string, data: request, listener: ChannelListener) {
    if (event === 'message') this.sendMessage(data, listener);
  }

  private sendMessage(data:request, listener: ChannelListener) {
    listener.broadcast(data.channelId, 'sendMessage', data.body);
  }
}

export default new SocketService();