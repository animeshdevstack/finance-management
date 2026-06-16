import { cn } from "@/shared/lib/utils"

export function formatAmount(value) {
  const num = Number(value) || 0
  const prefix = num > 0 ? "+" : ""
  return `${prefix}${num.toFixed(2)}`
}

export function AmountDisplay({ value, className }) {
  const num = Number(value) || 0
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        num > 0 && "text-emerald-400",
        num < 0 && "text-red-400",
        num === 0 && "text-muted-foreground",
        className
      )}
    >
      {formatAmount(num)}
    </span>
  )
}
