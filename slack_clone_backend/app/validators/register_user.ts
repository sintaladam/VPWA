import vine from '@vinejs/vine';

export const registerValidator = vine.compile(
  vine.object({
    nickname: vine.string().trim().minLength(1).maxLength(127),
    name: vine.string().trim().minLength(1).maxLength(127),
    surname: vine.string().trim().minLength(1).maxLength(127),
    email: vine.string().trim().email(),
    password: vine.string().minLength(6),
    description: vine.string().optional().nullable(),
  })
);

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string(),
  })
);

export const updateValidator = vine.compile(
  vine.object({
    nickname: vine.string().trim().minLength(1).maxLength(127).optional(),
    name: vine.string().trim().minLength(1).maxLength(127).optional(),
    surname: vine.string().trim().minLength(1).maxLength(127).optional(),
    description: vine.string().optional().nullable(),
  })
);