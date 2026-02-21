import { ElectronAPI } from '@electron-toolkit/preload'

interface AppRecord {
  id: number
  name: string
  path: string
  icon: string | null
  color: string | null
  args: string | null
  categories: string[]
  favorite: number
  launchCount: number
  lastLaunchedAt: string | null
  createdAt: string
  updatedAt: string
}

interface AppInput {
  name: string
  path: string
  icon?: string | null
  color?: string | null
  categories?: string[]
}

interface AppUpdate {
  id: number
  name?: string
  path?: string
  icon?: string | null
  color?: string | null
  categories?: string[]
  favorite?: number
}

interface CpuCore {
  load: number
}

interface GpuInfo {
  model: string
  vendor: string
  vram: number
  temperature: number | null
}

interface NetworkInterface {
  name: string
  ip4: string
  ip6: string
  mac: string
  speed: number | null
  type: string
  rxBytes: number
  txBytes: number
}

interface DiskPartition {
  mount: string
  type: string
  total: number
  used: number
  free: number
  usagePercent: number
}

interface TopProcess {
  pid: number
  name: string
  cpu: number
  memory: number
}

interface CpuStats {
  manufacturer: string
  brand: string
  speed: number
  speedMin: number
  speedMax: number
  cores: number
  physicalCores: number
  processors: number
  usage: number
  coresLoad: CpuCore[]
  temperature: number | null
  temperatureMax: number | null
}

interface MemoryStats {
  total: number
  used: number
  free: number
  active: number
  available: number
  usagePercent: number
  swapTotal: number
  swapUsed: number
  swapFree: number
}

interface GpuStats {
  gpus: GpuInfo[]
}

interface DiskStats {
  partitions: DiskPartition[]
}

interface NetworkStats {
  interfaces: NetworkInterface[]
}

interface BatteryStats {
  hasBattery: boolean
  percent: number
  isCharging: boolean
  timeRemaining: number | null
  cycleCount: number | null
}

interface OsStats {
  platform: string
  distro: string
  release: string
  arch: string
  hostname: string
  kernel: string
  uptime: number
}

interface ProcessStats {
  total: number
  running: number
  sleeping: number
  top: TopProcess[]
}

interface AppUsage {
  cpu: number
  memory: number
  memoryMB: number
  heapUsed: number
  heapTotal: number
  external: number
  pid: number
  uptime: number
}

interface RunningAppInfo {
  id: number
  name: string
  icon: string | null
  color: string | null
  pid: number
  cpu: number
  memoryMB: number
  memoryPercent: number
  started: string
}

interface UpdateCheckResult {
  updateAvailable: boolean
  isForced: boolean
  version: string | null
}

interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  version?: string
  isForced?: boolean
  error?: string
}

interface UpdateProgress {
  percent: number
  bytesPerSecond: number
  transferred: number
  total: number
}

interface LanguageMeta {
  code: string
  name: string
  nativeName: string
  version: string
}

interface LanguageProgress {
  code: string
  percent: number
}

interface AppsManagerAPI {
  getApps: () => Promise<AppRecord[]>
  addApp: (input: AppInput) => Promise<AppRecord>
  updateApp: (input: AppUpdate) => Promise<AppRecord>
  deleteApp: (id: number) => Promise<AppRecord>
  launchApp: (id: number) => Promise<{ success: boolean; error?: string }>
  browseForApp: () => Promise<string | null>
  browseForIcon: () => Promise<string | null>
  killProcess: (pid: number) => Promise<{ success: boolean; error?: string }>
  onCpuStats: (callback: (data: CpuStats) => void) => () => void
  onMemoryStats: (callback: (data: MemoryStats) => void) => () => void
  onGpuStats: (callback: (data: GpuStats) => void) => () => void
  onDiskStats: (callback: (data: DiskStats) => void) => () => void
  onNetworkStats: (callback: (data: NetworkStats) => void) => () => void
  onBatteryStats: (callback: (data: BatteryStats) => void) => () => void
  onOsStats: (callback: (data: OsStats) => void) => () => void
  onProcessStats: (callback: (data: ProcessStats) => void) => () => void
  onRunningApps: (callback: (data: RunningAppInfo[]) => void) => () => void
  onAppUsage: (callback: (data: AppUsage) => void) => () => void
  getSetting: (key: string) => Promise<string | undefined>
  setSetting: (key: string, value: string) => Promise<{ success: true }>
  getAllSettings: () => Promise<Record<string, string>>
  resetAllSettings: () => Promise<{ success: true }>

  // Window controls
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  isMaximized: () => Promise<boolean>
  onMaximizedChanged: (callback: (maximized: boolean) => void) => () => void

  // Updater
  checkForUpdate: () => Promise<UpdateCheckResult>
  downloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
  onUpdateStatus: (callback: (data: UpdateStatus) => void) => () => void
  onUpdateProgress: (callback: (data: UpdateProgress) => void) => () => void

  // Language
  getAvailableLanguages: () => Promise<LanguageMeta[]>
  getInstalledLanguages: () => Promise<Record<string, string>>
  downloadLanguage: (code: string) => Promise<{ success: boolean; error?: string }>
  getTranslations: (code: string) => Promise<Record<string, string>>
  onLanguageProgress: (callback: (data: LanguageProgress) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppsManagerAPI
  }
}
