import StringNode, { StringNodeType } from '@renderer/components/string-node'
import { Separator } from '@renderer/components/ui/separator'
import { cn } from '@renderer/lib/utils'

interface SectionFieldProps {
  label: StringNodeType
  description?: StringNodeType
  children?: React.ReactNode
  className?: string
  required?: boolean
  hidden?: boolean
  requiredPosition?: 'left' | 'right'
  error?: string | null
}

export function SectionField({
  label,
  description,
  children,
  className,
  required = false,
  requiredPosition = 'right',
  hidden = false,
  error
}: SectionFieldProps) {
  if (hidden) return null

  return (
    <div className="flex flex-col gap-1">
      <div className={cn('flex items-center justify-between', className)}>
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-1">
            {requiredPosition === 'left' && required && <span className="text-red-500">*</span>}
            <StringNode text={label} className="text-sm font-medium" />
            {requiredPosition === 'right' && required && <span className="text-red-500">*</span>}
          </div>
          {description && (
            <StringNode text={description} className="text-xs text-muted-foreground" />
          )}
        </div>
        {children}
      </div>
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  )
}

interface SectionFieldGroupProps {
  children?: React.ReactNode
  main: React.ReactNode
  hidden?: boolean
  hideGroup?: boolean
}

export function SectionFieldGroup({
  children,
  main,
  hidden = false,
  hideGroup = false
}: SectionFieldGroupProps) {
  if (hidden) return null
  if (hideGroup) return main

  return (
    <div className="flex flex-col gap-2">
      {main}

      {!hideGroup && (
        <>
          <Separator />
          <div className="flex flex-col gap-4 w-full pl-4">{children}</div>
          <Separator />
        </>
      )}
    </div>
  )
}
