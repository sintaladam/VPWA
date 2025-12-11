import { eventType, messageBody, request } from "../contracts/ws_request.js";
import { ChannelListener, BroadcastingChannels } from "../misc/channelEvents.js";
import db from "@adonisjs/lucid/services/db";
import Channel from "#models/channel";
import User from "#models/user";
import KickVote from "#models/kick_vote";
import ChannelBan from "#models/channel_ban";
import Invite from "#models/invite";
import { getBroadcastingChannels } from "#start/ws_kernel";

let broadcastingChannels: BroadcastingChannels;

class SocketService {
  private offlineUsers = [] as {userId: number, since: string}[];
  async handle(event: string, data: request, listener: ChannelListener) {
    if (!broadcastingChannels) broadcastingChannels = getBroadcastingChannels();
    console.log(event, data);
    if (event === 'message') {
      const body = data.body as messageBody;
      this.handleMessage(body, listener);
    }
    else if (event === 'subscribe') listener.subscribe(data.channelId!);
    else if (event === 'loadMessages') this.loadMessages(listener, data);
    else if (event === 'deleteChannel') this.deleteChannel(listener, data.channelId);
    else if (event === 'leaveChannel') this.leaveChannel(listener, data.channelId);
    else if (event === 'kickUser') this.kickUser(listener, data);
    else if (event === 'activity') this.handleActivity(data.body as messageBody, listener)
    else if (event === 'updateStatus') this.updateStatus(listener, data);
    else if (event === 'inviteUser') this.inviteUser(listener, data);
  }
  private broadcast(event: eventType, data: object, listener: ChannelListener) {
    listener.broadcast(event, data);
  }

  private send(event: eventType, data: object, listener: ChannelListener) {
    listener.send(event, data)
  }

  private async handleMessage(body: messageBody, listener: ChannelListener) {
    const user = listener.getUser();
    const channel_id = listener.getChannelId();

    if (!channel_id) {
      console.error('No subscription to channel');
      this.send('error', { message: 'No subscription to channel' }, listener);
      return;
    }

    const txn = await db.transaction();

    try {
      const message = await user
        .useTransaction(txn)
        .related('messages')
        .create({ content: body.message, channel_id });

      await txn.commit();

      await message.load('sender');

      //this.broadcast('message', { messages: [message] }, listener);
      broadcastingChannels.broadcastToActive('message', { messages: [message] }, listener);
    } catch (error) {
      await txn.rollback();

      console.error(error.message);
    }
  }

  private async loadMessages(listener: ChannelListener, data?: request) {
    const channel_id = listener.getChannelId();

    if (!channel_id) {
      console.error('No subscription to channel');
      this.send('error', { message: 'No subscription to channel' }, listener);
      return;
    }
    // read pagination params only from top-level
    // we need only limit (perPage) and createdAt (cursor)
    const perPageRaw = (data && data.perPage) ?? 25;
    const perPage = Math.max(1, Number(perPageRaw) || 25);

    const channel = await Channel
      .query()
      .where('id', channel_id)
      .first();
    
    if (!channel) {
      console.error('Invalid channel');
      this.send('error', { message: 'Invalid channel' }, listener);
      return;
    }

    
    const cutoff = (() => {
      if (!data?.createdAt) {
    

        let offUser = this.offlineUsers.find(el => el.userId === listener.getUser().id);
        if (offUser) {
          return offUser.since;
        }


        // first page
        return new Date().toISOString();
      }

      const parsed = new Date(data.createdAt);

      if (isNaN(parsed.getTime())) {
        // invalid input sent by the client
        this.send('error', { message: 'Invalid createdAt format' }, listener);
      }

      return parsed.toISOString();
    })();
    console.log(cutoff);

    const messages = await channel
      .related('messages')
      .query()
      .preload('sender')
      .where('created_at', '<', cutoff)
      .orderBy('created_at', 'desc')
      .limit(perPage);

    this.send('message', { messages }, listener);
  }

  private async deleteChannel(listener: ChannelListener, channelId?: number) {
    if (!channelId) {
      this.send('error', { message: 'No channelId provided' }, listener);
      return;
    }

    const channel = await Channel.query().where('id', channelId).first();
    if (!channel) {
      this.send('error', { message: 'Invalid channel' }, listener);
      return;
    }

    //permission check
    //for now frontend only allows admin to delete channel
    const txn = await db.transaction();
    try {
      // delete channel
      await channel.useTransaction(txn).delete();
      await txn.commit();

      // notify all listeners in the channel (and the requester)
      this.broadcast('channelDeleted', { channelId }, listener);
      this.send('channelDeleted', { channelId }, listener);
    } catch (error) {
      await txn.rollback();
      console.error('deleteChannel error', error);
      this.send('error', { message: 'Failed to delete channel' }, listener);
    }
  }

  private async leaveChannel(listener: ChannelListener, channelId?: number) {
    if (!channelId) {
      this.send('error', { message: 'No channelId provided' }, listener);
      return;
    }

    const user = listener.getUser();
    if (!user) {
      this.send('error', { message: 'Not authenticated' }, listener);
      return;
    }

    try {
      await db
        .from('user_channels')
        .where('channel_id', channelId)
        .andWhere('user_id', user.id)
        .delete();

      broadcastingChannels.broadcastToChannel(channelId, 'leaveChannel', { channelId, userId: user.id });

      this.send('leaveChannel', { channelId, userId: user.id }, listener);
    } catch (error) {
      console.error('leaveChannel error', error);
      this.send('error', { message: 'Failed to leave channel' }, listener);
    }
  }

  private async kickUser(listener: ChannelListener, data?: request) {
    const requester = listener.getUser();
    const payload: any = data ?? {};
    const channelId = Number(payload.channelId);
    const targetNickname = payload.targetNickname;
    const isAdmin = !!payload.isAdmin;

    if (!channelId || !targetNickname) {
      this.send('error', { message: 'channelId and targetNickname required' }, listener);
      return;
    }

    // find target user
    const targetUser = await User.query().where('nickname', targetNickname).first();
    if (!targetUser) {
      this.send('error', { message: 'User not found' }, listener);
      return;
    }

    // check if target is banned
    const existingBan = await ChannelBan.query()
      .where('channel_id', channelId)
      .where('user_id', targetUser.id)
      .first();

    if (existingBan) {
      this.send('error', { message: 'User is already banned from this channel' }, listener);
      return;
    }

    const txn = await db.transaction();
    try {
      if (isAdmin) {
        // admin instant kick
        const channel = await Channel.query({ client: txn }).where('id', channelId).first();
        if (!channel) {
          await txn.rollback();
          this.send('error', { message: 'Channel not found' }, listener);
          return;
        }

        // remove user from channel
        await txn
          .from('user_channels')
          .where('channel_id', channelId)
          .andWhere('user_id', targetUser.id)
          .delete();

        // create ban record
        await ChannelBan.create({
          channel_id: channelId,
          user_id: targetUser.id,
        }, { client: txn });

        // clear all kick votes for this user
        await KickVote.query({ client: txn })
          .where('channel_id', channelId)
          .where('target_user_id', targetUser.id)
          .delete();

        await txn.commit();

        // broadcast kick event
        broadcastingChannels.broadcastToChannel(channelId, 'userKicked', { 
          channelId, 
          userId: targetUser.id, 
          nickname: targetNickname, 
          permanent: true 
        });
        this.send('userKicked', { channelId, userId: targetUser.id, nickname: targetNickname, permanent: true }, listener);
      } else {
        // member vote-kick: register vote
        const existing = await KickVote.query({ client: txn })
          .where('channel_id', channelId)
          .where('target_user_id', targetUser.id)
          .where('voter_user_id', requester.id)
          .first();

        if (existing) {
          await txn.rollback();
          this.send('error', { message: 'You already voted to kick this user' }, listener);
          return;
        }

        // create vote
        await KickVote.create({
          channel_id: channelId,
          target_user_id: targetUser.id,
          voter_user_id: requester.id,
        }, { client: txn });

        const voteCount = await KickVote.query({ client: txn })
          .where('channel_id', channelId)
          .where('target_user_id', targetUser.id)
          .count('* as total');
        
        const total = Number(voteCount[0].$extras?.total ?? 0);
        console.log("Vote count for user", targetNickname, ":", total);

        if (total >= 3) {
          await txn
            .from('user_channels')
            .where('channel_id', channelId)
            .andWhere('user_id', targetUser.id)
            .delete();

          await ChannelBan.create({
            channel_id: channelId,
            user_id: targetUser.id,
          }, { client: txn });

          // clear votes
          await KickVote.query({ client: txn })
            .where('channel_id', channelId)
            .where('target_user_id', targetUser.id)
            .delete();

          await txn.commit();

          broadcastingChannels.broadcastToChannel(channelId, 'userKicked', { 
            channelId, 
            userId: targetUser.id, 
            nickname: targetNickname, 
            permanent: true, 
            voteKick: true 
          });
          this.send('userKicked', { channelId, userId: targetUser.id, nickname: targetNickname, permanent: true, voteKick: true }, listener);
        } else {
          await txn.commit();
          // notify channel members about vote progress
          broadcastingChannels.broadcastToChannel(channelId, 'kickVoteAdded', { 
            channelId, 
            targetUserId: targetUser.id, 
            nickname: targetNickname, 
            voteCount: total 
          });
          this.send('kickVoteAdded', { channelId, targetUserId: targetUser.id, nickname: targetNickname, voteCount: total }, listener);
        }
      }
    } catch (err) {
      await txn.rollback();
      console.error('kickUser error', err);
      this.send('error', { message: 'Failed to kick user' }, listener);
    }
  }

  private handleActivity(body: messageBody, listener: ChannelListener) {
    broadcastingChannels.broadcastToActive('newActivity', { content: body.message, sender: listener.getUser() }, listener);
    //this.broadcast('newActivity', { content: body.message, sender: listener.getUser() }, listener);
  }

  private async updateStatus(listener: ChannelListener, data?: request) {
    const user = listener.getUser();
    const payload: any = data ?? {};
    const newStatus = payload.status; // 'online' | 'DND' | 'offline'

    if (!newStatus || !['online', 'DND', 'offline'].includes(newStatus)) {
      this.send('error', { message: 'Invalid status. Must be: online, DND, or offline' }, listener);
      return;
    }

    const txn = await db.transaction();
    try {
      // update user status in database
      await User.query({ client: txn })
        .where('id', user.id)
        .update({ status: newStatus });

      await txn.commit();

      if (newStatus === 'offline') {
        let offUser = this.offlineUsers.find(el => el.userId === user.id);
        if (!offUser) {
          offUser = { userId: user.id, since: '' }
          this.offlineUsers.push(offUser);
        }
        offUser.since = new Date().toISOString();
      }

      else {
        let offUser = this.offlineUsers.find(el => el.userId === user.id);
        if (offUser) {
          console.log(offUser);
          this.offlineUsers = this.offlineUsers.filter(el => el.userId !== user.id);
          const targets = await broadcastingChannels.getSocketsByUserId(user.id);
          targets.forEach(async el => {
            if ([...el.rooms].length > 1) {
              const channel = await Channel.query().where('id', parseInt([...el.rooms][1])).firstOrFail();
              const messages = await channel
                .related('messages')
                .query()
                .preload('sender')
                .where('created_at', '>', offUser.since);
              el.emit('message', { messages });
            }
          });
        }
      }
      

      // get all channels this user is in
      const userChannels = await db
        .from('user_channels')
        .where('user_id', user.id)
        .select('channel_id');

      // broadcast status change to all channels user is member of
      for (const uc of userChannels) {
        broadcastingChannels.broadcastToChannel(uc.channel_id, 'userStatusChanged', {
          userId: user.id,
          nickname: user.nickname,
          status: newStatus
        });
      }

      // also notify users inactive sockets
      const targets = await broadcastingChannels.getInactiveSockets();
      targets.filter(el => el.data.user.id === user.id).forEach(el => el.emit('userStatusChanged', {
        userId: user.id,
        nickname: user.nickname,
        status: newStatus
      }));
    } catch (err) {
      await txn.rollback();
      console.error('updateStatus error', err);
      this.send('error', { message: 'Failed to update status' }, listener);
    }
  }
  private async inviteUser(listener: ChannelListener, data?: request) {
    const inviter = listener.getUser();
    const { channelId, slug } = data ?? {}; //slug is either nickname or email
    console.log(`User ${inviter.nickname} is inviting user with slug "${slug}" to channel ID ${channelId}.`);

    if (!channelId || !slug) {
      this.send('error', { message: 'channelId and slug (nickname or email) are required' }, listener);
      return;
    }

    // Find the recipient user by nickname or email
    const targetUser = await User.query()
      .where('nickname', slug)
      .orWhere('email', slug)
      .first();

    if (!targetUser) {
      this.send('error', { message: `User with slug "${slug}" not found` }, listener);
      return;
    }

    // This could be optimized with a global user-socket map
    // Find the target user's socket globally
    const targetSockets = await broadcastingChannels.getSocketsByUserId(targetUser.id);

    if (!targetSockets) {
      console.log(`Target user with ID ${targetUser.id} is not currently connected.`);
      this.send('error', { message: `User with slug "${slug}" is not currently connected` }, listener);
      return;
    }

    // Find the channel details
    const channel = await Channel.query().where('id', channelId).first();
    if (!channel) {
      this.send('error', { message: `Channel with ID ${channelId} not found` }, listener);
      return;
    }

    // Create the Invite record in the database
    const invite = await Invite.create({
      channel_id: channel.id,
      sender_id: inviter.id,
      recipient_id: targetUser.id,
    });

    // Preload the channel and sender for the invite
    await invite.load('channel');
    await invite.load('sender');

    // Notify the invited user
    targetSockets.forEach(sock => sock.emit('inviteReceived', {
      id: invite.id,
      channelId: invite.channel_id,
      senderId: invite.sender_id,
      recipientId: invite.recipient_id,
      channel: {
        id: invite.channel.id,
        name: invite.channel.name,
      },
    }));

    this.send('inviteSent', { channelId, slug }, listener);
  }
}

export default new SocketService();