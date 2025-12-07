import type { ChannelType, StatusType } from "src/components/models";
import type { User } from 'src/contracts/Auth'

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
  status: StatusType
}

export interface Message {
  id: number
  sender: User
  content: string
  createdAt: string
  updatedAt?: string
  perPage?: number
}

export interface Activity {
  sender: User
  content: string
}