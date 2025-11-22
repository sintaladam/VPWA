export enum ChannelType {
  Public = 'public',
  Private = 'private',
}

// export interface Message {
//   id: number;
//   timestamp: number;
//   senderId: number;
//   senderName: string;
//   content: string;
//   type: messageType;
// }

export interface KickVote {
  targetUserId: number;
  voters: Set<number>;
}

export interface ChannelAtr {
  type: ChannelType;
  name: string;
  description?: string;
}

export interface ProfileAtr {
  nickname: string;
  name: string;
  surname: string;
  description?: string;
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
  channelId: number;
  senderId: number;
  recipientId: number;
}

//type inviteStatusType = 'accepted' | 'pending' | 'rejected';

export type StatusType = 'online' | 'offline' | 'dnd';

export type TabName = 'channels' | 'invites';

export type DeviceType = 'mobile' | 'desktop';

export type messageType = 'command' | 'message' | 'component';

export type handleInviteType = 'accept' | 'reject';
