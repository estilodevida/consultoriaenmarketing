import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

const variants = {
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  secondary: 'bg-secondary-50 text-secondary-700 border-secondary-200',
  accent: 'bg-accent-50 text-accent-700 border-accent-200',
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  outline: 'bg-transparent text-primary-700 border-primary-300',
}

const sizes = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export function Badge({ children, variant = 'primary', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
