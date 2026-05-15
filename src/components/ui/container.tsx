import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section'
  narrow?: boolean
}

export function Container({ children, className, as: Tag = 'div', narrow = false }: ContainerProps) {
  return (
    <Tag className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      narrow ? 'max-w-4xl' : 'max-w-7xl',
      className,
    )}>
      {children}
    </Tag>
  )
}
