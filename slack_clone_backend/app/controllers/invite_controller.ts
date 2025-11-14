import Channel from '#models/channel';
import type { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';
import { createInviteValidator, handleInviteValidator } from '#validators/invite';
import User from '#models/user';
import Invite from '#models/invite';

export default class InviteController {

  async getInvites({ auth }: HttpContext) {
    console.log('get invites');
    const user = auth.getUserOrFail();

    const invites = await user
      .related('invites')
      .query()
      .preload('channel');

    return invites;
  }

  async handleInvite({ auth, request, response }: HttpContext) {
    console.log('handle invite');
    const user = auth.getUserOrFail();
    const { inviteId, handle } = await request.validateUsing(handleInviteValidator);

    const invite = await user
      .related('invites')
      .query()
      .where('invites.id', inviteId)
      .firstOrFail();

    const channel = await Channel
      .query()
      .where('id', invite.channel_id)
      .firstOrFail();

    const sender = await channel
      .related('users')
      .query()
      .where('users.id', invite.sender_id)
      .first();

    if (!sender) {
      await invite.delete();

      return response.forbidden({ error: 'sender not in channel' });
    }

    if (handle === 'reject') {
      await Invite
        .query()
        .where('channel_id', invite.channel_id)
        .delete();
    }
    else {
      const txn = await db.transaction();
      try {
        await channel.useTransaction(txn).related('users').attach([user.id]);
        await Invite
          .query({ client: txn})
          .where('channel_id', invite.channel_id)
          .delete();

        await txn.commit();
      } catch (error) {
        await txn.rollback();

        throw error;
      }

    }

    return { ok: true };
  }

  async createInvite({ auth, request, response }: HttpContext) {
    console.log('create invite');
    const user = auth.getUserOrFail();
    const { channelId, slug } = await request.validateUsing(createInviteValidator);

    await user
      .related('channels')
      .query()
      .where('channels.id', channelId)
      .firstOrFail();

    const recipient = await User
      .query()
      .where('email', slug)
      .orWhere('nickname', slug)
      .first();
    

    if (!recipient) {
      return response.notFound({ error: 'user not found' });
    }

    const checkChannel = await recipient
      .related('channels')
      .query()
      .where('channels.id', channelId)
      .first();
    
    if (checkChannel) {
      return response.conflict({ error: 'user already in channel' });
    }

    await Invite.firstOrCreate({ channel_id: channelId, sender_id: user.id, recipient_id: recipient.id });

    return { ok: true };
  }

}