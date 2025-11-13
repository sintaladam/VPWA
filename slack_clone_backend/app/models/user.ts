import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Channel from './channel.js'
import Invite from './invite.js';
import Message from './message.js';
import Role from './role.js';

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nickname: string

  @column()
  declare name: string

  @column()
  declare surname: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare description: string | null

  @manyToMany(() => Channel, {
    pivotTable: 'user_channels',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'channel_id'
  })
  declare channels: ManyToMany<typeof Channel>

  @hasMany(() => Invite, {
    foreignKey: 'recipient_id'
  })
  declare invites: HasMany<typeof Invite>
  
  @hasMany(() => Message, {
    foreignKey: 'sender_id'
  })
  declare messages: HasMany<typeof Message>

  @hasMany(() => Channel, {
    foreignKey: 'creator_id'
  })
  declare createdChannels: HasMany<typeof Channel>

  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
    pivotForeignKey: 'role_id',
    pivotRelatedForeignKey: 'user_id'
  })
  declare roles: ManyToMany<typeof Role>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  static messagesInChannel(channel_id: number) {
    return this.query().join('messages', 'users.id', 'messages.sender_id').where('messages.channel_id', channel_id);
  }
}