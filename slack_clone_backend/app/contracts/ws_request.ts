export type eventType = 'message';

export interface request {
  channelId?: number
  body: messageBody | subscribeBody
}

export interface messageBody {
  senderId: number
  message: string
}

export interface subscribeBody {
  channelId: number
}