import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Channel from '#models/channel'

export default class KickVote extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare channel_id: number

  @column()
  declare target_user_id: number

  @column()
  declare voter_user_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Channel, { foreignKey: 'channel_id' })
  declare channel: BelongsTo<typeof Channel>

  @belongsTo(() => User, { foreignKey: 'target_user_id' })
  declare targetUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'voter_user_id' })
  declare voterUser: BelongsTo<typeof User>
}
