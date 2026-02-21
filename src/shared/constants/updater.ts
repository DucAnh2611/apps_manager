export const UPDATER_CHANNELS = {
  CHECK: 'updater:check',
  DOWNLOAD: 'updater:download',
  INSTALL: 'updater:install',
  STATUS: 'updater:status',
  DOWNLOAD_PROGRESS: 'updater:download-progress'
} as const

export type UpdateStatusType =
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export interface UpdateStatus {
  status: UpdateStatusType
  version?: string
  isForced?: boolean
  error?: string
}

export interface UpdateProgress {
  percent: number
  bytesPerSecond: number
  transferred: number
  total: number
}
