import { useI18n } from '@renderer/hooks/use-i18n'
import { useUpdateProgress, useUpdateStatus } from '@renderer/hooks/use-updater'
import { api } from '@renderer/lib/api'
import { Download, RefreshCw, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'

export default function UpdateBanner() {
  const { data: status } = useUpdateStatus()
  const { data: progress } = useUpdateProgress()
  const { t } = useI18n()
  const [dismissed, setDismissed] = useState(false)

  if (!status || dismissed) return null

  if (status.status === 'available') {
    return (
      <div className="flex items-center justify-between gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-2 text-sm">
        <span>{t('update.available', { version: status.version ?? '' })}</span>
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            className="cursor-pointer border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
            onClick={() => api.downloadUpdate()}
          >
            <Download className="h-3 w-3 mr-1" />
            {t('update.download')}
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className="cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  if (status.status === 'downloading') {
    const percent = progress?.percent ?? 0
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 text-sm">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
          <span>{t('update.downloading', { percent })}</span>
        </div>
        <div className="h-1 w-full bg-blue-500/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    )
  }

  if (status.status === 'downloaded') {
    return (
      <div className="flex items-center justify-between gap-3 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-2 text-sm">
        <span>{t('update.ready')}</span>
        <Button
          size="xs"
          variant="outline"
          className="cursor-pointer border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/10"
          onClick={() => api.installUpdate()}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          {t('update.restart')}
        </Button>
      </div>
    )
  }

  return null
}
