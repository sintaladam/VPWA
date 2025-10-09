export enum ChannelType {
  Public = 'public',
  Private = 'private'
}

export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface Message {
  id: number;
  timestamp: string;
  senderId: number;
  senderName: string;
  content: string;
}

export interface ChannelAtr {
  id: number;
  type: ChannelType;
  name: string;
  description: string;
}