import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { CategoryFormDialog } from "@/components/finance/CategoryFormDialog"
import { CategorySelect } from "@/components/finance/CategorySelect"
import { ConfirmDialog } from "@/components/finance/ConfirmDialog"
import { ExpenseFormDialog } from "@/components/finance/ExpenseFormDialog"
import { ExpenseStatementList } from "@/components/finance/ExpenseStatementList"
import { FilterSelect } from "@/components/finance/FilterSelect"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCategories } from "@/shared/api/category.api"
import {
  deleteHistoryExpense,
  getHistoryExpenses,
} from "@/shared/api/history-expense.api"
import {
  expenseMatchesPeriod,
  getCurrentMonth,
  getCurrentYear,
  getMonthOptions,
  getYearOptions,
  groupExpensesByDate,
} from "@/shared/lib/date.utils"
import {
  notifyCreated,
  notifyDeleted,
  notifyError,
  notifyUpdated,
} from "@/shared/lib/notify"

export function ExpenseManagementTab() {
  const [categories, setCategories] = useState([])
  const [allExpenses, setAllExpenses] = useState([])
  const [filterYear, setFilterYear] = useState(String(getCurrentYear()))
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth())
  const [filterCategoryId, setFilterCategoryId] = useState("")
  const [loading, setLoading] = useState(true)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const yearOptions = useMemo(
    () => getYearOptions(allExpenses).map((year) => ({ value: String(year), label: String(year) })),
    [allExpenses]
  )

  const monthOptions = useMemo(
    () => getMonthOptions().map((m) => ({ value: m.value, label: m.label })),
    []
  )

  const expenses = useMemo(() => {
    return allExpenses.filter((expense) => {
      if (!expenseMatchesPeriod(expense, filterYear, filterMonth)) return false
      if (
        filterCategoryId &&
        expense.CategoryId?._id !== filterCategoryId &&
        expense.CategoryId !== filterCategoryId
      ) {
        return false
      }
      return true
    })
  }, [allExpenses, filterYear, filterMonth, filterCategoryId])

  const groupedExpenses = useMemo(
    () => groupExpensesByDate(expenses),
    [expenses]
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

  const handleClearFilters = () => {
    setFilterYear(String(getCurrentYear()))
    setFilterMonth(getCurrentMonth())
    setFilterCategoryId("")
  }

  const handleAddExpense = () => {
    setEditingExpense(null)
    setExpenseDialogOpen(true)
  }

  const handleEditExpense = (expense) => {
    setEditingExpense(expense)
    setExpenseDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteHistoryExpense(deleteTarget._id)
      notifyDeleted("Expense deleted")
      setDeleteTarget(null)
      fetchExpenses()
      fetchCategories()
    } catch (err) {
      notifyError(err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const hasCustomFilters =
    filterYear !== String(getCurrentYear()) ||
    filterMonth !== getCurrentMonth() ||
    filterCategoryId !== ""

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)]">
            Expense Management
          </h2>
          <p className="text-sm text-muted-foreground">
            View and manage expense entries by year, month, and category.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
            <Plus className="size-4" />
            Create category
          </Button>
          <Button onClick={handleAddExpense}>
            <Plus className="size-4" />
            Add expense
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FilterSelect
          id="filter-year"
          label="Year"
          value={filterYear}
          onChange={setFilterYear}
          options={yearOptions}
        />
        <FilterSelect
          id="filter-month"
          label="Month"
          value={filterMonth}
          onChange={setFilterMonth}
          options={monthOptions}
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

      {hasCustomFilters && (
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={handleClearFilters}
        >
          Reset filters to current month
        </button>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No expenses found for this filter.
          </CardContent>
        </Card>
      ) : (
        <ExpenseStatementList
          groups={groupedExpenses}
          onEdit={handleEditExpense}
          onDelete={setDeleteTarget}
        />
      )}

      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSuccess={() => {
          notifyCreated("Category created")
          fetchCategories()
        }}
        onError={notifyError}
      />

      <ExpenseFormDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        categories={categories}
        expense={editingExpense}
        onSuccess={() => {
          if (editingExpense) {
            notifyUpdated("Expense updated")
          } else {
            notifyCreated("Expense added")
          }
          fetchExpenses()
          fetchCategories()
        }}
        onError={notifyError}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete expense"
        description="Delete this expense? This cannot be undone."
        confirmLabel="Delete expense"
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
