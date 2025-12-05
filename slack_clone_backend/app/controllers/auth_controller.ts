import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator, updateValidator } from '#validators/register_user'
import User from '#models/user'

export default class AuthController {
  async register({ request, auth }: HttpContext) {
    console.log('register');
    const data = await request.validateUsing(registerValidator);
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

  async update({ request, auth }: HttpContext) {
    console.log('update user');
    const user = auth.getUserOrFail();
    const validated = await request.validateUsing(updateValidator);

    await user.merge(validated).save();

    return { ok: true };
  }
}