import type { Channel } from "src/contracts";
import { api } from "src/boot/axios";

class HomeService {
  async getChannels():Promise<Channel[] | null> {
    const response = api.get<Channel[]>('home/channels');
    return (await response).data;
  }
}

export default new HomeService();