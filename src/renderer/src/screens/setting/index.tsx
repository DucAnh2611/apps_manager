import Section from '@renderer/components/section'
import { useI18n } from '@renderer/hooks/use-i18n'
import { Settings as SettingsIcon } from 'lucide-react'
import Settings from './settings'

export default function SettingsScreen() {
  const { t } = useI18n()

  return (
    <div>
      <Section
        icon={<SettingsIcon className="h-5 w-5" />}
        title={t('settings.title')}
        description={t('settings.description')}
      >
        <Settings />
      </Section>
    </div>
  )
}
