interface StringNodeProps {
  text: string | React.ReactNode
  className?: string
}

export type StringNodeType = string | React.ReactNode

export default function StringNode({ text, className }: StringNodeProps) {
  return typeof text === 'string' ? <span className={className}>{text}</span> : text
}
