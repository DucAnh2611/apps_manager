import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

function onEvent<T>(channel: string, callback: (data: T) => void): () => void {
  const handler = (_event: unknown, data: T): void => callback(data)
  ipcRenderer.on(channel, handler)
  return () => {
    ipcRenderer.removeListener(channel, handler)
  }
}

const api = {
  // Apps
  getApps: () => ipcRenderer.invoke('apps:get-all'),
  addApp: (input: {
    name: string
    path: string
    args?: string | null
    icon?: string | null
    color?: string | null
    categories?: string[]
  }) => ipcRenderer.invoke('apps:add', input),
  updateApp: (input: {
    id: number
    name?: string
    path?: string
    args?: string | null
    icon?: string | null
    color?: string | null
    categories?: string[]
    favorite?: number
  }) => ipcRenderer.invoke('apps:update', input),
  deleteApp: (id: number) => ipcRenderer.invoke('apps:delete', id),
  launchApp: (id: number) => ipcRenderer.invoke('apps:launch', id),
  browseForApp: () => ipcRenderer.invoke('apps:browse'),
  browseForIcon: () => ipcRenderer.invoke('apps:browse-icon'),

  // System
  getAppVersion: () => ipcRenderer.invoke('system:get-app-version'),
  killProcess: (pid: number) => ipcRenderer.invoke('system:kill-process', pid),

  // System (push-based event listeners)
  onCpuStats: (cb: (data: unknown) => void) => onEvent('system:cpu', cb),
  onMemoryStats: (cb: (data: unknown) => void) => onEvent('system:memory', cb),
  onGpuStats: (cb: (data: unknown) => void) => onEvent('system:gpu', cb),
  onDiskStats: (cb: (data: unknown) => void) => onEvent('system:disks', cb),
  onNetworkStats: (cb: (data: unknown) => void) => onEvent('system:network', cb),
  onBatteryStats: (cb: (data: unknown) => void) => onEvent('system:battery', cb),
  onOsStats: (cb: (data: unknown) => void) => onEvent('system:os', cb),
  onProcessStats: (cb: (data: unknown) => void) => onEvent('system:processes', cb),
  onRunningApps: (cb: (data: unknown) => void) => onEvent('system:running-apps', cb),
  onAppUsage: (cb: (data: unknown) => void) => onEvent('system:app-usage', cb),

  // Settings
  getSetting: (key: string) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
  getAllSettings: () => ipcRenderer.invoke('settings:get-all'),
  resetAllSettings: () => ipcRenderer.invoke('settings:reset-all'),

  // Updater
  checkForUpdate: () => ipcRenderer.invoke('updater:check'),
  downloadUpdate: () => ipcRenderer.invoke('updater:download'),
  installUpdate: () => ipcRenderer.invoke('updater:install'),
  onUpdateStatus: (cb: (data: unknown) => void) => onEvent('updater:status', cb),
  onUpdateProgress: (cb: (data: unknown) => void) => onEvent('updater:download-progress', cb),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  onMaximizedChanged: (cb: (maximized: boolean) => void) => onEvent('window:maximized-changed', cb),

  // Language
  getAvailableLanguages: () => ipcRenderer.invoke('language:get-available'),
  getInstalledLanguages: () => ipcRenderer.invoke('language:get-installed'),
  downloadLanguage: (code: string) => ipcRenderer.invoke('language:download', code),
  getTranslations: (code: string) => ipcRenderer.invoke('language:get-translations', code),
  uninstallLanguage: (code: string) => ipcRenderer.invoke('language:uninstall', code),
  refreshAvailableLanguages: () => ipcRenderer.invoke('language:refresh'),
  onLanguageProgress: (cb: (data: unknown) => void) => onEvent('language:download-progress', cb)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
