import { SETTING_KEYS } from '../../../../shared/constants/settings'
import ImportDialog from '@renderer/components/import-dialog'
import Section from '@renderer/components/section'
import SidePanel from '@renderer/components/side-panel'
import SystemStats from '@renderer/components/system-stats'
import { Button } from '@renderer/components/ui/button'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useSettings } from '@renderer/hooks/use-settings'
import { api } from '@renderer/lib/api'
import { LayoutDashboard, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import Apps from './apps'

export default function AppsScreen() {
  const { data: settings } = useSettings()
  const { t } = useI18n()

  const [sidePanelOpen, setSidePanelOpen] = useState(settings?.side_panel_open === 'true')

  const toggleSidePanel = () => {
    setSidePanelOpen((prev) => !prev)
  }

  useEffect(() => {
    api.getSetting(SETTING_KEYS.SIDE_PANEL_OPEN).then((value) => {
      if (value) setSidePanelOpen(value === 'true')
    })
  }, [])

  return (
    <div className="flex w-full gap-4 h-full min-h-0 flex-col xl:flex-row">
      <SidePanel
        open={sidePanelOpen}
        onOpenChange={toggleSidePanel}
        className="w-full xl:w-1/4 h-fit xl:h-full shrink-0"
      >
        <SystemStats />
      </SidePanel>

      <div className="flex-1 min-w-0 overflow-y-auto">
        <Section
          icon={<LayoutDashboard className="h-5 w-5" />}
          title={t('apps.title')}
          description={t('apps.description')}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={toggleSidePanel} className="cursor-pointer">
                <Monitor className="h-4 w-4" /> {t('apps.stats')}
              </Button>

              <ImportDialog />
            </div>
          }
        >
          <Apps />
        </Section>
      </div>
    </div>
  )
}
