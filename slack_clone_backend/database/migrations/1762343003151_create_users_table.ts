import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('nickname', 127).notNullable().unique()
      table.string('name', 127).notNullable()
      table.string('surname', 127).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 255).notNullable()
      table.text('description').nullable()
      table.boolean('mentions_only').notNullable().defaultTo(false)

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}