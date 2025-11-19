export type requestType = 'sendMessage';

export interface request {
  type: requestType,
  channelId: number,
  body: messageBody
}

export interface messageBody {
  senderId: number,
  message: string,
}