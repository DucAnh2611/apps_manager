import { useSyncExternalStore } from 'react'
import { api } from '@renderer/lib/api'

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

function createStore<T>(subscribe: (cb: (data: T) => void) => () => void) {
  let current: T | undefined
  const listeners = new Set<() => void>()

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

const statusStore = createStore<UpdateStatus>(api.onUpdateStatus)
const progressStore = createStore<UpdateProgress>(api.onUpdateProgress)

function useStore<T>(store: {
  subscribe: (l: () => void) => () => void
  getSnapshot: () => T | undefined
}) {
  const data = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return { data, isLoading: data === undefined }
}

export function useUpdateStatus() {
  return useStore(statusStore)
}

export function useUpdateProgress() {
  return useStore(progressStore)
}
