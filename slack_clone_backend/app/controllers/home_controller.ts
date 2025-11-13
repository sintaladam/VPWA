import Channel from '#models/channel';
import type { HttpContext } from '@adonisjs/core/http'
//import vine from '@vinejs/vine';
import { channelIdValidator, createChannelValidator } from '#validators/channel';
import db from '@adonisjs/lucid/services/db';
import { handleInviteValidator } from '#validators/invite';
import Invite from '#models/invite';

export default class HomeController {
  async getChannels({ auth }: HttpContext) {
    console.log('get channels');
    const channels = await auth.user!.related('channels').query();
    return channels;
  }

  async getMembers({ auth, request }: HttpContext) {
    console.log('get members');
    const { channelId } = await request.validateUsing(channelIdValidator);
    const channel = await auth.user!
      .related('channels').query()
      .where('channels.id', channelId).firstOrFail();
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

  async deleteChannel({ auth, request }: HttpContext) {
    console.log('delete channel');
    const { channelId } = await request.validateUsing(channelIdValidator);
    const user = auth.user!
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

  async createChannel({ auth, request }: HttpContext) {
    const user = auth.user!
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
    const user = auth.user!;
    const { channelId } = await request.validateUsing(channelIdValidator);
    const validated = await request.validateUsing(createChannelValidator);
    
    const channel = await user
      .related('channels')
      .query()
      .where('channels.id', channelId)
      .andWhere('channel.creator_id', user.id)
      .firstOrFail();
    
    await channel.merge(validated).save();
    
    return { ok: true };
  }

  async handleInvite({ auth, request, response}: HttpContext) {
    const user = auth.user!;
    const { inviteId, handle } = await request.validateUsing(handleInviteValidator);

    const invite = await user
      .related('invites')
      .query()
      .where('invite.id', inviteId)
      .andWhere('user.id', user.id)
      .firstOrFail();
    
    const channel = await Channel
      .query()
      .where('id', invite.channel_id)
      .firstOrFail();
    
    const sender = await channel
      .related('users')
      .query()
      .where('user.id', invite.sender_id)
      .first();
    
    if (!sender) {
      await invite.delete();
      return response.forbidden({ error: 'sender not in channel' });
    }

    if (handle === 'reject') {
      await invite.delete();
    }
    else {
      const txn = await db.transaction();
      try {
        await channel.useTransaction(txn).related('users').attach([user.id]);
        await invite.useTransaction(txn).delete();
          await txn.commit();
      } catch (error) {
        await txn.rollback();
        throw error;
      }
      
    }

    return { ok: true };
  }

}