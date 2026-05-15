import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon'
  as?: 'button' | 'a'
  href?: string
}

const variants = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md',
  secondary:
    'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 shadow-sm hover:shadow-md',
  accent:
    'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm hover:shadow-md',
  outline:
    'border-2 border-primary-600 text-primary-700 hover:bg-primary-50 active:bg-primary-100',
  ghost:
    'text-primary-700 hover:bg-primary-50 active:bg-primary-100',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  icon: 'w-10 h-10 p-0',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  as,
  href,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-ring',
    variants[variant],
    sizes[size],
    className,
  )

  if (as === 'a' && href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
