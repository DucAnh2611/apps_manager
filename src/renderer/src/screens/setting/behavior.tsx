import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { ComboboxSimple } from '@renderer/components/ui/combobox'
import { Input } from '@renderer/components/ui/input'
import { Separator } from '@renderer/components/ui/separator'
import { Switch } from '@renderer/components/ui/switch'
import useExtractSetting from '@renderer/hooks/use-extract-setting'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useSetSetting } from '@renderer/hooks/use-settings'
import { useState } from 'react'
import {
  monitorIntervalOptions,
  NAVIGATION_ITEMS_ALIGNMENT,
  NAVIGATION_POSITIONS,
  NAVIGATION_STYLES,
  navigationItemsAlignmentOptions,
  navigationPositionOptions,
  navigationStyleOptions,
  SETTING_KEYS
} from '../../../../shared/constants/settings'
import { SectionField, SectionFieldGroup } from './components/section-field'

interface SettingBehaviorProps {
  settings?: Record<string, string>
}

const MIN_DELAY = 0

function validateDelay(value: string): string | null {
  if (!value.trim()) return 'Required'
  if (!/^\d+(\.\d+)?$/.test(value.trim())) return 'Must be a number'
  const num = parseFloat(value)
  if (num < MIN_DELAY) return `Min ${MIN_DELAY}s`
  return null
}

function padNumber(value: string): string {
  return value.padStart(2, '0')
}

export default function SettingsBehavior({ settings }: SettingBehaviorProps) {
  const setSetting = useSetSetting()
  const schemaSetting = useExtractSetting(settings)
  const { t } = useI18n()

  const [delayError, setDelayError] = useState<string | null>(null)
  const [delayInput, setDelayInput] = useState<string>(
    padNumber(schemaSetting.navigation_auto_hide_delay ?? '0')
  )

  const handleDelayChange = (value: string) => {
    setDelayInput(value)
    const error = validateDelay(value)
    setDelayError(error)

    if (!error) {
      setSetting.mutate({
        key: SETTING_KEYS.NAVIGATION_AUTO_HIDE_DELAY,
        value: padNumber(value.trim())
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('settings.behavior')}</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6">
        <SectionField
          label={t('settings.behavior.autoLaunch')}
          description={t('settings.behavior.autoLaunch.description')}
        >
          <Switch
            checked={schemaSetting.auto_launch === 'true'}
            onCheckedChange={(checked) =>
              setSetting.mutate({
                key: SETTING_KEYS.AUTO_LAUNCH,
                value: checked ? 'true' : 'false'
              })
            }
          />
        </SectionField>

        <SectionField
          label={t('settings.behavior.monitorInterval')}
          description={t('settings.behavior.monitorInterval.description')}
        >
          <ComboboxSimple
            items={monitorIntervalOptions.map((o) => ({
              label: t('settings.behavior.monitorInterval.duration.seconds', { seconds: o.label }),
              value: o.value
            }))}
            value={schemaSetting.monitor_interval}
            onValueChange={(value: unknown) => {
              setSetting.mutate({
                key: SETTING_KEYS.MONITOR_INTERVAL,
                value: (value as string) ?? monitorIntervalOptions[0].value
              })
            }}
          />
        </SectionField>

        <SectionField
          label={t('settings.behavior.sidePanel')}
          description={t('settings.behavior.sidePanel.description')}
        >
          <Switch
            checked={schemaSetting.side_panel_open === 'true'}
            onCheckedChange={(checked) =>
              setSetting.mutate({
                key: SETTING_KEYS.SIDE_PANEL_OPEN,
                value: checked ? 'true' : 'false'
              })
            }
          />
        </SectionField>

        <SectionFieldGroup
          hideGroup={schemaSetting.navigation_auto_hide !== 'true'}
          main={
            <SectionField
              label={t('settings.behavior.autoHide')}
              description={t('settings.behavior.autoHide.description')}
            >
              <Switch
                checked={schemaSetting.navigation_auto_hide === 'true'}
                onCheckedChange={(checked) =>
                  setSetting.mutate({
                    key: SETTING_KEYS.NAVIGATION_AUTO_HIDE,
                    value: checked ? 'true' : 'false'
                  })
                }
              />
            </SectionField>
          }
        >
          <SectionField
            label={t('settings.behavior.delayTime')}
            description={
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground">
                  {t('settings.behavior.delayTime.description')}
                </p>
                <span className="text-xs text-muted-foreground">
                  {t('settings.behavior.delayTime.min', { min: MIN_DELAY })}
                </span>
              </div>
            }
            error={delayError}
          >
            <div className="flex items-center gap-2">
              <Input
                className="w-12 text-center"
                placeholder="--"
                value={delayInput}
                onChange={(e) => handleDelayChange(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">
                {t('settings.behavior.delayTime.seconds')}
              </span>
            </div>
          </SectionField>
        </SectionFieldGroup>

        <SectionFieldGroup
          hideGroup={schemaSetting.navigation_style !== NAVIGATION_STYLES.SIDE}
          main={
            <SectionField
              label={t('settings.behavior.navStyle')}
              description={t('settings.behavior.navStyle.description')}
            >
              <ComboboxSimple
                items={navigationStyleOptions.map((o) => ({
                  label: t(o.label),
                  value: o.value
                }))}
                value={schemaSetting.navigation_style}
                onValueChange={(value: unknown) => {
                  setSetting.mutate({
                    key: SETTING_KEYS.NAVIGATION_STYLE,
                    value: (value as string) ?? NAVIGATION_STYLES.SIDE
                  })
                }}
              />
            </SectionField>
          }
        >
          <SectionField
            label={t('settings.behavior.navItemsAlignment')}
            description={t('settings.behavior.navItemsAlignment.description')}
          >
            <ComboboxSimple
              items={navigationItemsAlignmentOptions.map((o) => ({
                label: t(o.label),
                value: o.value
              }))}
              value={schemaSetting.navigation_items_alignment}
              onValueChange={(value: unknown) => {
                setSetting.mutate({
                  key: SETTING_KEYS.NAVIGATION_ITEMS_ALIGNMENT,
                  value: (value as string) ?? NAVIGATION_ITEMS_ALIGNMENT.START
                })
              }}
            />
          </SectionField>
        </SectionFieldGroup>

        <SectionField
          label={t('settings.behavior.navPosition')}
          description={t('settings.behavior.navPosition.description')}
        >
          <ComboboxSimple
            items={navigationPositionOptions.map((o) => ({
              label: t(o.label),
              value: o.value
            }))}
            value={schemaSetting.navigation_position}
            onValueChange={(value: unknown) => {
              setSetting.mutate({
                key: SETTING_KEYS.NAVIGATION_POSITION,
                value: (value as string) ?? NAVIGATION_POSITIONS.BOTTOM
              })
            }}
          />
        </SectionField>
      </CardContent>
    </Card>
  )
}
