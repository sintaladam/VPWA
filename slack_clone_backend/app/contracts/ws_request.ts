export type eventType = 'message' | 'error'| 'subscribe' | 'loadMessages' | 'channelDeleted' | 'leaveChannel' | 'userKicked' | 'kickVoteAdded' | 'newActivity' | 'userStatusChanged' | 'statusUpdated' |'';

export interface request {
  channelId?: number
  body: messageBody | subscribeBody
  perPage?: number
  createdAt?: Date
}

export interface messageBody {
  message: string
}

export interface subscribeBody {
  channelId: number
}