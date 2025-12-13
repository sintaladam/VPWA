import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator, updateValidator } from '#validators/register_user'
import User from '#models/user'

export default class AuthController {
  async register({ request, auth, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator);

    if (data.nickname) {
      const existing = await User.query().where('nickname', data.nickname).first();
      if (existing) {
        return response.status(409).send({ error: 'Nickname already taken', field: 'nickname' });
      }
    }

    const user = await User.create(data);
    const token = await auth.use('api').createToken(user);
    return token;
  }

  async login({ request, auth }: HttpContext) {
    console.log('login');
    const { email, password } = await request.validateUsing(loginValidator);
    const user = await User.verifyCredentials(email, password);
    const token = await auth.use('api').createToken(user);
    return token;
  }

  async logout({ auth }: HttpContext) {
    console.log('logout');
    auth.use('api').invalidateToken();
    return { ok: true };
  }

  async me({ auth }: HttpContext) {
    console.log('me');
    return auth.user;
  }

  async update({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail();
    const validated = await request.validateUsing(updateValidator);
    if (validated.nickname && validated.nickname !== user.nickname) {
      const existing = await User.query().where('nickname', validated.nickname).first();
      if (existing) {
        return response.status(409).send({ error: 'Nickname already taken', field: 'nickname' });
      }
    }

    await user.merge(validated).save();
    return { ok: true };
  }

  async updateStatus({ request, auth }: HttpContext) {
    console.log('update status');
    const user = auth.getUserOrFail();
    const { status } = request.only(['status']) as { status: 'online' | 'DND' | 'offline' };
    
    user.status = status;
    await user.save();

    return { ok: true };
  }
}