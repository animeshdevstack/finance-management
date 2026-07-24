import { useCallback, useEffect, useMemo, useState } from "react"
import { FileUp, Plus } from "lucide-react"

import { CategoryFormDialog } from "@/components/finance/CategoryFormDialog"
import { CategorySelect } from "@/components/finance/CategorySelect"
import { ConfirmDialog } from "@/components/finance/ConfirmDialog"
import { ExpenseFormDialog } from "@/components/finance/ExpenseFormDialog"
import { ExpensePagination, EXPENSE_PAGE_SIZE_OPTIONS } from "@/components/finance/ExpensePagination"
import { ExpenseStatementList } from "@/components/finance/ExpenseStatementList"
import { FilterSelect } from "@/components/finance/FilterSelect"
import { StatementImportDialog } from "@/components/finance/StatementImportDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCategories } from "@/shared/api/category.api"
import {
  deleteHistoryExpense,
  getHistoryExpenses,
} from "@/shared/api/history-expense.api"
import {
  getCurrentMonth,
  getCurrentYear,
  getFixedYearOptions,
  getMonthOptions,
  groupExpensesByDate,
} from "@/shared/lib/date.utils"
import {
  notifyCreated,
  notifyDeleted,
  notifyError,
  notifyUpdated,
} from "@/shared/lib/notify"

const DEFAULT_PAGINATION = { page: 1, limit: 20, total: 0, totalPages: 0 }

export function ExpenseManagementTab() {
  const [categories, setCategories] = useState([])
  const [expenses, setExpenses] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(EXPENSE_PAGE_SIZE_OPTIONS[0])
  const [filterYear, setFilterYear] = useState(String(getCurrentYear()))
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth())
  const [filterCategoryId, setFilterCategoryId] = useState("")
  const [loading, setLoading] = useState(true)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const yearOptions = useMemo(
    () =>
      getFixedYearOptions().map((year) => ({
        value: String(year),
        label: String(year),
      })),
    []
  )

  const monthOptions = useMemo(
    () => getMonthOptions().map((m) => ({ value: m.value, label: m.label })),
    []
  )

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
      const res = await getHistoryExpenses({
        categoryId: filterCategoryId || undefined,
        year: filterYear,
        month: filterMonth,
        page,
        limit: pageSize,
      })
      setExpenses(res.data || [])
      setPagination(res.pagination || DEFAULT_PAGINATION)
    } catch (err) {
      notifyError(err)
    } finally {
      setLoading(false)
    }
  }, [filterCategoryId, filterYear, filterMonth, page, pageSize])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (importDialogOpen) {
      fetchCategories()
    }
  }, [importDialogOpen, fetchCategories])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const handleFilterYearChange = (value) => {
    setFilterYear(value)
    setPage(1)
  }

  const handleFilterMonthChange = (value) => {
    setFilterMonth(value)
    setPage(1)
  }

  const handleFilterCategoryChange = (value) => {
    setFilterCategoryId(value)
    setPage(1)
  }

  const handlePageSizeChange = (value) => {
    setPageSize(value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilterYear(String(getCurrentYear()))
    setFilterMonth(getCurrentMonth())
    setFilterCategoryId("")
    setPage(1)
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
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <FileUp className="size-4" />
            Import statement
          </Button>
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
          onChange={handleFilterYearChange}
          options={yearOptions}
        />
        <FilterSelect
          id="filter-month"
          label="Month"
          value={filterMonth}
          onChange={handleFilterMonthChange}
          options={monthOptions}
        />
        <CategorySelect
          categories={categories}
          value={filterCategoryId}
          onChange={handleFilterCategoryChange}
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
        <>
          <ExpenseStatementList
            groups={groupedExpenses}
            onEdit={handleEditExpense}
            onDelete={setDeleteTarget}
          />
          <ExpensePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pageSize}
            onPageChange={setPage}
            onLimitChange={handlePageSizeChange}
            loading={loading}
          />
        </>
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

      <StatementImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        categories={categories}
        onSuccess={(result) => {
          notifyCreated(
            `Imported ${result.imported} transaction${result.imported === 1 ? "" : "s"}` +
              (result.skipped ? ` (${result.skipped} skipped)` : "")
          )
          fetchExpenses()
          fetchCategories()
        }}
        onError={notifyError}
      />
    </div>
  )
}
