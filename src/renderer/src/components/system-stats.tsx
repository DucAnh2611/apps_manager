import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Separator } from '@renderer/components/ui/separator'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { useI18n } from '@renderer/hooks/use-i18n'
import {
  useAppUsage,
  useBatteryStats,
  useCpuStats,
  useDiskStats,
  useGpuStats,
  useMemoryStats,
  useNetworkStats,
  useOsStats,
  useProcessStats,
  useRunningApps
} from '@renderer/hooks/use-system-stats'
import { api } from '@renderer/lib/api'
import {
  Activity,
  Battery,
  BatteryCharging,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Network,
  Package,
  Square,
  Thermometer
} from 'lucide-react'
import { useState } from 'react'

/** Safe number: returns fallback for NaN/undefined/null/Infinity */
function n(val: unknown, fallback: number = 0): number {
  if (val === null || val === undefined) return fallback
  const num = Number(val)
  return Number.isFinite(num) ? num : fallback
}

/** Check if a value is a valid displayable number */
function isNum(val: unknown): val is number {
  return val != null && Number.isFinite(Number(val))
}

function formatBytes(bytes: unknown): string {
  const b = n(bytes)
  if (b <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(b) / Math.log(k))
  return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i] ?? 'TB'}`
}

function formatUptime(seconds: unknown): string {
  const sec = n(seconds)
  if (sec <= 0) return '0s'
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const parts: string[] = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (parts.length === 0) parts.push(`${s}s`)
  return parts.join(' ')
}

function formatSpeed(mbps: unknown): string {
  const v = n(mbps)
  if (v <= 0) return '—'
  if (v >= 1000) return `${(v / 1000).toFixed(1)} Gbps`
  return `${v} Mbps`
}

/** Safe percent for bars — clamp 0-100 */
function pct(val: unknown): number {
  return Math.max(0, Math.min(100, n(val)))
}

function UsageBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct(percent)}%` }}
      />
    </div>
  )
}

function MiniBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct(percent)}%` }}
      />
    </div>
  )
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{children}</p>
}

function StatValue({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold">{children}</p>
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-3/4" />
      ))}
    </div>
  )
}

/* ── Per-section components ── */

function OsInfoHeader() {
  const { data: os } = useOsStats()
  if (!os) return null

  return (
    <p className="text-xs text-muted-foreground">
      {os.distro || 'Unknown OS'}
      {os.release ? ` ${os.release}` : ''}
      {os.arch ? ` (${os.arch})` : ''}
      {os.kernel ? ` · Kernel ${os.kernel}` : ''}
      {n(os.uptime) > 0 ? ` · Uptime ${formatUptime(os.uptime)}` : ''}
    </p>
  )
}

function CpuSection() {
  const { data: cpu, isLoading } = useCpuStats()
  const { t } = useI18n()

  if (isLoading || !cpu) return <SectionSkeleton rows={4} />

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Cpu className="h-3 w-3" />
          {t('stats.cpu')}
        </span>
        <span className="font-medium">{n(cpu.usage)}%</span>
      </div>
      <UsageBar percent={n(cpu.usage)} color="bg-blue-500" />
      <p className="text-[10px] text-muted-foreground">
        {cpu.brand || 'Unknown CPU'}
        {n(cpu.physicalCores) > 0 && ` · ${n(cpu.physicalCores)}C/${n(cpu.cores)}T`}
        {n(cpu.speed) > 0 && ` · ${n(cpu.speed)} GHz`}
        {n(cpu.speedMax) > n(cpu.speed) && ` (up to ${n(cpu.speedMax)} GHz)`}
      </p>

      {/* Per-core loads */}
      {cpu.coresLoad && cpu.coresLoad.length > 0 && (
        <div className="grid grid-cols-4 gap-x-3 gap-y-1 pt-1">
          {cpu.coresLoad.map((core, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>C{i}</span>
                <span>{Math.round(n(core.load))}%</span>
              </div>
              <MiniBar percent={n(core.load)} color="bg-blue-400" />
            </div>
          ))}
        </div>
      )}

      {/* CPU Temperature */}
      {isNum(cpu.temperature) && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-0.5">
          <Thermometer className="h-3 w-3" />
          {n(cpu.temperature)}°C
          {isNum(cpu.temperatureMax) &&
            cpu.temperatureMax !== cpu.temperature &&
            ` (max ${n(cpu.temperatureMax)}°C)`}
        </div>
      )}
    </div>
  )
}

function MemorySection() {
  const { data: memory, isLoading } = useMemoryStats()
  const { t } = useI18n()

  if (isLoading || !memory) return <SectionSkeleton rows={4} />

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MemoryStick className="h-3 w-3" />
          {t('stats.memory')}
        </span>
        <span className="font-medium">{n(memory.usagePercent)}%</span>
      </div>
      <UsageBar percent={n(memory.usagePercent)} color="bg-green-500" />
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div>
          <StatLabel>{t('stats.label.used')}</StatLabel>
          <StatValue>{formatBytes(memory.used)}</StatValue>
        </div>
        <div>
          <StatLabel>{t('stats.label.available')}</StatLabel>
          <StatValue>{formatBytes(memory.available)}</StatValue>
        </div>
        <div>
          <StatLabel>{t('stats.label.total')}</StatLabel>
          <StatValue>{formatBytes(memory.total)}</StatValue>
        </div>
      </div>

      {/* Swap */}
      {n(memory.swapTotal) > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{t('stats.label.swap')}</span>
            <span>
              {formatBytes(memory.swapUsed)} / {formatBytes(memory.swapTotal)}
            </span>
          </div>
          <MiniBar
            percent={(n(memory.swapUsed) / n(memory.swapTotal, 1)) * 100}
            color="bg-green-400"
          />
        </div>
      )}
    </div>
  )
}

function GpuSection() {
  const { data: gpu, isLoading } = useGpuStats()
  const { t } = useI18n()

  if (isLoading) return <SectionSkeleton rows={2} />
  if (!gpu || gpu.gpus.length === 0) return null

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Monitor className="h-3 w-3" />
          {t('stats.gpu')}
        </span>
        {gpu.gpus.map((g, i) => (
          <div key={i} className="space-y-0.5">
            <p className="text-xs font-medium">{g.model || 'Unknown GPU'}</p>
            <p className="text-[10px] text-muted-foreground">
              {g.vendor || 'Unknown'}
              {n(g.vram) > 0 && ` · ${n(g.vram)} MB VRAM`}
              {isNum(g.temperature) && ` · ${n(g.temperature)}°C`}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

function DiskSection() {
  const { data: disks, isLoading } = useDiskStats()
  const { t } = useI18n()

  if (isLoading) return <SectionSkeleton rows={3} />
  if (!disks || disks.partitions.length === 0) return null

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <HardDrive className="h-3 w-3" />
          {t('stats.disks')}
        </span>
        {disks.partitions.map((disk, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium truncate max-w-[60%]" title={disk.mount || ''}>
                {disk.mount || 'Unknown'}
              </span>
              <span className="text-muted-foreground">{n(disk.usagePercent)}%</span>
            </div>
            <UsageBar percent={n(disk.usagePercent)} color="bg-orange-500" />
            <p className="text-[10px] text-muted-foreground">
              {formatBytes(disk.used)} / {formatBytes(disk.total)}
              {disk.type ? ` · ${disk.type}` : ''}
              {n(disk.free) > 0 && ` · ${formatBytes(disk.free)} ${t('stats.label.free')}`}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

function NetworkSection() {
  const { data: network, isLoading } = useNetworkStats()
  const { t } = useI18n()

  if (isLoading) return <SectionSkeleton rows={3} />
  if (!network || network.interfaces.length === 0) return null

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Network className="h-3 w-3" />
          {t('stats.network')}
        </span>
        {network.interfaces.map((net, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{net.name || 'Unknown'}</span>
              <span className="text-muted-foreground">
                {net.type || 'unknown'} · {formatSpeed(net.speed)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {net.ip4 ? `IPv4: ${net.ip4}` : ''}
              {net.mac ? `${net.ip4 ? ' · ' : ''}MAC: ${net.mac}` : ''}
            </p>
            <p className="text-[10px] text-muted-foreground">
              ↓ {formatBytes(net.rxBytes)} / ↑ {formatBytes(net.txBytes)}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

function BatterySection() {
  const { data: battery, isLoading } = useBatteryStats()
  const { t } = useI18n()

  if (isLoading) return null
  if (!battery || !battery.hasBattery) return null

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {battery.isCharging ? (
              <BatteryCharging className="h-3 w-3" />
            ) : (
              <Battery className="h-3 w-3" />
            )}
            {t('stats.battery')}
          </span>
          <span className="font-medium">
            {n(battery.percent)}%{battery.isCharging && ` (${t('stats.battery.charging')})`}
          </span>
        </div>
        <UsageBar percent={n(battery.percent)} color="bg-yellow-500" />
        <p className="text-[10px] text-muted-foreground">
          {isNum(battery.timeRemaining) &&
            t('stats.battery.remaining', { minutes: Math.round(n(battery.timeRemaining)) })}
          {isNum(battery.cycleCount) &&
            n(battery.cycleCount) > 0 &&
            `${isNum(battery.timeRemaining) ? ' · ' : ''}${t('stats.battery.cycles', { count: n(battery.cycleCount) })}`}
        </p>
      </div>
    </>
  )
}

function ProcessSection() {
  const { data: processes, isLoading } = useProcessStats()
  const { t } = useI18n()

  if (isLoading) return <SectionSkeleton rows={3} />
  if (!processes || !processes.top || processes.top.length === 0) return null

  return (
    <>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Activity className="h-3 w-3" />
            {t('stats.processes')}
          </span>
          <span className="text-muted-foreground">
            {t('stats.processes.total', { total: n(processes.total) })} ·{' '}
            {t('stats.processes.running', { running: n(processes.running) })}
          </span>
        </div>
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-2 py-1 font-medium text-muted-foreground">
                  {t('stats.processes.process')}
                </th>
                <th className="text-right px-2 py-1 font-medium text-muted-foreground w-14">PID</th>
                <th className="text-right px-2 py-1 font-medium text-muted-foreground w-14">
                  CPU%
                </th>
                <th className="text-right px-2 py-1 font-medium text-muted-foreground w-14">
                  MEM%
                </th>
              </tr>
            </thead>
            <tbody>
              {processes.top.map((proc) => (
                <tr key={n(proc.pid)} className="border-b last:border-0">
                  <td className="px-2 py-1 truncate max-w-[120px]" title={proc.name || ''}>
                    {proc.name || 'unknown'}
                  </td>
                  <td className="text-right px-2 py-1 text-muted-foreground">{n(proc.pid)}</td>
                  <td className="text-right px-2 py-1">{n(proc.cpu)}</td>
                  <td className="text-right px-2 py-1">{n(proc.memory)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function RunningAppsSection() {
  const { data: runningApps, isLoading } = useRunningApps()
  const { t } = useI18n()
  const [killTarget, setKillTarget] = useState<{ pid: number; name: string } | null>(null)

  const handleKill = async () => {
    if (!killTarget) return
    await api.killProcess(killTarget.pid)
    setKillTarget(null)
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Package className="h-4 w-4" />
        {t('stats.runningApps')}
      </h4>
      {isLoading ? (
        <RunningAppsLoadingSkeleton />
      ) : !runningApps || runningApps.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('stats.runningApps.empty')}</p>
      ) : (
        <div className="space-y-2">
          {runningApps.map((app) => {
            const accentColor = app.color || undefined
            return (
              <Card
                key={app.id}
                className="overflow-hidden py-0"
                style={
                  accentColor
                    ? {
                        borderColor: accentColor,
                        backgroundColor: `${accentColor}50`
                      }
                    : undefined
                }
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg p-2"
                      style={{
                        backgroundColor: accentColor ? `${accentColor}20` : 'var(--color-muted)',
                        color: accentColor || 'var(--color-muted-foreground)'
                      }}
                    >
                      {app.icon ? (
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Package className="h-6 w-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-sm truncate">{app.name}</h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 shrink-0 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setKillTarget({ pid: app.pid, name: app.name })}
                        >
                          <Square className="h-3 w-3 fill-current" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        CPU: {n(app.cpu)}% · Mem: {n(app.memoryMB)} MB ({n(app.memoryPercent)}%) ·
                        PID: {n(app.pid)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                          style={
                            accentColor
                              ? {
                                  backgroundColor: `${accentColor}20`,
                                  color: accentColor
                                }
                              : undefined
                          }
                        >
                          <span className="relative flex h-2 w-2 mr-1">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                          </span>
                          {t('stats.runningApps.running')}
                        </Badge>
                        {app.started && (
                          <span className="text-[10px] text-muted-foreground">
                            {t('stats.runningApps.since', {
                              time: new Date(app.started).toLocaleTimeString()
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!killTarget} onOpenChange={(open) => !open && setKillTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('kill.title', { name: killTarget?.name ?? '' })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('kill.description', { pid: killTarget?.pid ?? 0 })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">{t('kill.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleKill}
            >
              {t('kill.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AppUsageSection() {
  const { data: usage, isLoading } = useAppUsage()
  const { t } = useI18n()

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Activity className="h-4 w-4" />
        {t('stats.appUsage')}
      </h4>
      {isLoading || !usage ? (
        <UsageLoadingSkeleton />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-0.5">
            <StatLabel>{t('stats.label.cpu')}</StatLabel>
            <StatValue>{n(usage.cpu)}%</StatValue>
          </div>
          <div className="space-y-0.5">
            <StatLabel>{t('stats.label.memory')}</StatLabel>
            <StatValue>{n(usage.memoryMB)} MB</StatValue>
          </div>
          <div className="space-y-0.5">
            <StatLabel>{t('stats.label.pid')}</StatLabel>
            <StatValue>{n(usage.pid)}</StatValue>
          </div>
          <div className="space-y-0.5">
            <StatLabel>{t('stats.label.heapUsed')}</StatLabel>
            <StatValue>{formatBytes(usage.heapUsed)}</StatValue>
          </div>
          <div className="space-y-0.5">
            <StatLabel>{t('stats.label.heapTotal')}</StatLabel>
            <StatValue>{formatBytes(usage.heapTotal)}</StatValue>
          </div>
          <div className="space-y-0.5">
            <StatLabel>{t('stats.label.uptime')}</StatLabel>
            <StatValue>{formatUptime(usage.uptime)}</StatValue>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main component ── */

export default function SystemStats() {
  const { t } = useI18n()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          {t('stats.systemMonitor')}
        </CardTitle>
        <OsInfoHeader />
      </CardHeader>
      <CardContent className="space-y-4">
        <CpuSection />
        <Separator />
        <MemorySection />
        <GpuSection />
        <DiskSection />
        <NetworkSection />
        <BatterySection />
        <ProcessSection />
        <Separator />
        <RunningAppsSection />
        <Separator />
        <AppUsageSection />
      </CardContent>
    </Card>
  )
}

function RunningAppsLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="overflow-hidden py-0">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function UsageLoadingSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton className="h-2 w-10" />
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  )
}
