import { cn } from '@renderer/lib/utils'
import { ChevronLeft } from 'lucide-react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'

interface SidePanelProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export default function SidePanel({ children, open, onOpenChange, className }: SidePanelProps) {
  if (!open) return null

  return (
    <ScrollArea className={cn('flex flex-col relative h-full pr-4', className)}>
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        className="absolute top-2 right-6 cursor-pointer z-10"
        size="icon"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex-1">{children}</div>
    </ScrollArea>
  )
}
