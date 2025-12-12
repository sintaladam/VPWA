import type { Channel, Invite, Member } from "src/contracts";
import { api } from "src/boot/axios";
import type { AxiosError } from "axios";
import type { ChannelAtr, handleInviteType } from "src/components/models";

class HomeService {

  //channels

  async getChannels(): Promise<Channel[] | null> {
    try {
      const response = await api.get<Channel[]>('home/channels');
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async getAllPublicChannels(): Promise<Channel[] | null> {
    try {
      const response = await api.get<Channel[]>('home/channels/public ');
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async searchChannels(slug: string): Promise<Channel[] | null> {
    try {
      const response = await api.post<Channel[]>('home/channels/search', { slug });
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async joinChannel(channelId: number): Promise<{ ok: boolean; } | null> {
    try {
    const response = await api.post('home/channels/join', { channelId });
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async createChannel(channel:ChannelAtr):Promise<{ ok: boolean; } | null> {
    try {
      const response = await api.post('home/channels/create',channel);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async updateChannel(channel:ChannelAtr):Promise<{ ok: boolean; } | null> {
    try {
      const response = await api.post('home/channels/update',channel);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async deleteChannel(channelId: number): Promise<{ ok: boolean; } | null> {
    try {
    const response = await api.delete('home/channels/delete', { data: { channelId } });
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async getMembers(channelId: number): Promise<Member[] | null> {
    try {
    const response = await api.post<Member[]>('home/channels/members', { channelId });
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async kickMember(channelId: number, userId:number ): Promise<{ ok: boolean; } | null> {
    try {
    const response = await api.post('home/channels/kick', { channelId, userId });
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async leaveChannel(channelId: number): Promise<{ ok: boolean; } | null> {
    try {
      const response = await api.post(`home/channels/${channelId}/leave`);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Leave channel failed:', error.response?.data);

      return null;
    }
  }

  //invites

  async getInvites(): Promise<Invite[] | null> {
    try {
      const response = await api.get<Invite[]>('home/invites');
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async createInvite(channelId:number, slug:string):Promise<{ ok: boolean; } | null> {
    try {
      const response = await api.post('home/invites/create',{ channelId, slug });
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

  async handleInvite(inviteId:number, handle:handleInviteType):Promise<{ ok: boolean; } | null> {
    try {
      const response = await api.post('home/invites/handle',{ inviteId, handle });
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Action failed:', error.response?.data);

      return null;
    }
  }

}

export default new HomeService();