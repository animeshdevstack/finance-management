import { FilterSelect } from "@/components/finance/FilterSelect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getCurrentMonth,
  getCurrentYear,
  getMonthOptions,
  getYearOptions,
  isValidDateRange,
  toDateKey,
} from "@/shared/lib/date.utils"
import { cn } from "@/shared/lib/utils"

const PERIOD_MODES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "Monthly" },
  { value: "date", label: "Specific date" },
  { value: "range", label: "Date range" },
]

export function AnalyticsPeriodFilter({
  mode,
  onModeChange,
  year,
  onYearChange,
  month,
  onMonthChange,
  specificDate,
  onSpecificDateChange,
  rangeStart,
  onRangeStartChange,
  rangeEnd,
  onRangeEndChange,
  periodLabel,
  expenses = [],
}) {
  const yearOptions = getYearOptions(expenses).map((y) => ({
    value: String(y),
    label: String(y),
  }))

  const monthOptions = getMonthOptions().map((m) => ({
    value: m.value,
    label: m.label,
  }))

  const rangeInvalid =
    mode === "range" && !isValidDateRange(rangeStart, rangeEnd)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PERIOD_MODES.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={mode === option.value ? "default" : "outline"}
            onClick={() => onModeChange(option.value)}
            className={cn(mode === option.value && "pointer-events-none")}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {mode === "week" && periodLabel && (
        <p className="text-sm text-muted-foreground">{periodLabel}</p>
      )}

      {mode === "month" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FilterSelect
            id="dashboard-filter-year"
            label="Year"
            value={year}
            onChange={onYearChange}
            options={yearOptions.length > 0 ? yearOptions : [{ value: String(getCurrentYear()), label: String(getCurrentYear()) }]}
          />
          <FilterSelect
            id="dashboard-filter-month"
            label="Month"
            value={month}
            onChange={onMonthChange}
            options={monthOptions}
          />
        </div>
      )}

      {mode === "date" && (
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="dashboard-specific-date">Date</Label>
          <Input
            id="dashboard-specific-date"
            type="date"
            value={specificDate}
            onChange={(e) => onSpecificDateChange(e.target.value)}
          />
        </div>
      )}

      {mode === "range" && (
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="dashboard-range-start">Start date</Label>
            <Input
              id="dashboard-range-start"
              type="date"
              value={rangeStart}
              onChange={(e) => onRangeStartChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-range-end">End date</Label>
            <Input
              id="dashboard-range-end"
              type="date"
              value={rangeEnd}
              onChange={(e) => onRangeEndChange(e.target.value)}
            />
          </div>
          {rangeInvalid && (
            <p className="text-sm text-red-400 sm:col-span-2">
              End date must be on or after the start date.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function getDefaultDashboardFilters() {
  const today = toDateKey(new Date())
  return {
    mode: "today",
    year: String(getCurrentYear()),
    month: getCurrentMonth(),
    specificDate: today,
    rangeStart: today,
    rangeEnd: today,
  }
}
