import StringNode, { StringNodeType } from './string-node'

interface SectionProps {
  icon?: React.ReactNode
  title: StringNodeType
  description?: StringNodeType
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function Section({ icon, title, description, children, actions }: SectionProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {icon}
            <StringNode text={title} className="text-2xl font-bold" />
          </div>
          {description && (
            <StringNode text={description} className="text-sm text-muted-foreground" />
          )}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
