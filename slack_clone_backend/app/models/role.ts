import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations';
import User from './user.js';

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare value: string

  @manyToMany(() => User, {
    pivotTable: 'user_roles',
    pivotForeignKey: 'role_id',
    pivotRelatedForeignKey: 'user_id',
    pivotTimestamps: true,
  })
  declare users: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}