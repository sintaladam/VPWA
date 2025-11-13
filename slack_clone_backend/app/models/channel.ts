import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Message from './message.js';

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string
  
  @column()
  declare description: string | null
  
  @column()
  declare type: string

  @column()
  declare creator_id: number

  @manyToMany(() => User, {
    pivotTable: 'user_channels',
    pivotForeignKey: 'channel_id',
    pivotRelatedForeignKey: 'user_id'
  })
  declare users: ManyToMany<typeof User>

  @hasMany(() => Message, {
    foreignKey: 'channel_id'
  })
  declare messages: HasMany<typeof Message>

  @belongsTo(() => User, {
    foreignKey: 'creator_id'
  })
  declare creator: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}