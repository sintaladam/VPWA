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

  async getMembers(channelId:number):Promise<Member[] | null> {
    const response = await api.post<Member[]>('home/members', { channelId });
    return response.data;
  }

  async deleteChannel(channelId: number): Promise<{ok:boolean} | null> {
    const response = await api.delete('home/channels', { data: { channelId } });
    return response.data;
  }
}

export default new HomeService();