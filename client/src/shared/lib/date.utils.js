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

export function getYearOptions(expenses, currentYear = getCurrentYear()) {
  const years = new Set([currentYear])
  for (const expense of expenses) {
    if (expense?.createdAt) {
      years.add(new Date(expense.createdAt).getFullYear())
    }
  }
  return [...years].sort((a, b) => b - a)
}

export function expenseMatchesPeriod(expense, year, month) {
  if (!expense?.createdAt) return false
  const date = new Date(expense.createdAt)
  return (
    date.getFullYear() === Number(year) &&
    String(date.getMonth() + 1).padStart(2, "0") === month
  )
}

export function toDateKey(dateInput) {
  const date = new Date(dateInput)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getDateGroupLabel(dateKey) {
  const todayKey = toDateKey(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = toDateKey(yesterday)

  if (dateKey === todayKey) return "Today"
  if (dateKey === yesterdayKey) return "Yesterday"

  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatExpenseTime(dateStr) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function groupExpensesByDate(expenses) {
  const groupsMap = new Map()

  for (const expense of expenses) {
    if (!expense?.createdAt) continue

    const dateKey = toDateKey(expense.createdAt)
    if (!groupsMap.has(dateKey)) {
      groupsMap.set(dateKey, {
        dateKey,
        label: getDateGroupLabel(dateKey),
        total: 0,
        expenses: [],
      })
    }

    const group = groupsMap.get(dateKey)
    group.expenses.push(expense)
    group.total += Number(expense.Amount) || 0
  }

  return [...groupsMap.values()]
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .map((group) => ({
      ...group,
      expenses: group.expenses.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    }))
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getTodayRange() {
  const now = new Date()
  return { start: startOfDay(now), end: endOfDay(now) }
}

export function getWeekRange(dateInput = new Date()) {
  const date = new Date(dateInput)
  const day = date.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  const monday = new Date(date)
  monday.setDate(date.getDate() + diffToMonday)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return { start: startOfDay(monday), end: endOfDay(sunday) }
}

export function getMonthRange(year, month) {
  const start = new Date(Number(year), Number(month) - 1, 1)
  const end = new Date(Number(year), Number(month), 0)
  return { start: startOfDay(start), end: endOfDay(end) }
}

export function getDayRange(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return { start: startOfDay(date), end: endOfDay(date) }
}

export function expenseInRange(expense, start, end) {
  if (!expense?.createdAt) return false
  const date = new Date(expense.createdAt)
  return date >= start && date <= end
}

function formatShortDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function resolvePeriodRange(mode, options = {}) {
  const {
    year = getCurrentYear(),
    month = getCurrentMonth(),
    specificDate = toDateKey(new Date()),
    rangeStart = toDateKey(new Date()),
    rangeEnd = toDateKey(new Date()),
  } = options

  switch (mode) {
    case "today": {
      const { start, end } = getTodayRange()
      return { start, end, label: "Today" }
    }
    case "week": {
      const { start, end } = getWeekRange()
      return {
        start,
        end,
        label: `${formatShortDate(start)} – ${formatShortDate(end)}`,
      }
    }
    case "month": {
      const { start, end } = getMonthRange(year, month)
      return {
        start,
        end,
        label: `${getMonthLabel(month)} ${year}`,
      }
    }
    case "date": {
      const { start, end } = getDayRange(specificDate)
      const [y, m, d] = specificDate.split("-").map(Number)
      const label = new Date(y, m - 1, d).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      return { start, end, label }
    }
    case "range": {
      const startRange = getDayRange(rangeStart)
      const endRange = getDayRange(rangeEnd)
      const start = startRange.start
      const end = endRange.end
      const [sy, sm, sd] = rangeStart.split("-").map(Number)
      const [ey, em, ed] = rangeEnd.split("-").map(Number)
      const startLabel = new Date(sy, sm - 1, sd).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      const endLabel = new Date(ey, em - 1, ed).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      return { start, end, label: `${startLabel} – ${endLabel}` }
    }
    default:
      return resolvePeriodRange("today")
  }
}

export function isValidDateRange(rangeStart, rangeEnd) {
  if (!rangeStart || !rangeEnd) return false
  return rangeStart <= rangeEnd
}
