import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { useDeleteApp, useLaunchApp, useUpdateApp } from '@renderer/hooks/use-apps'
import { useI18n } from '@renderer/hooks/use-i18n'
import { MoreVertical, Package, Pencil, Play, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { EditAppDialog } from './edit-app-dialog'

interface AppCardProps {
  app: {
    id: number
    name: string
    path: string
    args: string | null
    icon: string | null
    color: string | null
    categories: string[]
    favorite: number
    launchCount: number
    lastLaunchedAt: string | null
  }
}

export function AppCard({ app }: AppCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const launchApp = useLaunchApp()
  const updateApp = useUpdateApp()
  const deleteApp = useDeleteApp()
  const { t } = useI18n()

  const toggleFavorite = () => {
    updateApp.mutate({ id: app.id, favorite: app.favorite ? 0 : 1 })
  }

  const accentColor = app.color || undefined

  return (
    <Card
      className="group relative overflow-hidden transition-all hover:shadow-lg py-0"
      style={
        accentColor
          ? {
              borderColor: accentColor,
              backgroundColor: `${accentColor}50`
            }
          : undefined
      }
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg p-2"
            style={{
              backgroundColor: accentColor ? `${accentColor}40` : 'var(--color-muted)',
              color: accentColor || 'var(--color-muted-foreground)'
            }}
          >
            {app.icon ? (
              <img src={app.icon} alt={app.name} className="h-full w-full object-contain" />
            ) : (
              <Package className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{app.name}</h3>
              <Button
                size="icon"
                variant="ghost"
                className="size-4 hover:bg-transparent cursor-pointer"
                onClick={toggleFavorite}
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    app.favorite
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground hover:text-yellow-400'
                  }`}
                />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {app.categories.slice(0, 3).map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                  style={
                    accentColor
                      ? {
                          backgroundColor: `${accentColor}20`,
                          color: accentColor
                        }
                      : undefined
                  }
                >
                  {cat}
                </Badge>
              ))}
              {app.categories.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                  style={
                    accentColor
                      ? {
                          backgroundColor: `${accentColor}20`,
                          color: accentColor
                        }
                      : undefined
                  }
                >
                  +{app.categories.length - 3}
                </Badge>
              )}
              {app.launchCount > 0 && (
                <span className="text-[10px] text-muted-foreground flex-1">
                  {t('apps.launches', { count: app.launchCount })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center absolute top-4 right-4">
            <Button
              size="icon"
              variant="ghost"
              className="cursor-pointer max-xl:size-6"
              onClick={() => launchApp.mutate(app.id)}
              disabled={launchApp.isPending}
            >
              <Play className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer max-xl:size-6">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="left" align="start">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('app.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleFavorite}>
                  <Star className="mr-2 h-4 w-4" />
                  {app.favorite ? t('app.unfavorite') : t('app.favorite')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteApp.mutate(app.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('app.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>

      <EditAppDialog app={app} open={editOpen} onOpenChange={setEditOpen} />
    </Card>
  )
}
