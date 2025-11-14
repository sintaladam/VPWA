import Channel from '#models/channel';
import type { HttpContext } from '@adonisjs/core/http'
import { channelIdValidator, channelKickValidator, createChannelValidator, updateChannelValidator } from '#validators/channel';
import db from '@adonisjs/lucid/services/db';

export default class ChannelController {

  async getChannels({ auth }: HttpContext) {
    console.log('get channels');
    const user = auth.getUserOrFail();

    const channels = await user
      .related('channels')
      .query();
    
    return channels;
  }

  async createChannel({ auth, request }: HttpContext) {
    console.log('get invites');
    const user = auth.getUserOrFail();
    const { name, type, description } = await request.validateUsing(createChannelValidator);
    const txn = await db.transaction();

    try {
      const channel = await Channel.create({ name, type, description, creator_id: user.id }, { client: txn });
      await user.useTransaction(txn).related('channels').attach([channel.id]);

      await txn.commit();

      return { ok: true };
    } catch (error) {
      await txn.rollback();

      throw error;
    }
  }

  async updateChannel({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail();
    const { channelId } = await request.validateUsing(channelIdValidator);
    const validated = await request.validateUsing(updateChannelValidator);

    const channel = await user
      .related('channels')
      .query()
      .where('channels.id', channelId)
      .andWhere('channels.creator_id', user.id)
      .firstOrFail();

    await channel.merge(validated).save();

    return { ok: true };
  }

  async deleteChannel({ auth, request }: HttpContext) {
    console.log('delete channel');
    const user = auth.getUserOrFail();
    const { channelId } = await request.validateUsing(channelIdValidator);

    const channel = await user
      .related('channels')
      .query()
      .where('channels.id', channelId)
      .firstOrFail();

    if (channel.creator_id === user.id) {
      await channel.delete();
    }
    else {
      await user.related('channels').detach([channel.id]);
    }

    return { ok: true };
  }

  async joinChannel({ auth, request, response }: HttpContext) {
    console.log('join channel');
    const user = auth.getUserOrFail();
    const { channelId } = await request.validateUsing(channelIdValidator);

    const channel = await Channel
      .query()
      .where('id', channelId)
      .firstOrFail();

    if (channel.type !== 'public') {
      return response.forbidden({ error: 'channel not public' });
    }

    await channel.related('users').attach([user.id]);

    return { ok: true };
  }

  async getMembers({ auth, request }: HttpContext) {
    console.log('get members');
    const user = auth.getUserOrFail();
    const { channelId } = await request.validateUsing(channelIdValidator);

    const channel = await user
      .related('channels')
      .query()
      .where('channels.id', channelId)
      .firstOrFail();
    
    return channel
      .related('users')
      .query()
      .select([
        'id',
        'nickname',
        'name',
        'surname',
        'description',
        'email'
      ]);
  }

  async kickMember({ auth, request }: HttpContext) {
    console.log('kick member');
    const user = auth.getUserOrFail();
    const { channelId, userId } = await request.validateUsing(channelKickValidator);

    const channel = await Channel
      .query()
      .where('id', channelId)
      .andWhere('creator_id', user.id)
      .firstOrFail();
    
    await channel.related('users').detach([userId]);

    return { ok: true };
  }

}