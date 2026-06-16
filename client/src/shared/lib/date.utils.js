const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

export function getCurrentYear() {
  return new Date().getFullYear()
}

export function getCurrentMonth() {
  return String(new Date().getMonth() + 1).padStart(2, "0")
}

export function toMonthYear(year, month) {
  return `${year}-${month}`
}

export function getMonthLabel(month) {
  return MONTHS.find((m) => m.value === month)?.label ?? month
}

export function getMonthOptions() {
  return MONTHS
}

export function getYearOptions(items, currentYear = getCurrentYear()) {
  const years = new Set([currentYear])
  for (const item of items) {
    if (item.MonthYear) {
      const [year] = item.MonthYear.split("-")
      if (year) years.add(Number(year))
    }
  }
  return [...years].sort((a, b) => b - a)
}

export function filterItemsByMonthYear(items, year, month) {
  const monthYear = toMonthYear(year, month)
  return items.filter((item) => item.MonthYear === monthYear)
}

export function expenseMatchesPeriod(expense, year, month) {
  if (!expense?.createdAt) return false
  const date = new Date(expense.createdAt)
  const matchesDate =
    date.getFullYear() === Number(year) &&
    String(date.getMonth() + 1).padStart(2, "0") === month

  const itemMonthYear = expense.ItemId?.MonthYear
  const matchesItemPeriod = itemMonthYear === toMonthYear(year, month)

  return matchesDate && matchesItemPeriod
}
