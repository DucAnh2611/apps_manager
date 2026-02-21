import { SQL, sql } from 'drizzle-orm'
import { SETTING_DEFAULTS, SETTING_KEYS } from '../../shared/constants/settings'
import { getDatabase } from './connection'
import { settings } from './schema'

export function runMigrations(): void {
  const db = getDatabase()

  const tryQuery = (query: SQL<unknown>) => {
    try {
      return db.run(query)
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const hasColumn = (table: string, column: string): boolean => {
    const rows = db.all<{ name: string }>(sql.raw(`PRAGMA table_info(${table})`))
    return rows.some((r) => r.name === column)
  }

  tryQuery(
    sql`
    CREATE TABLE IF NOT EXISTS apps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      icon TEXT,
      category TEXT NOT NULL DEFAULT 'General',
      favorite INTEGER NOT NULL DEFAULT 0,
      launch_count INTEGER NOT NULL DEFAULT 0,
      last_launched_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `
  )

  if (!hasColumn('apps', 'color')) {
    tryQuery(sql`ALTER TABLE apps ADD COLUMN color TEXT DEFAULT NULL`)
  }

  if (!hasColumn('apps', 'args')) {
    tryQuery(sql`ALTER TABLE apps ADD COLUMN args TEXT DEFAULT NULL`)
  }

  // Drop UNIQUE constraint on path (allows same exe with different args)
  const hasUniqueOnPath = db
    .all<{ name: string; unique: number }>(sql.raw(`PRAGMA index_list('apps')`))
    .some((idx) => {
      if (!idx.unique) return false
      const cols = db.all<{ name: string }>(sql.raw(`PRAGMA index_info('${idx.name}')`))
      return cols.some((c) => c.name === 'path')
    })

  if (hasUniqueOnPath) {
    tryQuery(sql`ALTER TABLE apps RENAME TO apps_old`)
    tryQuery(
      sql`
      CREATE TABLE apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        args TEXT,
        category TEXT NOT NULL DEFAULT 'General',
        favorite INTEGER NOT NULL DEFAULT 0,
        launch_count INTEGER NOT NULL DEFAULT 0,
        last_launched_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `
    )
    tryQuery(
      sql`
      INSERT INTO apps (id, name, path, icon, color, args, category, favorite, launch_count, last_launched_at, created_at, updated_at)
      SELECT id, name, path, icon, color, args, category, favorite, launch_count, last_launched_at, created_at, updated_at
      FROM apps_old
    `
    )
    tryQuery(sql`DROP TABLE apps_old`)
  }

  // Migrate single-string categories to JSON arrays
  const catRows = db.all<{ id: number; category: string }>(
    sql`SELECT id, category FROM apps WHERE category NOT LIKE '[%'`
  )
  for (const row of catRows) {
    db.run(sql`UPDATE apps SET category = ${JSON.stringify([row.category])} WHERE id = ${row.id}`)
  }

  tryQuery(
    sql`
    CREATE TABLE IF NOT EXISTS settings (\`
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    \`)
  `
  )

  // Seed default settings
  const seedKeys = [
    SETTING_KEYS.THEME,
    SETTING_KEYS.AUTO_LAUNCH,
    SETTING_KEYS.MONITOR_INTERVAL,
    SETTING_KEYS.WINDOW_MODE,
    SETTING_KEYS.WINDOW_WIDTH,
    SETTING_KEYS.WINDOW_HEIGHT,
    SETTING_KEYS.LANGUAGE
  ] as const

  for (const key of seedKeys) {
    db.insert(settings).values({ key, value: SETTING_DEFAULTS[key] }).onConflictDoNothing().run()
  }
}
