import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async getChannels({ auth }: HttpContext) {
    const channels = await auth.user!.related('channels').query();
    return channels;
  };
}