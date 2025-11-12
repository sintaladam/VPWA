import type { Channel, Invite, Member } from "src/contracts";
import { api } from "src/boot/axios";

class HomeService {
  async getChannels():Promise<Channel[] | null> {
    const response = await api.get<Channel[]>('home/channels');
    return response.data;
  }

  async getInvites():Promise<Invite[] | null> {
    const response = await api.get<Invite[]>('home/invites');
    return response.data;
  }

  async getMembers(channel_id:number):Promise<Member[] | null> {
    const response = await api.post<Member[]>('home/members', { channel_id });
    return response.data;
  }
}

export default new HomeService();