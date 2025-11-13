import vine from '@vinejs/vine';

export const handleInviteValidator = vine.compile(
  vine.object({
    inviteId: vine.number(),
    handle: vine.string().trim().in(['accept', 'reject'])
  })
);

export const createInviteValidator = vine.compile(
  vine.object({
    channelId: vine.number(),
    senderId: vine.number(),
    recipientId: vine.number(),
  })
);