import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { useBrowseForApp, useBrowseForIcon, useUpdateApp } from '@renderer/hooks/use-apps'
import { useI18n } from '@renderer/hooks/use-i18n'
import { FolderOpen, Image, X } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ColorSelect } from './color-select'

interface EditFormValues {
  name: string
  path: string
  args: string
  categories: string
  icon: string | null
  color: string
}

interface EditAppDialogProps {
  app: {
    id: number
    name: string
    path: string
    args: string | null
    icon: string | null
    color: string | null
    categories: string[]
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAppDialog({ app, open, onOpenChange }: EditAppDialogProps) {
  const { t } = useI18n()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<EditFormValues>({
    defaultValues: {
      name: app.name,
      path: app.path,
      args: app.args || '',
      categories: app.categories.join(', '),
      icon: app.icon,
      color: app.color || ''
    }
  })

  const updateApp = useUpdateApp()
  const browseForApp = useBrowseForApp()
  const browseForIcon = useBrowseForIcon()

  const watchedColor = watch('color')

  // Reset form when app changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        name: app.name,
        path: app.path,
        args: app.args || '',
        categories: app.categories.join(', '),
        icon: app.icon,
        color: app.color || ''
      })
    }
  }, [open, app, reset])

  const handleBrowsePath = async () => {
    const result = await browseForApp.mutateAsync()
    if (result) {
      setValue('path', result)
    }
  }

  const handleBrowseIcon = async () => {
    const result = await browseForIcon.mutateAsync()
    if (result) {
      setValue('icon', result)
    }
  }

  const onSubmit = async (data: EditFormValues) => {
    await updateApp.mutateAsync({
      id: app.id,
      name: data.name.trim(),
      path: data.path.trim(),
      args: data.args.trim() || null,
      icon: data.icon || null,
      color: data.color || null,
      categories: data.categories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) || ['General']
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{
          backgroundImage: watchedColor
            ? `linear-gradient(to bottom, ${watchedColor}50, ${watchedColor}18)`
            : 'none'
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('edit.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Path */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium">{t('import.path')}</label>
            <div className="flex gap-2">
              <Input
                placeholder={t('import.path.placeholder')}
                {...register('path', { required: t('import.path.required') })}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                style={{
                  borderColor: watchedColor ? `${watchedColor}50` : 'var(--color-muted)'
                }}
                onClick={handleBrowsePath}
                className="cursor-pointer bg-transparent hover:bg-transparent"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            {errors.path && <p className="text-xs text-destructive">{errors.path.message}</p>}
          </div>

          {/* Name */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium">{t('import.name')}</label>
            <Input
              placeholder={t('import.name.placeholder')}
              {...register('name', { required: t('import.name.required') })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Launch Arguments */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium">
              {t('import.args')}{' '}
              <span className="text-muted-foreground font-normal">{t('form.optional')}</span>
            </label>
            <Input placeholder={t('import.args.placeholder')} {...register('args')} />
            <p className="text-[10px] text-muted-foreground">{t('import.args.description')}</p>
          </div>

          {/* Icon */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium">
              {t('import.icon')}{' '}
              <span className="text-muted-foreground font-normal">{t('form.optional')}</span>
            </label>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden p-2">
                    {field.value ? (
                      <img
                        src={field.value}
                        alt="App icon"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Image className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer bg-transparent hover:bg-transparent"
                      style={{
                        borderColor: watchedColor ? `${watchedColor}50` : 'var(--color-muted)'
                      }}
                      size="sm"
                      onClick={handleBrowseIcon}
                    >
                      <Image className="mr-2 h-3.5 w-3.5" />
                      {t('import.icon.browse')}
                    </Button>

                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 cursor-pointer bg-transparent hover:bg-transparent"
                        onClick={() => field.onChange(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            />
          </div>

          {/* Card color picker */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium">
              {t('import.color')}{' '}
              <span className="text-muted-foreground font-normal">{t('form.optional')}</span>
            </label>
            <Controller
              control={control}
              name="color"
              render={({ field }) => <ColorSelect value={field.value} onChange={field.onChange} />}
            />
          </div>

          {/* Categories */}
          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-medium">{t('import.categories')}</label>
            <Input placeholder={t('import.categories.placeholder')} {...register('categories')} />
            <p className="text-[10px] text-muted-foreground">
              {t('import.categories.description')}
            </p>
          </div>

          <DialogFooter>
            <DialogClose
              style={{
                borderColor: watchedColor ? `${watchedColor}50` : 'var(--color-muted)'
              }}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer bg-transparent hover:bg-transparent"
            >
              {t('edit.cancel')}
            </DialogClose>
            <Button type="submit" disabled={updateApp.isPending}>
              {updateApp.isPending ? t('edit.submitting') : t('edit.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
