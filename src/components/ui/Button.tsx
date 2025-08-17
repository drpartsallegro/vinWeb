import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-card hover:bg-primary-2 hover:shadow-float",
        secondary: "bg-surface-2 text-text border border-border hover:bg-surface-3 hover:border-primary/50",
        outline: "border-2 border-border bg-transparent text-text hover:bg-surface hover:border-primary",
        "outline-primary": "border-2 border-primary/30 bg-transparent text-primary hover:bg-primary/5 hover:border-primary/50 hover:text-primary/80",
        "outline-primary-full": "border-2 border-primary/30 bg-transparent text-primary hover:bg-primary/5 hover:border-primary/50 hover:text-primary/80 w-full",
        ghost: "text-text hover:bg-surface hover:text-primary",
        "ghost-primary": "border-2 border-border/30 bg-transparent text-text hover:border-border/50 hover:bg-surface-2 hover:text-primary",
        "ghost-duplicate": "text-text hover:bg-surface hover:text-primary w-full",
        destructive: "bg-danger text-white shadow-card hover:bg-red-600 hover:shadow-float",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        gradient: "bg-gradient-to-r from-primary to-primary-2 text-white shadow-card hover:shadow-float",
        primary: "bg-primary text-white shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-200",
        "primary-checkout": "bg-primary text-white shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-200",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading
    
    const content = (
      <>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </>
    )
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

