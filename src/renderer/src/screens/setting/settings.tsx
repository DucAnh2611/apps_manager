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
import { Button } from '@renderer/components/ui/button'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useResetAllSettings, useSettings } from '@renderer/hooks/use-settings'
import { useTheme } from '@renderer/providers/theme-provider'
import { SETTING_DEFAULTS, SETTING_KEYS } from '../../../../shared/constants/settings'
import SettingsAppearance from './apperance'
import SettingsBehavior from './behavior'
import SettingsLanguage from './language'
import SettingsStart from './start'
import SettingsUpdates from './updates'

export default function Settings() {
  const { isLoading, data: settings } = useSettings()
  const resetAll = useResetAllSettings()
  const { setTheme } = useTheme()
  const { t } = useI18n()

  const handleResetAll = () => {
    resetAll.mutate(undefined, {
      onSuccess: () => {
        setTheme(SETTING_DEFAULTS[SETTING_KEYS.THEME] as 'system')
      }
    })
  }

  if (isLoading) {
    return <div className="text-muted-foreground">{t('settings.loading')}</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col xl:grid xl:grid-cols-2 gap-4">
        <div className="h-fit flex-1 flex flex-col gap-4">
          <SettingsBehavior settings={settings} />
          <SettingsStart settings={settings} />
        </div>

        <div className="h-fit flex-1 flex flex-col gap-4">
          <SettingsAppearance />
          <SettingsLanguage />
          <SettingsUpdates />
        </div>
      </div>

      <div className="h-fit w-full flex justify-start flex-1">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
              {t('settings.resetAll')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('settings.resetAll.title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('settings.resetAll.description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                {t('settings.resetAll.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleResetAll} className="cursor-pointer">
                {t('settings.resetAll.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
