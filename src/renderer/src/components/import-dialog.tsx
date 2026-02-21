import { Button } from '@renderer/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { useAddApp, useBrowseForApp, useBrowseForIcon } from '@renderer/hooks/use-apps'
import { useI18n } from '@renderer/hooks/use-i18n'
import { FolderOpen, Image, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ColorSelect } from './color-select'

interface ImportFormValues {
  name: string
  path: string
  args: string
  categories: string
  icon: string | null
  color: string
}

export default function ImportDialog() {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ImportFormValues>({
    defaultValues: {
      name: '',
      path: '',
      args: '',
      categories: 'General',
      icon: null,
      color: ''
    }
  })

  const addApp = useAddApp()
  const browseForApp = useBrowseForApp()
  const browseForIcon = useBrowseForIcon()

  const watchedColor = watch('color')
  const watchedName = watch('name')

  const handleBrowse = async () => {
    const result = await browseForApp.mutateAsync()
    if (result) {
      setValue('path', result)
      if (!watchedName) {
        const fileName = result.split(/[/\\]/).pop() || ''
        setValue('name', fileName.replace(/\.(exe|app|AppImage|desktop|lnk|bat|cmd|sh)$/i, ''))
      }
    }
  }

  const handleBrowseIcon = async () => {
    const result = await browseForIcon.mutateAsync()
    if (result) {
      setValue('icon', result)
    }
  }

  const onSubmit = async (data: ImportFormValues) => {
    await addApp.mutateAsync({
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
    reset()
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer">
          <Plus className="h-4 w-4" />
          {t('apps.import')}
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          backgroundImage: watchedColor
            ? `linear-gradient(to bottom, ${watchedColor}50, ${watchedColor}18)`
            : 'none'
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('import.title')}</DialogTitle>
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
                onClick={handleBrowse}
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
                      size="sm"
                      style={{
                        borderColor: watchedColor ? `${watchedColor}50` : 'var(--color-muted)'
                      }}
                      onClick={handleBrowseIcon}
                      className="cursor-pointer bg-transparent hover:bg-transparent"
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
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <ColorSelect value={field.value} onChange={field.onChange} />
                </div>
              )}
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
              {t('import.cancel')}
            </DialogClose>
            <Button type="submit" disabled={addApp.isPending}>
              {addApp.isPending ? t('import.submitting') : t('import.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
