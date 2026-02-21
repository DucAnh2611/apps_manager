import { is } from '@electron-toolkit/utils'
import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as semver from 'semver'

export interface UpdateCheckResult {
  updateAvailable: boolean
  isForced: boolean
  version: string | null
}

interface UpdateMeta {
  minVersion: string
}

export function configureAutoUpdater(): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.logger = null
}

export async function checkForUpdate(): Promise<UpdateCheckResult> {
  if (is.dev) {
    return { updateAvailable: false, isForced: false, version: null }
  }

  try {
    const result = await autoUpdater.checkForUpdates()

    if (!result || !result.updateInfo) {
      return { updateAvailable: false, isForced: false, version: null }
    }

    const latestVersion = result.updateInfo.version
    const currentVersion = app.getVersion()

    if (!semver.gt(latestVersion, currentVersion)) {
      return { updateAvailable: false, isForced: false, version: null }
    }

    // Check for force update via update-meta.json in release notes or assets
    let isForced = false
    try {
      const releaseNotes = result.updateInfo.releaseNotes
      if (typeof releaseNotes === 'string') {
        const metaMatch = releaseNotes.match(/<!--update-meta:(.*?)-->/)
        if (metaMatch) {
          const meta: UpdateMeta = JSON.parse(metaMatch[1])
          if (meta.minVersion && semver.lt(currentVersion, meta.minVersion)) {
            isForced = true
          }
        }
      }
    } catch {
      // If meta parsing fails, treat as optional update
    }

    return { updateAvailable: true, isForced, version: latestVersion }
  } catch {
    return { updateAvailable: false, isForced: false, version: null }
  }
}

export async function downloadUpdate(): Promise<void> {
  await autoUpdater.downloadUpdate()
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall(false, true)
}

export { autoUpdater }
