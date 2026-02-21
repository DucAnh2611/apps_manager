import { is } from '@electron-toolkit/utils'
import { BrowserWindow } from 'electron'
import { join } from 'path'

export function createSplashWindow(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    splash.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/splash.html`)
  } else {
    splash.loadFile(join(__dirname, '../renderer/splash.html'))
  }

  splash.once('ready-to-show', () => {
    splash.show()
  })

  return splash
}

export function updateSplash(splash: BrowserWindow, text: string, progress?: number): void {
  if (splash.isDestroyed()) return

  const escapedText = text.replace(/'/g, "\\'")
  const progressArg = typeof progress === 'number' ? progress.toString() : 'undefined'
  splash.webContents
    .executeJavaScript(`updateStatus('${escapedText}', ${progressArg})`)
    .catch(() => {})
}

export function closeSplash(splash: BrowserWindow): void {
  if (!splash.isDestroyed()) {
    splash.close()
  }
}
