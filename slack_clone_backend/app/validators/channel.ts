import vine from '@vinejs/vine';

export const createChannelValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(127),
    type: vine.string().in(['public','private']),
    description: vine.string().optional().nullable(),
  })
);

export const updateChannelValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(127).optional(),
    type: vine.string().in(['public', 'private']).optional(),
    description: vine.string().optional().nullable(),
  })
);

export const channelIdValidator = vine.compile(
  vine.object({
    channelId: vine.number()
  })
);