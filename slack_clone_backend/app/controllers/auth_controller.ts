import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '#validators/register_user'
import User from '#models/user'

export default class AuthController {
  async register({ request }: HttpContext) {
    const data = await request.validateUsing(registerValidator);
    return User.create(data);
  }

  async login({ request, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator);
    const user = await User.verifyCredentials(email, password);
    return await auth.use('api').createToken(user);
  }

  async logout({ auth }: HttpContext) {
    auth.use('api').invalidateToken();
    return { ok: true };
  }

  async me({ auth }: HttpContext) {
    return auth.user;
  }
}