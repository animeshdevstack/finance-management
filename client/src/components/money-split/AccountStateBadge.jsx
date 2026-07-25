import { cn } from "@/shared/lib/utils"

const STATE_STYLES = {
  active: "bg-emerald-500/15 text-emerald-300",
  pending: "bg-amber-500/15 text-amber-200",
  inactive: "bg-muted text-muted-foreground",
}

export function AccountStateBadge({ state, className = "" }) {
  const label = state ? state.charAt(0).toUpperCase() + state.slice(1) : "Unknown"

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        STATE_STYLES[state] || STATE_STYLES.inactive,
        className
      )}
    >
      {label}
    </span>
  )
}
