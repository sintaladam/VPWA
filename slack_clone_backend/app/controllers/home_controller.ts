import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine';

export default class HomeController {
  async getChannels({ auth }: HttpContext) {
    console.log('get channels');
    const channels = await auth.user!.related('channels').query();
    return channels;
  }

  async getMembers({ auth, request }: HttpContext) {
    console.log('get members');
    const { channel_id } = await request.validateUsing(
      vine.compile(vine.object({
        channel_id: vine.number()
      }))
    );
    const channel = await auth.user!
      .related('channels').query()
      .where('channels.id', channel_id).firstOrFail();
    return channel.related('users').query().select([
      'id',
      'nickname',
      'name',
      'surname',
      'description',
      'email'
    ]);
  }

  async getInvites({ auth }: HttpContext) {
    console.log('get invites');
    const invites = await auth.user!.related('invites').query().preload('channel');
    return invites;
  }
}