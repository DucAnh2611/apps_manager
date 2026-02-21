import { app, BrowserWindow, net } from 'electron'
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as semver from 'semver'
import {
  LANGUAGE_CHANNELS,
  LANGUAGES_RELEASE_TAG,
  type LanguageMeta
} from '../../shared/constants/languages'
import en from '../../shared/i18n/en'

const GITHUB_USER = process.env.GITHUB_USER || 'DucAnh2611'
const GITHUB_REPO = process.env.GITHUB_REPO || 'apps_manager'

const languagesDir = join(app.getPath('userData'), 'languages')
const installedMetaPath = join(languagesDir, 'installed-meta.json')

let cachedAvailable: LanguageMeta[] | null = null
let cachedAvailableTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function ensureDir(): void {
  if (!existsSync(languagesDir)) {
    mkdirSync(languagesDir, { recursive: true })
  }
}

function getInstalledMeta(): Record<string, string> {
  try {
    if (existsSync(installedMetaPath)) {
      return JSON.parse(readFileSync(installedMetaPath, 'utf-8'))
    }
  } catch {
    // Ignore parse errors
  }
  return {}
}

function saveInstalledMeta(meta: Record<string, string>): void {
  ensureDir()
  writeFileSync(installedMetaPath, JSON.stringify(meta, null, 2), 'utf-8')
}

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const request = net.request(url)
    let body = ''

    request.on('response', (response) => {
      // Follow redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = Array.isArray(response.headers.location)
          ? response.headers.location[0]
          : response.headers.location
        fetchJson(redirectUrl).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }

      response.on('data', (chunk) => {
        body += chunk.toString()
      })
      response.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (e) {
          reject(e)
        }
      })
      response.on('error', reject)
    })

    request.on('error', reject)
    request.end()
  })
}

function fetchBuffer(url: string, onProgress?: (percent: number) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const request = net.request(url)
    const chunks: Buffer[] = []
    let totalLength = 0

    request.on('response', (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = Array.isArray(response.headers.location)
          ? response.headers.location[0]
          : response.headers.location
        fetchBuffer(redirectUrl, onProgress).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }

      const contentLength = parseInt(
        (Array.isArray(response.headers['content-length'])
          ? response.headers['content-length'][0]
          : response.headers['content-length']) || '0',
        10
      )

      response.on('data', (chunk) => {
        chunks.push(chunk)
        totalLength += chunk.length
        if (onProgress && contentLength > 0) {
          onProgress(Math.round((totalLength / contentLength) * 100))
        }
      })
      response.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      response.on('error', reject)
    })

    request.on('error', reject)
    request.end()
  })
}

export async function getAvailableLanguages(): Promise<LanguageMeta[]> {
  const now = Date.now()
  if (cachedAvailable && now - cachedAvailableTime < CACHE_TTL) {
    return cachedAvailable
  }

  try {
    // Fetch release info by tag
    const release = (await fetchJson(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/tags/${LANGUAGES_RELEASE_TAG}`
    )) as { assets: { name: string; browser_download_url: string }[] }

    // Find languages-meta.json asset
    const metaAsset = release.assets.find((a) => a.name === 'languages-meta.json')
    if (!metaAsset) return []

    const languages = (await fetchJson(metaAsset.browser_download_url)) as LanguageMeta[]
    cachedAvailable = languages
    cachedAvailableTime = now
    return languages
  } catch {
    return cachedAvailable ?? []
  }
}

export function getInstalledLanguages(): Record<string, string> {
  return getInstalledMeta()
}

export async function downloadLanguage(
  code: string,
  mainWindow: BrowserWindow
): Promise<{ success: boolean; error?: string }> {
  try {
    const available = await getAvailableLanguages()
    const lang = available.find((l) => l.code === code)
    if (!lang) {
      return { success: false, error: 'Language not found' }
    }

    // Fetch the release to find the asset
    const release = (await fetchJson(
      `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/tags/${LANGUAGES_RELEASE_TAG}`
    )) as { assets: { name: string; browser_download_url: string }[] }

    const asset = release.assets.find((a) => a.name === `${code}.json`)
    if (!asset) {
      return { success: false, error: `Asset ${code}.json not found` }
    }

    const buf = await fetchBuffer(asset.browser_download_url, (percent) => {
      mainWindow.webContents.send(LANGUAGE_CHANNELS.DOWNLOAD_PROGRESS, { code, percent })
    })

    // Validate JSON
    JSON.parse(buf.toString('utf-8'))

    ensureDir()
    writeFileSync(join(languagesDir, `${code}.json`), buf)

    // Update installed meta
    const meta = getInstalledMeta()
    meta[code] = lang.version
    saveInstalledMeta(meta)

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Download failed' }
  }
}

export function uninstallLanguage(code: string): { success: boolean } {
  try {
    const filePath = join(languagesDir, `${code}.json`)
    if (existsSync(filePath)) {
      unlinkSync(filePath)
    }
    const meta = getInstalledMeta()
    delete meta[code]
    saveInstalledMeta(meta)
    return { success: true }
  } catch {
    return { success: false }
  }
}

export async function refreshAvailableLanguages(): Promise<LanguageMeta[]> {
  cachedAvailable = null
  cachedAvailableTime = 0
  return await getAvailableLanguages()
}

export function getTranslations(code: string): Record<string, string> {
  if (code === 'en') {
    return { ...en }
  }

  try {
    const filePath = join(languagesDir, `${code}.json`)
    if (existsSync(filePath)) {
      const translations = JSON.parse(readFileSync(filePath, 'utf-8'))
      // Merge with English as fallback
      return { ...en, ...translations }
    }
  } catch {
    // Fall back to English
  }

  return { ...en }
}

export function checkLanguageUpdate(code: string): {
  hasUpdate: boolean
  installedVersion: string | null
  availableVersion: string | null
} {
  const installed = getInstalledMeta()
  const installedVersion = installed[code] ?? null

  if (!installedVersion || !cachedAvailable) {
    return { hasUpdate: false, installedVersion, availableVersion: null }
  }

  const lang = cachedAvailable.find((l) => l.code === code)
  if (!lang) {
    return { hasUpdate: false, installedVersion, availableVersion: null }
  }

  const hasUpdate = semver.gt(lang.version, installedVersion)
  return { hasUpdate, installedVersion, availableVersion: lang.version }
}
