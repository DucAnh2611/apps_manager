import StringNode from '@renderer/components/string-node'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Separator } from '@renderer/components/ui/separator'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useRefreshAvailableLanguages } from '@renderer/hooks/use-languages'
import { api } from '@renderer/lib/api'
import { Loader2, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SectionField } from './components/section-field'

function useAppVersion(): string {
  const [version, setVersion] = useState('')
  useEffect(() => {
    api.getAppVersion().then(setVersion)
  }, [])
  return version
}

type CheckStatus = 'idle' | 'checking' | 'up-to-date' | 'available'

export default function SettingsUpdates() {
  const { t } = useI18n()
  const [appStatus, setAppStatus] = useState<CheckStatus>('idle')
  const [langStatus, setLangStatus] = useState<CheckStatus>('idle')
  const refreshLangs = useRefreshAvailableLanguages()
  const appTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const langTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const appVersion = useAppVersion()

  const handleCheckApp = useCallback(async () => {
    setAppStatus('checking')
    try {
      const result = await api.checkForUpdate()
      setAppStatus(result.updateAvailable ? 'available' : 'up-to-date')
    } catch {
      setAppStatus('up-to-date')
    }
    clearTimeout(appTimerRef.current)
    appTimerRef.current = setTimeout(() => setAppStatus('idle'), 5000)
  }, [])

  const handleCheckLanguages = useCallback(async () => {
    setLangStatus('checking')
    try {
      await refreshLangs.mutateAsync()
      setLangStatus('up-to-date')
    } catch {
      setLangStatus('up-to-date')
    }
    clearTimeout(langTimerRef.current)
    langTimerRef.current = setTimeout(() => setLangStatus('idle'), 5000)
  }, [refreshLangs])

  const getStatusText = (status: CheckStatus) => {
    switch (status) {
      case 'checking':
        return t('settings.updates.checking')
      case 'up-to-date':
        return (
          <StringNode
            text={
              <span>
                {t('settings.updates.upToDate')}
                <span className="text-xs text-muted-foreground ml-2 italic">
                  {appVersion ? `v${appVersion}` : ''}
                </span>{' '}
              </span>
            }
          />
        )
      case 'available':
        return t('update.available', { version: '' }).trim()
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('settings.updates')}</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-4">
        <SectionField
          label={t('settings.updates.checkApp')}
          description={t('settings.updates.checkApp.description')}
        >
          <div className="flex items-center gap-2">
            {appStatus !== 'idle' && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {appStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                {getStatusText(appStatus)}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              disabled={appStatus === 'checking'}
              onClick={handleCheckApp}
            >
              {appStatus === 'checking' ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              {t('settings.updates.check')}
            </Button>
          </div>
        </SectionField>

        <SectionField
          label={t('settings.updates.checkLanguages')}
          description={t('settings.updates.checkLanguages.description')}
        >
          <div className="flex items-center gap-2">
            {langStatus !== 'idle' && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {langStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                {getStatusText(langStatus)}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              disabled={langStatus === 'checking'}
              onClick={handleCheckLanguages}
            >
              {langStatus === 'checking' ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              {t('settings.updates.check')}
            </Button>
          </div>
        </SectionField>
      </CardContent>
    </Card>
  )
}
