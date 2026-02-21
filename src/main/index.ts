import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, Menu, shell, Tray } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { ACTIONS_ON_CLOSE, SETTING_KEYS, WINDOW_MODES } from '../shared/constants/settings'
import { closeDatabase, runMigrations } from './database'
import * as settingsRepo from './database/repositories/settings.repository'
import { registerAppHandlers } from './ipc/app.ipc'
import { registerLanguageHandlers } from './ipc/language.ipc'
import { registerSettingsHandlers } from './ipc/settings.ipc'
import { registerSystemHandlers } from './ipc/system.ipc'
import { registerUpdaterHandlers } from './ipc/updater.ipc'
import {
  autoUpdater,
  checkForUpdate,
  configureAutoUpdater,
  downloadUpdate,
  installUpdate,
  type UpdateCheckResult
} from './services/updater.service'
import { closeSplash, createSplashWindow, updateSplash } from './splash'

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}

let isQuitting = false
let tray: Tray | null = null
let closeHandler: ((event: Electron.Event) => void) | null = null

app.on('before-quit', () => {
  isQuitting = true
})

function createWindow(): BrowserWindow {
  const windowMode = settingsRepo.getSetting(SETTING_KEYS.WINDOW_MODE) || 'custom'
  const windowWidth = Math.max(
    800,
    parseInt(settingsRepo.getSetting(SETTING_KEYS.WINDOW_WIDTH) || '1200', 10) || 1200
  )
  const windowHeight = Math.max(
    600,
    parseInt(settingsRepo.getSetting(SETTING_KEYS.WINDOW_HEIGHT) || '800', 10) || 800
  )

  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    show: false,
    title: 'Apps Manager',
    center: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (windowMode === WINDOW_MODES.FULL) {
      mainWindow.maximize()
    }
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.apps-manager')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize database and run migrations
  runMigrations()

  // Configure auto updater
  configureAutoUpdater()

  // Show splash screen
  const splash = createSplashWindow()

  // Check for updates via splash
  let pendingUpdate: UpdateCheckResult | null = null

  try {
    updateSplash(splash, 'Checking for updates...')
    const updateResult = await checkForUpdate()

    if (updateResult.updateAvailable && updateResult.isForced) {
      // Force update: download and install
      updateSplash(splash, 'Downloading required update...', 0)

      autoUpdater.on('download-progress', (info) => {
        updateSplash(splash, `Downloading update... ${Math.round(info.percent)}%`, info.percent)
      })

      await downloadUpdate()
      updateSplash(splash, 'Installing update...')
      installUpdate()
      return // App will restart
    }

    if (updateResult.updateAvailable) {
      pendingUpdate = updateResult
    }
  } catch {
    // Update check failed — continue to app
  }

  updateSplash(splash, 'Loading...')

  // Register IPC handlers
  registerAppHandlers()
  registerSettingsHandlers()

  const mainWindow = createWindow()
  registerSystemHandlers(mainWindow)
  registerUpdaterHandlers(mainWindow)
  registerLanguageHandlers(mainWindow)

  // Close splash once main window is ready
  mainWindow.once('ready-to-show', () => {
    closeSplash(splash)

    // Send pending optional update status to renderer
    if (pendingUpdate) {
      mainWindow.webContents.send('updater:status', {
        status: 'available',
        version: pendingUpdate.version,
        isForced: false
      })
    }
  })

  // Register second-instance once — always show existing window
  app.on('second-instance', () => {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  })

  // Apply initial close behavior and re-apply when setting changes
  applyActionOnClose(mainWindow)
  ipcMain.on('action-on-close-changed', () => {
    applyActionOnClose(mainWindow)
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const win = createWindow()
      registerSystemHandlers(win)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  closeDatabase()
})

function applyActionOnClose(mainWindow: BrowserWindow): void {
  // Remove previous close handler
  if (closeHandler) {
    mainWindow.removeListener('close', closeHandler)
    closeHandler = null
  }

  const actionOnClose = settingsRepo.getSetting(SETTING_KEYS.ACTION_ON_CLOSE)

  if (actionOnClose === ACTIONS_ON_CLOSE.QUIT) {
    // Destroy tray when in quit mode
    if (tray) {
      tray.destroy()
      tray = null
    }

    closeHandler = () => {
      app.quit()
    }
    mainWindow.on('close', closeHandler)
    return
  }

  // Minimize to tray mode
  closeHandler = (event) => {
    if (!isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  }
  mainWindow.on('close', closeHandler)

  // Create tray only once
  if (!tray) {
    tray = new Tray(icon)
    tray.on('click', () => mainWindow.show())
  }

  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Show', click: () => mainWindow.show() },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        }
      }
    ])
  )
}
