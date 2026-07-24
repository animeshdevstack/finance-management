import { useEffect } from "react"

import { cn } from "@/shared/lib/utils"

export function Dialog({ open, onOpenChange, children, className }) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      />
      <div className={cn("relative z-10 w-full max-w-md", className)}>{children}</div>
    </div>
  )
}

export function DialogContent({ className, children }) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-xl border shadow-lg p-6",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ className, children }) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function DialogTitle({ className, children }) {
  return (
    <h2 className={cn("text-xl font-semibold font-[family-name:var(--font-display)]", className)}>
      {children}
    </h2>
  )
}

export function DialogDescription({ className, children }) {
  return <p className={cn("text-sm text-muted-foreground mt-1", className)}>{children}</p>
}

export function DialogFooter({ className, children }) {
  return <div className={cn("flex justify-end gap-2 mt-6", className)}>{children}</div>
}
