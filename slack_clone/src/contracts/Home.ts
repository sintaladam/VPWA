import type { ChannelType } from "src/components/models";

export interface Channel {
  id: number
  name: string
  description?: string
  type: ChannelType
  creator_id: number
}