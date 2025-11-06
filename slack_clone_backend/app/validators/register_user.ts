import vine from '@vinejs/vine';

export const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(60),
    surname: vine.string().trim().minLength(1).maxLength(60),
    email: vine.string().trim().email(),
    password: vine.string().minLength(6).confirmed(), // needs 'password_confirmation' in body
    description: vine.string().optional().nullable(),
  })
);

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string(),
  })
);