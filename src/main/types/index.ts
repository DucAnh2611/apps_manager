export interface AppRecord {
  id: number
  name: string
  path: string
  args: string | null
  icon: string | null
  color: string | null
  categories: string[]
  favorite: number
  launchCount: number
  lastLaunchedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AppInput {
  name: string
  path: string
  args?: string | null
  icon?: string | null
  color?: string | null
  categories?: string[]
}

export interface AppUpdate {
  id: number
  name?: string
  path?: string
  args?: string | null
  icon?: string | null
  color?: string | null
  categories?: string[]
  favorite?: number
}

export interface CpuCore {
  load: number
}

export interface GpuInfo {
  model: string
  vendor: string
  vram: number
  temperature: number | null
}

export interface NetworkInterface {
  name: string
  ip4: string
  ip6: string
  mac: string
  speed: number | null
  type: string
  rxBytes: number
  txBytes: number
}

export interface DiskPartition {
  mount: string
  type: string
  total: number
  used: number
  free: number
  usagePercent: number
}

export interface TopProcess {
  pid: number
  name: string
  cpu: number
  memory: number
}

export interface CpuStats {
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

export interface MemoryStats {
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

export interface GpuStats {
  gpus: GpuInfo[]
}

export interface DiskStats {
  partitions: DiskPartition[]
}

export interface NetworkStats {
  interfaces: NetworkInterface[]
}

export interface BatteryStats {
  hasBattery: boolean
  percent: number
  isCharging: boolean
  timeRemaining: number | null
  cycleCount: number | null
}

export interface OsStats {
  platform: string
  distro: string
  release: string
  arch: string
  hostname: string
  kernel: string
  uptime: number
}

export interface ProcessStats {
  total: number
  running: number
  sleeping: number
  top: TopProcess[]
}

export interface AppUsage {
  cpu: number
  memory: number
  memoryMB: number
  heapUsed: number
  heapTotal: number
  external: number
  pid: number
  uptime: number
}

export interface RunningAppInfo {
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
