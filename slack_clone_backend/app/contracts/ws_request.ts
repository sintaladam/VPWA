export type eventType = 'message';

export interface request {
  channelId?: number
  body: messageBody | subscribeBody
}

export interface messageBody {
  message: string
}

export interface subscribeBody {
  channelId: number
}