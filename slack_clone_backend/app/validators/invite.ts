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
    slug: vine.string().trim().minLength(1).maxLength(127)
  })
);