export type eventType = 'notification' | 'message'| 'kick_error' | 'error'| 'invite_error' | 'subscribe' | 'loadMessages' | 'channelDeleted' | 'leaveChannel' | 'userKicked' | 'kickVoteAdded' | 'newActivity' | 'userStatusChanged' | 'statusUpdated' | 'inviteSent' | 'joinedChannel' | '';

export interface request {
  channelId?: number
  slug?: string
  body?: messageBody | subscribeBody | statusBody
  perPage?: number
  createdAt?: Date
  userId?: number
}

export interface messageBody {
  message: string
  channelId: number
}

export interface subscribeBody {
  channelId: number
}

export interface statusBody {
  status: 'online' | 'offline' | 'DND'
}