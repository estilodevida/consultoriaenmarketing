import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  variant?: 'default' | 'gradient-border' | 'ghost'
}

export function Card({ children, className, hover = false, variant = 'default' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white p-6 md:p-8',
        variant === 'default' && 'border border-neutral-200 shadow-soft',
        variant === 'ghost' && 'border border-neutral-100',
        variant === 'gradient-border' && 'gradient-border border-0',
        hover && 'transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-xl font-semibold text-neutral-900 mb-2', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-neutral-600 leading-relaxed', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}
