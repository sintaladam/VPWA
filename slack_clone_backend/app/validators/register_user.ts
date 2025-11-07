import vine from '@vinejs/vine';

export const registerValidator = vine.compile(
  vine.object({
    nickname: vine.string().trim().minLength(1).maxLength(60),
    name: vine.string().trim().minLength(1).maxLength(60),
    surname: vine.string().trim().minLength(1).maxLength(60),
    email: vine.string().trim().email(),
    password: vine.string().minLength(6), // needs 'password_confirmation' in body
    description: vine.string().optional().nullable(),
  })
);

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string(),
  })
);