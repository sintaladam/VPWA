import type { ChannelType } from "src/components/models";

export interface Channel {
  id: number
  name: string
  description?: string
  type: ChannelType
  creatorId: number
}

export interface Invite {
  id: number
  channelId: number
  senderId: number
  recipientId: number
  channel: Channel
}

export interface Member {
  id: number
  nickname: string
  name: string
  surname: string
  description?: string
  email: string
}