import { BrowserWindow, ipcMain } from 'electron'
import {
  UPDATER_CHANNELS,
  type UpdateProgress,
  type UpdateStatus
} from '../../shared/constants/updater'
import {
  autoUpdater,
  checkForUpdate,
  downloadUpdate,
  installUpdate
} from '../services/updater.service'

export function registerUpdaterHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(UPDATER_CHANNELS.CHECK, async () => {
    const result = await checkForUpdate()
    if (result.updateAvailable) {
      const status: UpdateStatus = {
        status: 'available',
        version: result.version ?? undefined,
        isForced: result.isForced
      }
      mainWindow.webContents.send(UPDATER_CHANNELS.STATUS, status)
    } else {
      const status: UpdateStatus = { status: 'not-available' }
      mainWindow.webContents.send(UPDATER_CHANNELS.STATUS, status)
    }
    return result
  })

  ipcMain.handle(UPDATER_CHANNELS.DOWNLOAD, async () => {
    const status: UpdateStatus = { status: 'downloading' }
    mainWindow.webContents.send(UPDATER_CHANNELS.STATUS, status)
    await downloadUpdate()
  })

  ipcMain.handle(UPDATER_CHANNELS.INSTALL, () => {
    installUpdate()
  })

  autoUpdater.on('download-progress', (info) => {
    const progress: UpdateProgress = {
      percent: Math.round(info.percent),
      bytesPerSecond: info.bytesPerSecond,
      transferred: info.transferred,
      total: info.total
    }
    mainWindow.webContents.send(UPDATER_CHANNELS.DOWNLOAD_PROGRESS, progress)
  })

  autoUpdater.on('update-downloaded', () => {
    const status: UpdateStatus = { status: 'downloaded' }
    mainWindow.webContents.send(UPDATER_CHANNELS.STATUS, status)
  })

  autoUpdater.on('error', (err) => {
    const status: UpdateStatus = { status: 'error', error: err.message }
    mainWindow.webContents.send(UPDATER_CHANNELS.STATUS, status)
  })
}
