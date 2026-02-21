import { readFileSync } from 'fs'
import { extname } from 'path'
import { ipcMain, dialog } from 'electron'
import * as appRepo from '../database/repositories/app.repository'
import { launchApp } from '../services/app-launcher.service'
import type { AppInput, AppUpdate } from '../types'

export function registerAppHandlers(): void {
  ipcMain.handle('apps:get-all', () => {
    return appRepo.getAllApps()
  })

  ipcMain.handle('apps:add', (_event, input: AppInput) => {
    return appRepo.addApp(input)
  })

  ipcMain.handle('apps:update', (_event, input: AppUpdate) => {
    return appRepo.updateApp(input)
  })

  ipcMain.handle('apps:delete', (_event, id: number) => {
    return appRepo.deleteApp(id)
  })

  ipcMain.handle('apps:launch', async (_event, id: number) => {
    const app = appRepo.getAppById(id)
    if (!app) return { success: false, error: 'App not found' }

    const result = await launchApp(app.path, app.args)
    if (result.success) {
      appRepo.incrementLaunchCount(id)
    }
    return result
  })

  ipcMain.handle('apps:browse', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {
          name: 'Applications',
          extensions:
            process.platform === 'win32'
              ? ['exe', 'lnk', 'bat', 'cmd']
              : process.platform === 'darwin'
                ? ['app']
                : ['AppImage', 'desktop', 'sh']
        },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  ipcMain.handle('apps:browse-icon', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'ico', 'svg', 'webp', 'bmp', 'gif']
        }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    const ext = extname(filePath).toLowerCase().replace('.', '')
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      ico: 'image/x-icon',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      bmp: 'image/bmp',
      gif: 'image/gif'
    }
    const mime = mimeMap[ext] || 'image/png'
    const buffer = readFileSync(filePath)
    return `data:${mime};base64,${buffer.toString('base64')}`
  })
}
