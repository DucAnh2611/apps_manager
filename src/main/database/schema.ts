import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const apps = sqliteTable('apps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  path: text('path').notNull(),
  icon: text('icon'),
  color: text('color'),
  args: text('args'),
  category: text('category').default('General').notNull(),
  favorite: integer('favorite').default(0).notNull(),
  launchCount: integer('launch_count').default(0).notNull(),
  lastLaunchedAt: text('last_launched_at'),
  createdAt: text('created_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`(datetime('now'))`)
    .notNull()
})

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull()
})
