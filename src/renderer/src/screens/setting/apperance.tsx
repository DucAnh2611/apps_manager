import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@renderer/components/ui/combobox'
import { Separator } from '@renderer/components/ui/separator'
import { useI18n } from '@renderer/hooks/use-i18n'
import { Theme, useTheme } from '@renderer/providers/theme-provider'
import { SectionField } from './components/section-field'

export default function SettingsAppearance() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  const themes: { label: string; value: Theme }[] = [
    { label: t('settings.appearance.theme.light'), value: 'light' },
    { label: t('settings.appearance.theme.dark'), value: 'dark' },
    { label: t('settings.appearance.theme.system'), value: 'system' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('settings.appearance')}</CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-3">
        <SectionField
          label={t('settings.appearance.theme')}
          description={t('settings.appearance.theme.description')}
        >
          <Combobox
            items={themes}
            value={theme}
            itemToStringLabel={(item: unknown) => {
              if (typeof item === 'string')
                return themes.find((theme) => theme.value === item)?.label ?? ''

              return (item as { label: string }).label
            }}
            onValueChange={(value) => setTheme(value as Theme)}
          >
            <ComboboxInput placeholder={t('settings.appearance.theme.placeholder')} />
            <ComboboxContent>
              <ComboboxEmpty> {t('settings.appearance.theme.empty')} </ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item.value} value={item.value}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </SectionField>
      </CardContent>
    </Card>
  )
}
