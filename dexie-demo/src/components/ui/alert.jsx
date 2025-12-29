import * as React from "react"
import { cn } from "@/lib/utils"

const AlertDialog = React.forwardRef(({ className, ...props }, ref) =>
  <div
    ref={ref}
    className={cn("rounded-lg border border-slate-200 bg-white p-4 text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50", className)}
    {...props}
  />
)
AlertDialog.displayName = "AlertDialog"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) =>
  <h2
    ref={ref}
    className={cn("mb-2 font-semibold leading-tight", className)}
    {...props}
  />
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) =>
  <div
    ref={ref}
    className={cn("text-sm", className)}
    {...props}
  />
)
AlertDescription.displayName = "AlertDescription"

export { AlertDialog, AlertTitle, AlertDescription }
