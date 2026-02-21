import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@renderer/components/ui/alert-dialog'
import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { ComboboxSimple } from '@renderer/components/ui/combobox'
import { Separator } from '@renderer/components/ui/separator'
import { useI18n } from '@renderer/hooks/use-i18n'
import {
  useAvailableLanguages,
  useDownloadLanguage,
  useInstalledLanguages,
  useRefreshAvailableLanguages,
  useUninstallLanguage
} from '@renderer/hooks/use-languages'
import { Download, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { SectionField } from './components/section-field'

export default function SettingsLanguage() {
  const { t, locale, setLocale, reloadTranslations } = useI18n()
  const { data: available, isLoading: loadingAvailable } = useAvailableLanguages()
  const { data: installed } = useInstalledLanguages()
  const downloadLang = useDownloadLanguage()
  const uninstallLang = useUninstallLanguage()
  const refreshLangs = useRefreshAvailableLanguages()

  // Build language items: English (built-in) + available from remote
  const languageItems = [
    { label: 'English', value: 'en' },
    ...(available ?? []).map((lang) => ({
      label: `${lang.nativeName} (${lang.name})`,
      value: lang.code
    }))
  ]

  const handleLanguageChange = async (value: unknown) => {
    const code = value as string
    if (!code) return

    // If not English and not installed, download first
    if (code !== 'en' && !installed?.[code]) {
      const result = await downloadLang.mutateAsync(code)
      if (!(result as { success: boolean }).success) return
    }

    await setLocale(code)
  }

  const handleUpdateLanguage = async (code: string) => {
    const result = await downloadLang.mutateAsync(code)
    if (!(result as { success: boolean }).success) return

    // If this is the active language, reload translations so the UI refreshes
    if (code === locale) {
      await reloadTranslations()
    }
  }

  const handleUninstallLanguage = async (code: string) => {
    // If uninstalling the active language, switch to English first
    if (code === locale) {
      await setLocale('en')
    }
    uninstallLang.mutate(code)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{t('settings.language')}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            disabled={refreshLangs.isPending}
            onClick={() => refreshLangs.mutate()}
          >
            <RefreshCw className={`h-4 w-4 ${refreshLangs.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-4">
        <SectionField
          label={t('settings.language.select')}
          description={t('settings.language.select.description')}
        >
          <div className="flex items-center gap-2">
            <ComboboxSimple
              items={languageItems}
              value={locale}
              onValueChange={handleLanguageChange}
            />
            {locale === 'en' && (
              <Badge variant="secondary" className="text-[10px]">
                {t('settings.language.builtIn')}
              </Badge>
            )}
          </div>
        </SectionField>

        {loadingAvailable && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t('settings.language.loadingLanguages')}
          </p>
        )}

        {available && available.length > 0 && (
          <div className="space-y-2">
            {available.map((lang) => {
              const isInstalled = !!installed?.[lang.code]
              const hasUpdate = isInstalled && installed[lang.code] !== lang.version
              const isDownloading = downloadLang.isPending && downloadLang.variables === lang.code
              const isUninstalling =
                uninstallLang.isPending && uninstallLang.variables === lang.code
              const isCurrent = locale === lang.code

              return (
                <div key={lang.code} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    <span>
                      {lang.nativeName} ({lang.name})
                    </span>
                    {isInstalled && (
                      <Badge variant="secondary" className="text-[10px]">
                        v{installed[lang.code]}
                      </Badge>
                    )}
                    {hasUpdate && (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-orange-500/30 text-orange-600 dark:text-orange-400"
                      >
                        {t('settings.language.updateAvailable')}
                      </Badge>
                    )}
                    {isCurrent && <Badge className="text-[10px]">Active</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    {hasUpdate && (
                      <Button
                        size="xs"
                        variant="outline"
                        className="cursor-pointer border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10"
                        disabled={isDownloading}
                        onClick={() => handleUpdateLanguage(lang.code)}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="h-3 w-3 mr-1" />
                        )}
                        {isDownloading
                          ? t('settings.language.downloading')
                          : t('settings.language.update')}
                      </Button>
                    )}
                    {!isInstalled && (
                      <Button
                        size="xs"
                        variant="outline"
                        className="cursor-pointer"
                        disabled={isDownloading}
                        onClick={() => downloadLang.mutate(lang.code)}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Download className="h-3 w-3 mr-1" />
                        )}
                        {isDownloading
                          ? t('settings.language.downloading')
                          : t('settings.language.download')}
                      </Button>
                    )}
                    {isInstalled && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="xs"
                            variant="ghost"
                            className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isUninstalling}
                          >
                            {isUninstalling ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('settings.language.uninstallTitle', { name: lang.nativeName })}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('settings.language.uninstallDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">
                              {t('settings.language.uninstallCancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="cursor-pointer"
                              onClick={() => handleUninstallLanguage(lang.code)}
                            >
                              {t('settings.language.uninstallConfirm')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
