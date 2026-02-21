import { eq, sql } from 'drizzle-orm'
import { getDatabase } from '../connection'
import { apps } from '../schema'
import type { AppInput, AppRecord, AppUpdate } from '../../types'

function parseCategories(raw: string): string[] {
  if (!raw) return ['General']
  try {
    if (raw.startsWith('[')) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // fall through
  }
  return [raw]
}

function serializeCategories(categories: string[] | undefined): string {
  if (!categories || categories.length === 0) return JSON.stringify(['General'])
  return JSON.stringify(categories)
}

function toAppRecord(row: typeof apps.$inferSelect): AppRecord {
  const { category, ...rest } = row
  return { ...rest, categories: parseCategories(category) }
}

export function getAllApps(): AppRecord[] {
  const db = getDatabase()
  return db.select().from(apps).all().map(toAppRecord)
}

export function getAppById(id: number): AppRecord | undefined {
  const db = getDatabase()
  const row = db.select().from(apps).where(eq(apps.id, id)).get()
  return row ? toAppRecord(row) : undefined
}

export function addApp(input: AppInput): AppRecord {
  const db = getDatabase()
  const row = db
    .insert(apps)
    .values({
      name: input.name,
      path: input.path,
      args: input.args ?? null,
      icon: input.icon ?? null,
      color: input.color ?? null,
      category: serializeCategories(input.categories)
    })
    .returning()
    .get()
  return toAppRecord(row)
}

export function updateApp(input: AppUpdate): AppRecord {
  const db = getDatabase()
  const values: Record<string, unknown> = {
    updatedAt: sql`datetime('now')`
  }

  if (input.name !== undefined) values.name = input.name
  if (input.path !== undefined) values.path = input.path
  if (input.args !== undefined) values.args = input.args
  if (input.icon !== undefined) values.icon = input.icon
  if (input.color !== undefined) values.color = input.color
  if (input.categories !== undefined) values.category = serializeCategories(input.categories)
  if (input.favorite !== undefined) values.favorite = input.favorite

  const row = db.update(apps).set(values).where(eq(apps.id, input.id)).returning().get()
  return toAppRecord(row)
}

export function deleteApp(id: number) {
  const db = getDatabase()
  return db.delete(apps).where(eq(apps.id, id)).returning().get()
}

export function incrementLaunchCount(id: number) {
  const db = getDatabase()
  return db
    .update(apps)
    .set({
      launchCount: sql`${apps.launchCount} + 1`,
      lastLaunchedAt: sql`datetime('now')`,
      updatedAt: sql`datetime('now')`
    })
    .where(eq(apps.id, id))
    .returning()
    .get()
}
