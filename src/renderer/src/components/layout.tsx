import useExtractSetting from '@renderer/hooks/use-extract-setting'
import { useSettings } from '@renderer/hooks/use-settings'
import { cn } from '@renderer/lib/utils'
import { NAVIGATION_POSITIONS } from '../../../shared/constants/settings'
import Navigation from './nav'
import Titlebar from './titlebar'
import { ScrollArea } from './ui/scroll-area'
import UpdateBanner from './update-banner'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSettings()
  const schemaSetting = useExtractSetting(settings)

  return (
    <div className="flex flex-col h-screen">
      <Titlebar />
      <UpdateBanner />

      <div
        className={cn(
          'flex flex-1 min-h-0 relative overflow-hidden',
          schemaSetting.navigation_auto_hide === 'false' && {
            'flex-col': schemaSetting.navigation_position === NAVIGATION_POSITIONS.TOP,
            'flex-col-reverse': schemaSetting.navigation_position === NAVIGATION_POSITIONS.BOTTOM,
            'flex-row': schemaSetting.navigation_position === NAVIGATION_POSITIONS.LEFT,
            'flex-row-reverse': schemaSetting.navigation_position === NAVIGATION_POSITIONS.RIGHT
          }
        )}
      >
        <Navigation />

        <ScrollArea className="flex-1 shrink-0">
          <main className="p-6 h-full overflow-hidden">{children}</main>
        </ScrollArea>
      </div>
    </div>
  )
}
