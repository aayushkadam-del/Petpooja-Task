import * as React from "react"
import { cn } from "@/lib/utils"

const FormField = React.forwardRef(({ className, ...props }, ref) =>
  <div
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  />
)
FormField.displayName = "FormField"

const FormLabel = React.forwardRef(({ className, ...props }, ref) =>
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
)
FormLabel.displayName = "FormLabel"

const FormMessage = React.forwardRef(({ className, ...props }, ref) =>
  <p
    ref={ref}
    className={cn("text-sm font-medium text-red-500 dark:text-red-400", className)}
    {...props}
  />
)
FormMessage.displayName = "FormMessage"

export { FormField, FormLabel, FormMessage }
