import { api } from '@renderer/lib/api'
import { cn } from '@renderer/lib/utils'
import { Copy, Minus, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Titlebar() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    api.isMaximized().then(setMaximized)
    return api.onMaximizedChanged(setMaximized)
  }, [])

  return (
    <div className="flex items-center justify-between h-8 select-none titlebar z-999 bg-background border-b">
      <div className="flex-1 h-full px-3 flex items-center text-xs font-medium text-muted-foreground">
        Apps Manager
      </div>

      <div className="flex h-full">
        <button
          onClick={() => api.minimizeWindow()}
          className={cn(
            'inline-flex items-center justify-center w-11 h-full',
            'hover:bg-muted transition-colors cursor-pointer titlebar-button'
          )}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => api.maximizeWindow()}
          className={cn(
            'inline-flex items-center justify-center w-11 h-full',
            'hover:bg-muted transition-colors cursor-pointer titlebar-button'
          )}
        >
          {maximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
        </button>

        <button
          onClick={() => api.closeWindow()}
          className={cn(
            'inline-flex items-center justify-center w-11 h-full',
            'hover:bg-red-500 hover:text-white transition-colors cursor-pointer titlebar-button'
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
