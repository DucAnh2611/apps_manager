import { BrowserWindow, ipcMain } from 'electron'
import { SETTING_KEYS } from '../../shared/constants/settings'
import * as appRepo from '../database/repositories/app.repository'
import * as settingsRepo from '../database/repositories/settings.repository'
import {
  getAppUsage,
  getBatteryStats,
  getCpuStats,
  getDiskStats,
  getGpuStats,
  getMemoryStats,
  getNetworkStats,
  getOsStats,
  getProcessStats,
  getRunningApps
} from '../services/system-monitor.service'
import type {
  AppUsage,
  BatteryStats,
  CpuStats,
  DiskStats,
  GpuStats,
  MemoryStats,
  NetworkStats,
  OsStats,
  ProcessStats
} from '../types'

const FALLBACK_CPU: CpuStats = {
  manufacturer: '',
  brand: 'Unknown CPU',
  speed: 0,
  speedMin: 0,
  speedMax: 0,
  cores: 0,
  physicalCores: 0,
  processors: 1,
  usage: 0,
  coresLoad: [],
  temperature: null,
  temperatureMax: null
}

const FALLBACK_MEMORY: MemoryStats = {
  total: 0,
  used: 0,
  free: 0,
  active: 0,
  available: 0,
  usagePercent: 0,
  swapTotal: 0,
  swapUsed: 0,
  swapFree: 0
}

const FALLBACK_GPU: GpuStats = { gpus: [] }

const FALLBACK_DISKS: DiskStats = { partitions: [] }

const FALLBACK_NETWORK: NetworkStats = { interfaces: [] }

const FALLBACK_BATTERY: BatteryStats = {
  hasBattery: false,
  percent: 0,
  isCharging: false,
  timeRemaining: null,
  cycleCount: null
}

const FALLBACK_OS: OsStats = {
  platform: '',
  distro: 'Unknown OS',
  release: '',
  arch: '',
  hostname: '',
  kernel: '',
  uptime: 0
}

const FALLBACK_PROCESSES: ProcessStats = {
  total: 0,
  running: 0,
  sleeping: 0,
  top: []
}

const FALLBACK_USAGE: AppUsage = {
  cpu: 0,
  memory: 0,
  memoryMB: 0,
  heapUsed: 0,
  heapTotal: 0,
  external: 0,
  pid: process.pid,
  uptime: 0
}

export function registerSystemHandlers(mainWindow: BrowserWindow): void {
  // Window control handlers
  ipcMain.handle('window:minimize', () => mainWindow.minimize())
  ipcMain.handle('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  ipcMain.handle('window:close', () => mainWindow.close())
  ipcMain.handle('window:is-maximized', () => mainWindow.isMaximized())

  mainWindow.on('maximize', () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window:maximized-changed', true)
    }
  })
  mainWindow.on('unmaximize', () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window:maximized-changed', false)
    }
  })

  ipcMain.handle('system:kill-process', (_event, pid: number) => {
    try {
      process.kill(pid)
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  const timers: NodeJS.Timeout[] = []

  function send(channel: string, data: unknown): void {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data)
    }
  }

  /** Wraps an async push fn so overlapping calls are skipped */
  function guarded(fn: () => Promise<void>): () => void {
    let busy = false
    return () => {
      if (busy) return
      busy = true
      fn().finally(() => {
        busy = false
      })
    }
  }

  const pushCpu = guarded(async () => {
    try {
      send('system:cpu', await getCpuStats())
    } catch {
      send('system:cpu', FALLBACK_CPU)
    }
  })

  const pushMemory = guarded(async () => {
    try {
      send('system:memory', await getMemoryStats())
    } catch {
      send('system:memory', FALLBACK_MEMORY)
    }
  })

  const pushGpu = guarded(async () => {
    try {
      send('system:gpu', await getGpuStats())
    } catch {
      send('system:gpu', FALLBACK_GPU)
    }
  })

  const pushDisks = guarded(async () => {
    try {
      send('system:disks', await getDiskStats())
    } catch {
      send('system:disks', FALLBACK_DISKS)
    }
  })

  const pushNetwork = guarded(async () => {
    try {
      send('system:network', await getNetworkStats())
    } catch {
      send('system:network', FALLBACK_NETWORK)
    }
  })

  const pushBattery = guarded(async () => {
    try {
      send('system:battery', await getBatteryStats())
    } catch {
      send('system:battery', FALLBACK_BATTERY)
    }
  })

  const pushOs = guarded(async () => {
    try {
      send('system:os', await getOsStats())
    } catch {
      send('system:os', FALLBACK_OS)
    }
  })

  const pushProcesses = guarded(async () => {
    try {
      send('system:processes', await getProcessStats())
    } catch {
      send('system:processes', FALLBACK_PROCESSES)
    }
  })

  const pushRunningApps = guarded(async () => {
    try {
      const apps = appRepo.getAllApps()
      send('system:running-apps', await getRunningApps(apps))
    } catch {
      send('system:running-apps', [])
    }
  })

  const pushAppUsage = guarded(async () => {
    try {
      send('system:app-usage', await getAppUsage())
    } catch {
      send('system:app-usage', FALLBACK_USAGE)
    }
  })

  function readInterval(): number {
    return Math.max(
      1000,
      parseInt(settingsRepo.getSetting(SETTING_KEYS.MONITOR_INTERVAL) || '5000', 10) || 5000
    )
  }

  function pushAll(): void {
    pushCpu()
    pushMemory()
    pushGpu()
    pushDisks()
    pushNetwork()
    pushBattery()
    pushOs()
    pushProcesses()
    pushRunningApps()
    pushAppUsage()
  }

  let running = false

  function start(): void {
    stop()
    running = true

    // Push all sections immediately
    pushAll()

    // Set up recurring interval
    const interval = readInterval()
    timers.push(setInterval(pushAll, interval))
  }

  function stop(): void {
    running = false
    timers.forEach(clearInterval)
    timers.length = 0
  }

  mainWindow.on('show', start)
  mainWindow.on('hide', stop)

  // Restart with new interval when monitor_interval setting changes
  ipcMain.on('system:restart-monitor', () => {
    if (running) start()
  })
}
