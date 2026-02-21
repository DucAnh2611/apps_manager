import { useSyncExternalStore } from 'react'
import { api } from '@renderer/lib/api'

/** Module-level store that subscribes once and survives component unmounts */
function createStore<T>(subscribe: (cb: (data: T) => void) => () => void) {
  let current: T | undefined
  const listeners = new Set<() => void>()

  // Subscribe to IPC events at module load — never unsubscribed
  subscribe((data) => {
    current = data
    listeners.forEach((l) => l())
  })

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => current
  }
}

// Stores created once at module level — data persists across mounts
const cpuStore = createStore(api.onCpuStats)
const memoryStore = createStore(api.onMemoryStats)
const gpuStore = createStore(api.onGpuStats)
const diskStore = createStore(api.onDiskStats)
const networkStore = createStore(api.onNetworkStats)
const batteryStore = createStore(api.onBatteryStats)
const osStore = createStore(api.onOsStats)
const processStore = createStore(api.onProcessStats)
const runningAppsStore = createStore(api.onRunningApps)
const appUsageStore = createStore(api.onAppUsage)

function useStore<T>(store: {
  subscribe: (l: () => void) => () => void
  getSnapshot: () => T | undefined
}) {
  const data = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return { data, isLoading: data === undefined }
}

export function useCpuStats() {
  return useStore(cpuStore)
}
export function useMemoryStats() {
  return useStore(memoryStore)
}
export function useGpuStats() {
  return useStore(gpuStore)
}
export function useDiskStats() {
  return useStore(diskStore)
}
export function useNetworkStats() {
  return useStore(networkStore)
}
export function useBatteryStats() {
  return useStore(batteryStore)
}
export function useOsStats() {
  return useStore(osStore)
}
export function useProcessStats() {
  return useStore(processStore)
}
export function useRunningApps() {
  return useStore(runningAppsStore)
}
export function useAppUsage() {
  return useStore(appUsageStore)
}
