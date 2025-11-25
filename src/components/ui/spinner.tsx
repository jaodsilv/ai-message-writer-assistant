import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

const sizeClasses = {
  sm: 'h-4 w-4',
  default: 'h-6 w-6',
  lg: 'h-8 w-8',
} as const

export interface SpinnerProps {
  size?: keyof typeof sizeClasses
  className?: string
}

function Spinner({ size = 'default', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin motion-reduce:animate-none',
        sizeClasses[size],
        className
      )}
    />
  )
}

export { Spinner }
