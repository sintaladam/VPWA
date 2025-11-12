import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import Channel from '#models/channel'
import User from '#models/user'
import Role from '#models/role'
import Message from '#models/message'
import Invite from '#models/invite'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method

    await User.createMany([
      {
        nickname: 'admin',
        name: 'Admin',
        surname: 'User',
        email: 'admin@example.com',
        password: 'admin123',
        description: 'System administrator',
      },
      {
        nickname: 'johnd',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        password: 'password',
        description: 'Regular user',
      },
      {
        nickname: 'aliced',
        name: 'Alice',
        surname: 'Doe',
        email: 'alice@example.com',
        password: 'heslo',
        description: 'Regular user',
      },
    ]);

    await Role.create({
      value: 'admin'
    });

    await db.table('user_roles').insert([
      { user_id: 1, role_id: 1, created_at: new Date(), updated_at: new Date() }
    ]);

    await Channel.createMany([
      {
        name: 'general',
        description: 'General discussion channel',
        type: 'public',
        creator_id: 1,
      },
      {
        name: 'random',
        description: 'Off-topic conversations and memes',
        type: 'public',
        creator_id: 1,
      },
      {
        name: 'development',
        description: 'Talk about code and projects',
        type: 'public',
        creator_id: 1,
      },
      {
        name: 'design',
        description: 'UI/UX and creative work',
        type: 'private',
        creator_id: 1,
      },
      {
        name: 'support',
        description: 'Help and support requests',
        type: 'public',
        creator_id: 1,
      },
    ]);

    await db.table('user_channels').insert([
      { user_id: 2, channel_id: 1, created_at: new Date(), updated_at: new Date() },
      { user_id: 2, channel_id: 2, created_at: new Date(), updated_at: new Date() },
      { user_id: 2, channel_id: 3, created_at: new Date(), updated_at: new Date() },
      { user_id: 3, channel_id: 3, created_at: new Date(), updated_at: new Date() },
      { user_id: 3, channel_id: 4, created_at: new Date(), updated_at: new Date() },
      { user_id: 3, channel_id: 2, created_at: new Date(), updated_at: new Date() },
    ]);

    await Message.createMany([
      { content: 'Hey everyone, excited to join!', channel_id: 1, sender_id: 2 },
      { content: 'Anyone available for pair programming?', channel_id: 1, sender_id: 2 },
      { content: 'Channel 2 looks quiet today...', channel_id: 2, sender_id: 2 },
      { content: 'Testing the chat in channel 3!', channel_id: 3, sender_id: 2 },
      { content: 'Hey, this is user 3 in channel 3!', channel_id: 3, sender_id: 3 },
      { content: 'Lets discuss design ideas here.', channel_id: 4, sender_id: 3 },
      { content: 'Support channel looking good.', channel_id: 5, sender_id: 3 },
      { content: 'Ping me if anyone needs help!', channel_id: 5, sender_id: 3 },
    ]);

    await Invite.createMany([
      { channel_id: 1, sender_id: 2, recipient_id: 3 },
      { channel_id: 5, sender_id: 3, recipient_id: 2 },
      { channel_id: 1, sender_id: 2, recipient_id: 1 },
      { channel_id: 5, sender_id: 3, recipient_id: 1 },
    ]);
  }
}