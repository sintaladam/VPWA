export enum ChannelType {
  Public = 'public',
  Private = 'private'
}

export interface Message {
  id: number;
  timestamp: string;
  senderId: number;
  senderName: string;
  content: string;
  type: messageType;
}

export interface ChannelAtr {
  id: number;
  type: ChannelType;
  name: string;
  description: string;
  createdAt: Date;
}

export interface ChatAtr {
  id: number;
  senderId: number;
  senderNickname: string;
}

export interface ProfileAtr {
  id: number | null;
  email: string;
  nickname: string;
  name: string;
  surname: string;
  description: string | null;
  status: StatusType;
  token: string;
  isAuthenticated: boolean;
}

export type StatusType = 'online' | 'offline' | 'dnd';

export type TabName = 'channels' | 'chats' | 'profile';

export type DeviceType = 'mobile' | 'desktop';

export type messageType = 'command' | 'message';

export type pageType = 'channel' | 'chat';