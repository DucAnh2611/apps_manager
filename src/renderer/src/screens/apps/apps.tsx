import { SETTING_KEYS } from '../../../../shared/constants/settings'
import { AppCard } from '@renderer/components/app-card'
import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { Input } from '@renderer/components/ui/input'
import { useApps } from '@renderer/hooks/use-apps'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useSetSetting, useSettings } from '@renderer/hooks/use-settings'
import { api } from '@renderer/lib/api'
import { cn } from '@renderer/lib/utils'
import { Check, Columns2Icon, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

const MAX_COLUMNS = 5

export default function Apps() {
  const { data: apps, isLoading } = useApps()
  const { mutate: setSetting } = useSetSetting()
  const { data: settings } = useSettings()
  const { t } = useI18n()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [columns, setColumns] = useState<number>(
    settings?.app_columns ? parseInt(settings.app_columns) : 5
  )

  const filteredApps = (apps ?? []).filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || app.categories.includes(categoryFilter)
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set((apps ?? []).flatMap((app) => app.categories))]

  const handleColumnsChange = (columns: number) => {
    setColumns(columns)
    setSetting({ key: SETTING_KEYS.APP_COLUMNS, value: columns.toString() })
  }

  useEffect(() => {
    api.getSetting(SETTING_KEYS.APP_COLUMNS).then((value) => {
      if (value) setColumns(parseInt(value))
    })
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t('apps.loading')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('apps.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-xs cursor-pointer">
                <Columns2Icon className="h-4 w-4" /> {t('apps.columns')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start">
              {Array.from({ length: MAX_COLUMNS }).map((_, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => handleColumnsChange(index + 1)}
                  className={cn(index + 1 === columns && 'justify-between')}
                >
                  {index + 1}
                  {index + 1 === columns && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={categoryFilter === null ? 'default' : 'outline'}
              onClick={() => setCategoryFilter(null)}
              className="text-xs rounded-full cursor-pointer"
            >
              {t('apps.all')}
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                size="sm"
                variant={categoryFilter === cat ? 'default' : 'outline'}
                className="text-xs rounded-full cursor-pointer"
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {filteredApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <p className="text-lg font-medium">{t('apps.empty')}</p>
          <p className="text-sm">
            {apps?.length === 0 ? t('apps.empty.first') : t('apps.empty.search')}
          </p>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}
