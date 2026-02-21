import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { ComboboxSimple } from '@renderer/components/ui/combobox'
import { Input } from '@renderer/components/ui/input'
import { Separator } from '@renderer/components/ui/separator'
import useExtractSetting from '@renderer/hooks/use-extract-setting'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useSetSetting } from '@renderer/hooks/use-settings'
import { useState } from 'react'
import {
  actionOnCloseOptions,
  SETTING_KEYS,
  WINDOW_MODES,
  windowModeOptions
} from '../../../../shared/constants/settings'
import { SectionField } from './components/section-field'

const MIN_WIDTH = 800
const MIN_HEIGHT = 600
const MAX_WIDTH = 7680
const MAX_HEIGHT = 4320

function validateDimension(value: string, min: number, max: number): string | null {
  if (!value.trim()) return 'Required'
  if (!/^\d+$/.test(value.trim())) return 'Must be a number'
  const num = parseInt(value, 10)
  if (num < min) return `Min ${min}px`
  if (num > max) return `Max ${max}px`
  return null
}

interface SettingStartProps {
  settings?: Record<string, string>
}

export default function SettingsStart({ settings }: SettingStartProps) {
  const setSetting = useSetSetting()
  const schemaSetting = useExtractSetting(settings)
  const { t } = useI18n()

  const [widthInput, setWidthInput] = useState(schemaSetting.window_width)
  const [heightInput, setHeightInput] = useState(schemaSetting.window_height)
  const [widthError, setWidthError] = useState<string | null>(null)
  const [heightError, setHeightError] = useState<string | null>(null)

  const isCustom = schemaSetting.window_mode === WINDOW_MODES.CUSTOM

  const handleWidthChange = (value: string) => {
    setWidthInput(value)
    const error = validateDimension(value, MIN_WIDTH, MAX_WIDTH)
    setWidthError(error)
    if (!error) {
      setSetting.mutate({ key: SETTING_KEYS.WINDOW_WIDTH, value: value.trim() })
    }
  }

  const handleHeightChange = (value: string) => {
    setHeightInput(value)
    const error = validateDimension(value, MIN_HEIGHT, MAX_HEIGHT)
    setHeightError(error)
    if (!error) {
      setSetting.mutate({ key: SETTING_KEYS.WINDOW_HEIGHT, value: value.trim() })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('settings.start')}</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6">
        <SectionField
          label={t('settings.start.actionOnClose')}
          description={t('settings.start.actionOnClose.description')}
        >
          <ComboboxSimple
            items={actionOnCloseOptions.map((o) => ({
              label: t(o.label),
              value: o.value
            }))}
            value={schemaSetting.action_on_close}
            onValueChange={(value: unknown) => {
              setSetting.mutate({
                key: SETTING_KEYS.ACTION_ON_CLOSE,
                value: (value as string) ?? actionOnCloseOptions[0].value
              })
            }}
            placeholder={t('settings.start.actionOnClose.placeholder')}
          />
        </SectionField>

        <SectionField
          label={t('settings.start.windowSize')}
          description={t('settings.start.windowSize.description')}
          className="items-start"
        >
          <div className="flex flex-col gap-2">
            <ComboboxSimple
              items={windowModeOptions.map((o) => ({
                label: t(o.label),
                value: o.value
              }))}
              value={schemaSetting.window_mode}
              onValueChange={(value: unknown) => {
                setSetting.mutate({
                  key: SETTING_KEYS.WINDOW_MODE,
                  value: (value as string) ?? windowModeOptions[1].value
                })
              }}
              placeholder={t('settings.start.windowSize.placeholder')}
            />

            {isCustom && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <Input
                      className="w-16 text-center"
                      placeholder={t('settings.start.windowSize.width')}
                      value={widthInput}
                      onChange={(e) => handleWidthChange(e.target.value)}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground top-1/2 relative block">x</span>
                  <div className="flex flex-col gap-1">
                    <Input
                      className="w-16 text-center"
                      placeholder={t('settings.start.windowSize.height')}
                      value={heightInput}
                      onChange={(e) => handleHeightChange(e.target.value)}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
                {widthError && <p className="text-[10px] text-destructive">Width: {widthError}</p>}
                {heightError && (
                  <p className="text-[10px] text-destructive">Height: {heightError}</p>
                )}
              </div>
            )}
          </div>
        </SectionField>
      </CardContent>
    </Card>
  )
}
