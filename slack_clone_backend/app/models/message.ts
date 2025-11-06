import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Channel from './channel.js'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare content: string

  @column()
  declare channel_id: number

  @column()
  declare sender_id: number
  
  @belongsTo(() => Channel, {
    foreignKey: 'channel_id'
  })
  declare channel: BelongsTo<typeof Channel>
  
  @belongsTo(() => User, {
    foreignKey: 'sender_id'
  })
  declare sender: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}