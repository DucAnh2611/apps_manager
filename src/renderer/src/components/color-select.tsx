import { useI18n } from '@renderer/hooks/use-i18n'
import { cn } from '@renderer/lib/utils'
import { Check, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { TooltipSimple } from './ui/tooltip'

const COLORS = [
  { label: 'color.red', value: '#ef4444' },
  { label: 'color.orange', value: '#f97316' },
  { label: 'color.amber', value: '#f59e0b' },
  { label: 'color.green', value: '#22c55e' },
  { label: 'color.teal', value: '#14b8a6' },
  { label: 'color.blue', value: '#3b82f6' },
  { label: 'color.indigo', value: '#6366f1' },
  { label: 'color.purple', value: '#a855f7' },
  { label: 'color.pink', value: '#ec4899' }
] as const

const PRESET_VALUES = new Set<string>(COLORS.map((c) => c.value))

interface ColorSelectProps {
  value: string
  onChange: (color: string) => void
}

export function ColorSelect({ value, onChange }: ColorSelectProps) {
  const { t } = useI18n()

  const isCustom = value && !PRESET_VALUES.has(value)
  const [showCustom, setShowCustom] = useState(false)
  const [customInput, setCustomInput] = useState(isCustom ? value : '')

  const handleCustomApply = () => {
    const trimmed = customInput.trim()
    if (trimmed) {
      onChange(trimmed)
    }
  }

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomApply()
    }
    if (e.key === 'Escape') {
      setShowCustom(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Default / clear button */}
        <TooltipSimple content={t('color.default')}>
          <Button
            type="button"
            title="Default (no color)"
            onClick={() => {
              onChange('')
              setShowCustom(false)
              setCustomInput('')
            }}
            className={cn(
              'relative flex size-7 p-0 items-center justify-center rounded-full border-2 transition-all cursor-pointer',
              'bg-muted',
              !value
                ? 'border-foreground scale-110'
                : 'border-transparent hover:border-muted-foreground/50'
            )}
          >
            {!value && <Check className="h-3.5 w-3.5 text-foreground" />}
          </Button>
        </TooltipSimple>

        {COLORS.map((c) => {
          const isSelected = value === c.value
          return (
            <TooltipSimple key={c.value} content={t(c.label)}>
              <Button
                type="button"
                title={t(c.label)}
                onClick={() => {
                  onChange(c.value)
                  setShowCustom(false)
                }}
                className={cn(
                  'relative flex size-7 p-0 items-center justify-center rounded-full border-2 transition-all cursor-pointer',
                  isSelected
                    ? 'border-foreground scale-110'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
                style={{ backgroundColor: c.value }}
              >
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                )}
              </Button>
            </TooltipSimple>
          )
        })}

        {/* Custom color toggle */}
        <TooltipSimple content={t('color.custom')}>
          <Button
            type="button"
            title="Custom color"
            onClick={() => {
              setShowCustom(!showCustom)
              if (!showCustom && isCustom) {
                setCustomInput(value)
              }
            }}
            className={cn(
              'relative flex size-7 p-0 items-center justify-center rounded-full border-2 transition-all cursor-pointer',
              isCustom
                ? 'border-foreground scale-110'
                : showCustom
                  ? 'border-foreground bg-muted'
                  : 'border-dashed border-muted-foreground/40 hover:border-muted-foreground/70 bg-muted'
            )}
            style={isCustom ? { backgroundColor: value } : undefined}
          >
            {isCustom ? (
              <Check className="h-3.5 w-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
            ) : (
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        </TooltipSimple>
      </div>

      {/* Custom color input */}
      {showCustom && (
        <div className="flex items-center gap-2">
          <div
            className="size-8 rounded-full shrink-0 border border-input"
            style={{ backgroundColor: customInput || 'transparent' }}
          />
          <Input
            placeholder="#ff5500 or rgb(255, 85, 0)"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            className="h-8 flex-1 text-xs font-mono"
            autoFocus
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer"
            onClick={handleCustomApply}
            disabled={!customInput.trim()}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="cursor-pointer"
            onClick={() => {
              setShowCustom(false)
              setCustomInput('')
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
