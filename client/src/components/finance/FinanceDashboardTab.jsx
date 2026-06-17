import { useCallback, useEffect, useMemo, useState } from "react"

import {
  AnalyticsPeriodFilter,
  getDefaultDashboardFilters,
} from "@/components/finance/AnalyticsPeriodFilter"
import { AnalyticsSummary } from "@/components/finance/AnalyticsSummary"
import { CategorySelect } from "@/components/finance/CategorySelect"
import { CategorySpendChart } from "@/components/finance/CategorySpendChart"
import { ExpenseStatementList } from "@/components/finance/ExpenseStatementList"
import { Card, CardContent } from "@/components/ui/card"
import { getCategories } from "@/shared/api/category.api"
import { getHistoryExpenses } from "@/shared/api/history-expense.api"
import {
  aggregateByCategory,
  getAnalyticsSummary,
} from "@/shared/lib/analytics.utils"
import {
  expenseInRange,
  groupExpensesByDate,
  isValidDateRange,
  resolvePeriodRange,
} from "@/shared/lib/date.utils"
import { notifyError } from "@/shared/lib/notify"

export function FinanceDashboardTab() {
  const defaults = getDefaultDashboardFilters()
  const [categories, setCategories] = useState([])
  const [allExpenses, setAllExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategoryId, setFilterCategoryId] = useState("")
  const [periodMode, setPeriodMode] = useState(defaults.mode)
  const [filterYear, setFilterYear] = useState(defaults.year)
  const [filterMonth, setFilterMonth] = useState(defaults.month)
  const [specificDate, setSpecificDate] = useState(defaults.specificDate)
  const [rangeStart, setRangeStart] = useState(defaults.rangeStart)
  const [rangeEnd, setRangeEnd] = useState(defaults.rangeEnd)

  const periodRange = useMemo(
    () =>
      resolvePeriodRange(periodMode, {
        year: filterYear,
        month: filterMonth,
        specificDate,
        rangeStart,
        rangeEnd,
      }),
    [periodMode, filterYear, filterMonth, specificDate, rangeStart, rangeEnd]
  )

  const rangeIsValid =
    periodMode !== "range" || isValidDateRange(rangeStart, rangeEnd)

  const filteredExpenses = useMemo(() => {
    if (!rangeIsValid) return []

    const { start, end } = periodRange
    return allExpenses.filter((expense) => expenseInRange(expense, start, end))
  }, [allExpenses, periodRange, rangeIsValid])

  const chartData = useMemo(
    () => aggregateByCategory(filteredExpenses),
    [filteredExpenses]
  )

  const summary = useMemo(
    () => getAnalyticsSummary(filteredExpenses),
    [filteredExpenses]
  )

  const groupedExpenses = useMemo(
    () => groupExpensesByDate(filteredExpenses),
    [filteredExpenses]
  )

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories()
      setCategories(res.categories || [])
    } catch (err) {
      notifyError(err)
    }
  }, [])

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getHistoryExpenses(filterCategoryId || undefined)
      setAllExpenses(res.data || [])
    } catch (err) {
      notifyError(err)
    } finally {
      setLoading(false)
    }
  }, [filterCategoryId])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)]">
          Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Analyze spending by period and category.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <AnalyticsPeriodFilter
          mode={periodMode}
          onModeChange={setPeriodMode}
          year={filterYear}
          onYearChange={setFilterYear}
          month={filterMonth}
          onMonthChange={setFilterMonth}
          specificDate={specificDate}
          onSpecificDateChange={setSpecificDate}
          rangeStart={rangeStart}
          onRangeStartChange={setRangeStart}
          rangeEnd={rangeEnd}
          onRangeEndChange={setRangeEnd}
          periodLabel={periodRange.label}
          expenses={allExpenses}
        />

        <CategorySelect
          categories={categories}
          value={filterCategoryId}
          onChange={setFilterCategoryId}
          label="Filter by category"
          required={false}
          allowAll
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading analytics...</p>
      ) : !rangeIsValid ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Select a valid date range to view analytics.
          </CardContent>
        </Card>
      ) : (
        <>
          <AnalyticsSummary summary={summary} />

          <CategorySpendChart data={chartData} periodLabel={periodRange.label} />

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Expense history</h3>
            {groupedExpenses.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No expenses found for this period.
                </CardContent>
              </Card>
            ) : (
              <ExpenseStatementList groups={groupedExpenses} readOnly />
            )}
          </div>
        </>
      )}
    </div>
  )
}
