import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  variant?: 'default' | 'muted' | 'primary' | 'gradient'
}

const variants = {
  default: 'bg-white',
  muted: 'bg-neutral-50',
  primary: 'bg-primary-900 text-white',
  gradient: 'gradient-bg-primary text-white',
}

export function Section({ children, className, id, variant = 'default' }: SectionProps) {
  return (
    <section id={id} className={cn('section-padding', variants[variant], className)}>
      <div className="container-wide">
        {children}
      </div>
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
  light?: boolean
}

export function SectionHeader({ title, subtitle, centered = true, className, light }: SectionHeaderProps) {
  return (
    <div className={cn(
      'mb-12 md:mb-16 max-w-3xl',
      centered && 'mx-auto text-center',
      className,
    )}>
      <h2 className={cn(
        'text-display-sm md:text-display-md font-bold mb-4',
        light ? 'text-white' : 'text-neutral-900',
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'text-lg md:text-xl leading-relaxed',
          light ? 'text-primary-200' : 'text-neutral-600',
        )}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
