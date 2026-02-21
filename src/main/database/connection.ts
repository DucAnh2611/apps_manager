import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as schema from './schema'

let db: ReturnType<typeof drizzle<typeof schema>> | null = null
let sqlite: Database.Database | null = null

export function getDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (db) return db

  const dbDir = app.getPath('userData')
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })
  const dbPath = join(dbDir, 'apps-manager.db')

  if (!existsSync(dbPath)) writeFileSync(dbPath, '')
  sqlite = new Database(dbPath)

  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  db = drizzle(sqlite, { schema })
  return db
}

export function closeDatabase(): void {
  if (!sqlite) return

  sqlite.close()
  sqlite = null
  db = null
}
