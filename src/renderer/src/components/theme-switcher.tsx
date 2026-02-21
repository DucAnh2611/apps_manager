import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useTheme } from '@renderer/providers/theme-provider'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'

interface ThemeSwitcherProps {
  buttonTriggerProps?: React.ComponentProps<typeof Button>
  dropdownMenuContentProps?: React.ComponentProps<typeof DropdownMenuContent>
}

export function ThemeSwitcher({
  buttonTriggerProps,
  dropdownMenuContentProps
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer rounded-full"
          {...buttonTriggerProps}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

          <span className="sr-only">{t('theme.toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" {...dropdownMenuContentProps}>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          {t('theme.light')}
          {theme === 'light' && <span className="ml-auto text-xs">&#10003;</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          {t('theme.dark')}
          {theme === 'dark' && <span className="ml-auto text-xs">&#10003;</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          {t('theme.system')}
          {theme === 'system' && <span className="ml-auto text-xs">&#10003;</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
