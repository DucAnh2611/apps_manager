import useExtractSetting from '@renderer/hooks/use-extract-setting'
import { useI18n } from '@renderer/hooks/use-i18n'
import usePage from '@renderer/hooks/use-page'
import { useSettings } from '@renderer/hooks/use-settings'
import { cn } from '@renderer/lib/utils'
import { LayoutDashboard, LayoutGrid, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  NAVIGATION_ITEMS_ALIGNMENT,
  NAVIGATION_POSITIONS,
  NAVIGATION_STYLES
} from '../../../shared/constants/settings'
import type { TranslationKey } from '../../../shared/i18n/keys'
import { Button } from './ui/button'
import { TooltipSimple } from './ui/tooltip'

type Page = 'apps' | 'settings'

const navItems: { page: Page; labelKey: TranslationKey; icon: React.ElementType }[] = [
  { page: 'apps', labelKey: 'nav.apps', icon: LayoutGrid },
  { page: 'settings', labelKey: 'nav.settings', icon: Settings }
]

const useHiddenNavigation = (autoHide: boolean, delay: number) => {
  const [isHidden, setIsHidden] = useState(true)
  const barRef = useRef<HTMLDivElement>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const delayRef = useRef(delay)

  useEffect(() => {
    if (!autoHide) return
    delayRef.current = delay
    const el = barRef.current
    if (!el) return

    const onEnter = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      setIsHidden(false)
    }
    const onLeave = () => {
      hideTimeoutRef.current = setTimeout(() => setIsHidden(true), delayRef.current)
    }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [autoHide, delay])

  const shouldCollapse = autoHide && isHidden

  return { shouldCollapse, barRef }
}

export default function Navigation() {
  const { data: settings } = useSettings()
  const schemaSetting = useExtractSetting(settings)

  const navigationAutoHide = schemaSetting.navigation_auto_hide === 'true'
  const navigationAutoHideDelay =
    parseInt(schemaSetting.navigation_auto_hide_delay ?? '0', 10) * 1000

  if (schemaSetting.navigation_style === NAVIGATION_STYLES.SIDE) {
    return (
      <Sidebar
        position={schemaSetting.navigation_position}
        autoHide={navigationAutoHide}
        delay={navigationAutoHideDelay}
        itemsAlignment={
          schemaSetting.navigation_items_alignment as (typeof NAVIGATION_ITEMS_ALIGNMENT)[keyof typeof NAVIGATION_ITEMS_ALIGNMENT]
        }
      />
    )
  }

  return (
    <Floating
      position={schemaSetting.navigation_position}
      autoHide={navigationAutoHide}
      delay={navigationAutoHideDelay}
    />
  )
}

interface NavigationBaseProps {
  position: string
  autoHide: boolean
  delay: number
}

function Floating({ position, autoHide, delay }: NavigationBaseProps) {
  const { page: currentPage, setPage } = usePage()
  const { t } = useI18n()

  const { shouldCollapse, barRef } = useHiddenNavigation(autoHide, delay)

  return (
    <div
      ref={barRef}
      className={cn('absolute rounded-full p-2 border shadow flex z-10 bg-background', {
        'bottom-[2%] left-1/2 -translate-x-1/2': position === NAVIGATION_POSITIONS.BOTTOM,
        'top-[2%] left-1/2 -translate-x-1/2': position === NAVIGATION_POSITIONS.TOP,
        'left-[2%] top-1/2 -translate-y-1/2': position === NAVIGATION_POSITIONS.LEFT,
        'right-[2%] top-1/2 -translate-y-1/2': position === NAVIGATION_POSITIONS.RIGHT
      })}
    >
      <nav
        className={cn(
          'flex flex-1 items-center gap-1',
          {
            'flex-row':
              position === NAVIGATION_POSITIONS.BOTTOM || position === NAVIGATION_POSITIONS.TOP,
            'flex-col':
              position === NAVIGATION_POSITIONS.LEFT || position === NAVIGATION_POSITIONS.RIGHT
          },
          { hidden: shouldCollapse }
        )}
      >
        {navItems.map(({ page, labelKey, icon: Icon }) => {
          const label = t(labelKey)
          return (
            <TooltipSimple
              key={page}
              content={label}
              contentProps={{
                side:
                  position === NAVIGATION_POSITIONS.LEFT
                    ? 'right'
                    : position === NAVIGATION_POSITIONS.RIGHT
                      ? 'left'
                      : position === NAVIGATION_POSITIONS.TOP
                        ? 'bottom'
                        : 'top'
              }}
            >
              <Button
                onClick={() => setPage(page)}
                className={cn('rounded-full cursor-pointer')}
                title={label}
                size="icon"
                variant={page === currentPage ? 'default' : 'ghost'}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </TooltipSimple>
          )
        })}
      </nav>

      <Button
        variant="ghost"
        size="icon"
        className={cn('rounded-full cursor-pointer', { hidden: !shouldCollapse })}
      >
        <LayoutDashboard className="h-5 w-5" />
      </Button>
    </div>
  )
}

interface SidebarProps extends NavigationBaseProps {
  itemsAlignment: (typeof NAVIGATION_ITEMS_ALIGNMENT)[keyof typeof NAVIGATION_ITEMS_ALIGNMENT]
}

function Sidebar({ position, autoHide, delay, itemsAlignment }: SidebarProps) {
  const { page: currentPage, setPage } = usePage()
  const { t } = useI18n()

  const { shouldCollapse, barRef } = useHiddenNavigation(autoHide, delay)

  return (
    <div
      ref={barRef}
      className={cn({
        'w-fit h-full':
          position === NAVIGATION_POSITIONS.LEFT || position === NAVIGATION_POSITIONS.RIGHT,
        'w-full h-fit':
          position === NAVIGATION_POSITIONS.TOP || position === NAVIGATION_POSITIONS.BOTTOM,
        'bottom-0 left-0': position === NAVIGATION_POSITIONS.BOTTOM,
        'top-0 left-0': position === NAVIGATION_POSITIONS.TOP,
        'left-0 top-0': position === NAVIGATION_POSITIONS.LEFT,
        'right-0 top-0': position === NAVIGATION_POSITIONS.RIGHT,
        relative: !autoHide,
        'absolute transition-transform duration-200 z-10': autoHide,
        '-translate-x-[70%]': shouldCollapse && position === NAVIGATION_POSITIONS.LEFT,
        'translate-x-[70%]': shouldCollapse && position === NAVIGATION_POSITIONS.RIGHT,
        '-translate-y-[70%]': shouldCollapse && position === NAVIGATION_POSITIONS.TOP,
        'translate-y-[70%]': shouldCollapse && position === NAVIGATION_POSITIONS.BOTTOM
      })}
    >
      <nav
        className={cn(
          'h-full flex flex-1 flex-col items-center p-2 gap-3 bg-muted',
          {
            'flex-row':
              position === NAVIGATION_POSITIONS.TOP || position === NAVIGATION_POSITIONS.BOTTOM,
            'flex-col':
              position === NAVIGATION_POSITIONS.LEFT || position === NAVIGATION_POSITIONS.RIGHT
          },
          {
            'justify-center': itemsAlignment === NAVIGATION_ITEMS_ALIGNMENT.CENTER,
            'justify-start': itemsAlignment === NAVIGATION_ITEMS_ALIGNMENT.START,
            'justify-end': itemsAlignment === NAVIGATION_ITEMS_ALIGNMENT.END
          }
        )}
      >
        {navItems.map(({ page, labelKey, icon: Icon }) => {
          const label = t(labelKey)
          return (
            <TooltipSimple
              key={page}
              content={label}
              contentProps={{
                side:
                  position === NAVIGATION_POSITIONS.LEFT
                    ? 'right'
                    : position === NAVIGATION_POSITIONS.RIGHT
                      ? 'left'
                      : position === NAVIGATION_POSITIONS.TOP
                        ? 'bottom'
                        : 'top'
              }}
            >
              <Button
                onClick={() => setPage(page)}
                className={cn('cursor-pointer')}
                title={label}
                size="icon"
                variant={page === currentPage ? 'default' : 'ghost'}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </TooltipSimple>
          )
        })}
      </nav>
    </div>
  )
}
