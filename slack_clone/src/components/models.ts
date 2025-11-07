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

export interface ProfileAtr {
  id: number;
  email: string;
  nickname: string;
  name: string;
  surname: string;
  description: string | null;
  status: StatusType;
}
export interface UserAtr {
  id: number;
  email: string;
  nickname: string;
  name: string;
  surname: string;
  status: StatusType;
}
export interface InviteType {
  id: number;
  invitedUserId: number;
  channelId: number;
  status: inviteStatusType;
}

type inviteStatusType = 'accepted' | 'pending' | 'rejected';

export type StatusType = 'online' | 'offline' | 'dnd';

export type TabName = 'channels' | 'invites';

export type DeviceType = 'mobile' | 'desktop';

export type messageType = 'command' | 'message' | 'component';

export type pageType = 'channel';
