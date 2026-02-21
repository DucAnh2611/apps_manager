import { totalmem } from 'os'
import { basename, parse as parsePath } from 'path'
import { Worker } from 'worker_threads'
import type {
  AppRecord,
  AppUsage,
  BatteryStats,
  CpuStats,
  DiskStats,
  GpuStats,
  MemoryStats,
  NetworkStats,
  OsStats,
  ProcessStats,
  RunningAppInfo
} from '../types'

/* ── Safe helpers (for transforming raw worker results) ── */

function safeNum(val: unknown, fallback: number = 0): number {
  if (val === null || val === undefined) return fallback
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

function safeRound(val: unknown, dp: number = 2): number {
  const n = safeNum(val)
  const factor = Math.pow(10, dp)
  return Math.round(n * factor) / factor
}

function safeStr(val: unknown, fallback: string = ''): string {
  if (val === null || val === undefined) return fallback
  return String(val)
}

/* ── Worker thread infrastructure ── */

const WORKER_CODE = `
const { parentPort, workerData } = require('worker_threads');
const { createRequire } = require('module');
const localRequire = createRequire(workerData.entryPoint);
const si = localRequire('systeminformation');

async function safe(promise, fallback) {
  try { return await promise; } catch { return fallback; }
}

parentPort.on('message', async (msg) => {
  try {
    let result;
    switch (msg.type) {
      case 'cpu': {
        const [cpu, load, temp] = await Promise.all([
          safe(si.cpu(), {}),
          safe(si.currentLoad(), { currentLoad: 0, cpus: [] }),
          safe(si.cpuTemperature(), { main: null, max: null })
        ]);
        result = { cpu, load, temp };
        break;
      }
      case 'memory':
        result = await safe(si.mem(), {});
        break;
      case 'gpu':
        result = await safe(si.graphics(), { controllers: [] });
        break;
      case 'disks':
        result = await safe(si.fsSize(), []);
        break;
      case 'network': {
        const [ifaces, stats] = await Promise.all([
          safe(si.networkInterfaces(), []),
          safe(si.networkStats(), [])
        ]);
        result = { ifaces, stats };
        break;
      }
      case 'battery':
        result = await safe(si.battery(), {
          hasBattery: false, percent: 0, isCharging: false,
          timeRemaining: -1, cycleCount: 0
        });
        break;
      case 'os': {
        let time;
        try { time = si.time(); } catch { time = { uptime: 0 }; }
        const info = await safe(si.osInfo(), {});
        result = { info, time };
        break;
      }
      case 'processes':
        result = await safe(si.processes(), {
          all: 0, running: 0, sleeping: 0, list: []
        });
        break;
      default:
        result = null;
    }
    parentPort.postMessage({ id: msg.id, result });
  } catch (err) {
    parentPort.postMessage({ id: msg.id, error: err ? err.message : 'Unknown error' });
  }
});
`

let worker: Worker | null = null
let nextId = 0
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()

function getWorker(): Worker {
  if (worker) return worker

  worker = new Worker(WORKER_CODE, { eval: true, workerData: { entryPoint: __filename } })

  worker.on('message', (msg: { id: number; result?: unknown; error?: string }) => {
    const p = pending.get(msg.id)
    if (p) {
      pending.delete(msg.id)
      if (msg.error) p.reject(new Error(msg.error))
      else p.resolve(msg.result)
    }
  })

  worker.on('error', (err) => {
    console.error('System info worker error:', err)
    for (const [id, p] of pending) {
      p.reject(err)
      pending.delete(id)
    }
    worker = null
  })

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error('System info worker exited with code:', code)
    }
    worker = null
  })

  return worker
}

function callWorker<T>(type: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject })
    getWorker().postMessage({ id, type })
  })
}

/* ── Per-section stats (via worker) ── */

export async function getCpuStats(): Promise<CpuStats> {
  const raw = await callWorker<{
    cpu: Record<string, unknown>
    load: Record<string, unknown>
    temp: Record<string, unknown>
  }>('cpu')
  const { cpu = {}, load = {}, temp = {} } = raw

  const coresLoad = (Array.isArray((load as any).cpus) ? (load as any).cpus : []).map((c: any) => ({
    load: safeRound(c.load)
  }))

  return {
    manufacturer: safeStr(cpu.manufacturer),
    brand: safeStr(cpu.brand, 'Unknown CPU'),
    speed: safeNum(cpu.speed),
    speedMin: safeNum(cpu.speedMin),
    speedMax: safeNum(cpu.speedMax),
    cores: safeNum(cpu.cores),
    physicalCores: safeNum(cpu.physicalCores),
    processors: safeNum(cpu.processors, 1),
    usage: safeRound((load as any).currentLoad),
    coresLoad,
    temperature:
      (temp as any).main != null && Number.isFinite((temp as any).main)
        ? safeRound((temp as any).main)
        : null,
    temperatureMax:
      (temp as any).max != null && Number.isFinite((temp as any).max)
        ? safeRound((temp as any).max)
        : null
  }
}

export async function getMemoryStats(): Promise<MemoryStats> {
  const mem = await callWorker<Record<string, unknown>>('memory')
  const memTotal = safeNum(mem.total, 1)

  return {
    total: safeNum(mem.total),
    used: safeNum(mem.used),
    free: safeNum(mem.free),
    active: safeNum(mem.active),
    available: safeNum(mem.available),
    usagePercent: safeRound((safeNum(mem.used) / memTotal) * 100),
    swapTotal: safeNum(mem.swaptotal),
    swapUsed: safeNum(mem.swapused),
    swapFree: safeNum(mem.swapfree)
  }
}

export async function getGpuStats(): Promise<GpuStats> {
  const graphics = await callWorker<any>('gpu')
  const controllers = graphics && Array.isArray(graphics.controllers) ? graphics.controllers : []

  const gpus = controllers.map((g: any) => ({
    model: safeStr(g.model, 'Unknown'),
    vendor: safeStr(g.vendor, 'Unknown'),
    vram: safeNum(g.vram),
    temperature:
      g.temperatureGpu != null && Number.isFinite(g.temperatureGpu)
        ? safeRound(g.temperatureGpu)
        : null
  }))

  return { gpus }
}

export async function getDiskStats(): Promise<DiskStats> {
  const disks = await callWorker<any>('disks')
  const diskArr = Array.isArray(disks) ? disks : []

  const partitions = diskArr.map((d: any) => ({
    mount: safeStr(d.mount, '/'),
    type: safeStr(d.type, 'unknown'),
    total: safeNum(d.size),
    used: safeNum(d.used),
    free: safeNum(d.available),
    usagePercent: safeRound(d.use)
  }))

  return { partitions }
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const raw = await callWorker<{ ifaces: any; stats: any }>('network')
  const netInterfaces = Array.isArray(raw.ifaces) ? raw.ifaces : []
  const netStats = Array.isArray(raw.stats) ? raw.stats : []

  const interfaces = netInterfaces
    .filter((iface: any) => !iface.internal)
    .map((iface: any) => {
      const stat = netStats.find((s: any) => s.iface === iface.iface)
      return {
        name: safeStr(iface.iface, 'Unknown'),
        ip4: safeStr(iface.ip4),
        ip6: safeStr(iface.ip6),
        mac: safeStr(iface.mac),
        speed:
          iface.speed != null && Number.isFinite(Number(iface.speed)) ? safeNum(iface.speed) : null,
        type: safeStr(iface.type, 'unknown'),
        rxBytes: safeNum(stat?.rx_bytes),
        txBytes: safeNum(stat?.tx_bytes)
      }
    })

  return { interfaces }
}

export async function getBatteryStats(): Promise<BatteryStats> {
  const battery = await callWorker<Record<string, unknown>>('battery')

  return {
    hasBattery: Boolean(battery.hasBattery),
    percent: safeNum(battery.percent),
    isCharging: Boolean(battery.isCharging),
    timeRemaining:
      battery.timeRemaining != null &&
      battery.timeRemaining !== -1 &&
      Number.isFinite(battery.timeRemaining as number)
        ? safeNum(battery.timeRemaining)
        : null,
    cycleCount:
      battery.cycleCount != null &&
      (battery.cycleCount as number) > 0 &&
      Number.isFinite(battery.cycleCount as number)
        ? safeNum(battery.cycleCount)
        : null
  }
}

export async function getOsStats(): Promise<OsStats> {
  const raw = await callWorker<{ info: Record<string, unknown>; time: Record<string, unknown> }>(
    'os'
  )
  const { info = {}, time = {} } = raw

  return {
    platform: safeStr(info.platform),
    distro: safeStr(info.distro, 'Unknown OS'),
    release: safeStr(info.release),
    arch: safeStr(info.arch),
    hostname: safeStr(info.hostname),
    kernel: safeStr(info.kernel),
    uptime: safeNum(time.uptime)
  }
}

export async function getProcessStats(): Promise<ProcessStats> {
  const processes = await callWorker<any>('processes')
  const procList = processes && Array.isArray(processes.list) ? processes.list : []

  const topProcesses = procList
    .filter((p: any) => Number.isFinite(p.cpu))
    .sort((a: any, b: any) => safeNum(b.cpu) - safeNum(a.cpu))
    .slice(0, 8)
    .map((p: any) => ({
      pid: safeNum(p.pid),
      name: safeStr(p.name, 'unknown'),
      cpu: safeRound(p.cpu),
      memory: safeRound(p.mem)
    }))

  return {
    total: safeNum(processes.all),
    running: safeNum(processes.running),
    sleeping: safeNum(processes.sleeping),
    top: topProcesses
  }
}

/* ── Running apps (also uses worker for si.processes()) ── */

export async function getRunningApps(apps: AppRecord[]): Promise<RunningAppInfo[]> {
  if (!apps.length) return []

  const processes = await callWorker<any>('processes')
  const procList = processes && Array.isArray(processes.list) ? processes.list : []
  if (!procList.length) return []

  const totalMem = totalmem() || 1
  const results: RunningAppInfo[] = []
  const platform = process.platform

  for (const app of apps) {
    const normalizedPath = app.path.replace(/\\/g, '/').toLowerCase()
    const exeName = basename(normalizedPath)
    const exeNoExt = parsePath(normalizedPath).name

    const macBundleName =
      platform === 'darwin' && exeName.endsWith('.app') ? exeName.slice(0, -4) : null

    const matching = procList.filter((p: any) => {
      const pName = safeStr(p.name).toLowerCase()
      const pCommand = safeStr(p.command).replace(/\\/g, '/').toLowerCase()
      const pPath = safeStr(p.path).replace(/\\/g, '/').toLowerCase()

      return (
        pName === exeName ||
        pName === exeNoExt ||
        (macBundleName !== null && (pName === macBundleName || pName.startsWith(macBundleName))) ||
        pCommand.includes(exeName) ||
        pCommand.includes(normalizedPath) ||
        (macBundleName !== null && pCommand.includes(macBundleName)) ||
        (pPath !== '' && (pPath.includes(normalizedPath) || normalizedPath.includes(pPath)))
      )
    })

    if (matching.length === 0) continue

    let totalCpu = 0
    let totalMemBytes = 0
    let earliestStarted = ''
    let mainPid = 0
    let maxCpu = -1

    for (const proc of matching) {
      const cpu = safeNum(proc.cpu)
      totalCpu += cpu
      totalMemBytes += safeNum(proc.memRss) * 1024
      const started = safeStr(proc.started)
      if (started && (!earliestStarted || started < earliestStarted)) {
        earliestStarted = started
      }
      if (cpu > maxCpu) {
        maxCpu = cpu
        mainPid = safeNum(proc.pid)
      }
    }

    results.push({
      id: app.id,
      name: app.name,
      icon: app.icon,
      color: app.color,
      pid: mainPid,
      cpu: safeRound(totalCpu),
      memoryMB: Math.round(totalMemBytes / 1024 / 1024),
      memoryPercent: safeRound((totalMemBytes / totalMem) * 100),
      started: earliestStarted
    })
  }

  return results
}

/* ── App usage (main process only — lightweight, no worker needed) ── */

export async function getAppUsage(): Promise<AppUsage> {
  const memUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()
  const uptimeSeconds = process.uptime()

  const totalCpuTime = (safeNum(cpuUsage.user) + safeNum(cpuUsage.system)) / 1_000_000
  const cpuPercent = uptimeSeconds > 0 ? safeRound((totalCpuTime / uptimeSeconds) * 100) : 0
  const totalMem = totalmem() || 1

  return {
    cpu: cpuPercent,
    memory: safeRound((safeNum(memUsage.rss) / totalMem) * 100),
    memoryMB: Math.round(safeNum(memUsage.rss) / 1024 / 1024),
    heapUsed: safeNum(memUsage.heapUsed),
    heapTotal: safeNum(memUsage.heapTotal),
    external: safeNum(memUsage.external),
    pid: process.pid,
    uptime: Math.round(safeNum(uptimeSeconds))
  }
}
