import { BrowserWindow, ipcMain } from 'electron'
import { SETTING_KEYS } from '../../shared/constants/settings'
import * as settingsRepo from '../database/repositories/settings.repository'
import { setAutoLaunch } from '../services/auto-launch.service'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', (_event, key: string) => {
    return settingsRepo.getSetting(key)
  })

  ipcMain.handle('settings:set', (_event, key: string, value: string) => {
    settingsRepo.setSetting(key, value)

    // Handle side-effects
    if (key === SETTING_KEYS.AUTO_LAUNCH) {
      setAutoLaunch(value === 'true')
    }

    if (key === SETTING_KEYS.MONITOR_INTERVAL) {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('system:restart-monitor')
      })
      ipcMain.emit('system:restart-monitor')
    }

    if (key === SETTING_KEYS.ACTION_ON_CLOSE) {
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('action-on-close-changed')
      })
      ipcMain.emit('action-on-close-changed')
    }

    return { success: true }
  })

  ipcMain.handle('settings:get-all', () => {
    return settingsRepo.getAllSettings()
  })

  ipcMain.handle('settings:reset-all', () => {
    settingsRepo.resetAllSettings()

    // Trigger side-effects
    setAutoLaunch(false)

    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('system:restart-monitor')
      win.webContents.send('action-on-close-changed')
    })
    ipcMain.emit('system:restart-monitor')
    ipcMain.emit('action-on-close-changed')

    return { success: true }
  })
}
