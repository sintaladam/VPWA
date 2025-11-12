import type { ChannelType } from "src/components/models";

export interface Channel {
  id: number
  name: string
  description?: string
  type: ChannelType
  creator_id: number
}

export interface Invite {
  id: number
  channel_id: number
  sender_id: number
  recipient_id: number
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