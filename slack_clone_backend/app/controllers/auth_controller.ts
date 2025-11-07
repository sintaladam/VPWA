import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '#validators/register_user'
import User from '#models/user'

export default class AuthController {
  async register({ request, auth }: HttpContext) {
    const data = await request.validateUsing(registerValidator);
    const user = await User.create(data);
    const token = await auth.use('api').createToken(user);
    console.log(user, token);
    return token;
  }

  async login({ request, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator);
    const user = await User.verifyCredentials(email, password);
    const token = await auth.use('api').createToken(user);
    console.log(user, token);
    return token;
  }

  async logout({ auth }: HttpContext) {
    auth.use('api').invalidateToken();
    return { ok: true };
  }

  async me({ auth }: HttpContext) {
    return auth.user;
  }
}