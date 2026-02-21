import { eq } from 'drizzle-orm'
import { SETTING_DEFAULTS } from '../../../shared/constants/settings'
import { getDatabase } from '../connection'
import { settings } from '../schema'

export function getSetting(key: string): string | undefined {
  const db = getDatabase()
  const row = db.select().from(settings).where(eq(settings.key, key)).get()
  return row?.value
}

export function setSetting(key: string, value: string) {
  const db = getDatabase()
  return db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value }
    })
    .run()
}

export function getAllSettings() {
  const db = getDatabase()
  const rows = db.select().from(settings).all()
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

export function resetAllSettings() {
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    setSetting(key, value)
  }
}
