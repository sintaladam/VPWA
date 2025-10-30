export enum ChannelType {
  Public = 'public',
  Private = 'private',
}

export interface Message {
  id: number;
  timestamp: number;
  senderId: number;
  senderName: string;
  content: string;
  type: messageType;
}

export interface KickVote {
  targetUserId: number;
  voters: Set<number>;
}

export interface ChannelAtr {
  id: number;
  type: ChannelType;
  name: string;
  description: string;
  createdAt: number;
  creatorId: number;
  users: number[];
  kickVotes?: KickVote[];
}

export interface ChatAtr {
  id: number;
  senderId: number;
  senderNickname: string;
}

export interface ProfileAtr {
  id: number;
  email: string;
  nickname: string;
  name: string;
  surname: string;
  description: string | null;
  status: StatusType;
  token: string;
  isAuthenticated: boolean;
}
export interface UserAtr {
  id: number;
  email: string;
  nickname: string;
  name: string;
  surname: string;
  status: StatusType;
}

export type StatusType = 'online' | 'offline' | 'dnd';

export type TabName = 'channels' | 'chats' | 'profile';

export type DeviceType = 'mobile' | 'desktop';

export type messageType = 'command' | 'message' | 'component';

export type pageType = 'channel' | 'chat';
