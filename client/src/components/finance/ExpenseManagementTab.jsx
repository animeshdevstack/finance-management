import { useCallback, useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { AmountDisplay } from "@/components/finance/AmountDisplay"
import { ConfirmDialog } from "@/components/finance/ConfirmDialog"
import { ExpenseFormDialog } from "@/components/finance/ExpenseFormDialog"
import { FilterSelect } from "@/components/finance/FilterSelect"
import { ItemFormDialog } from "@/components/finance/ItemFormDialog"
import { ItemSelect } from "@/components/finance/ItemSelect"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  deleteHistoryExpense,
  getHistoryExpenses,
} from "@/shared/api/history-expense.api"
import { getItems } from "@/shared/api/item.api"
import {
  expenseMatchesPeriod,
  filterItemsByMonthYear,
  getCurrentMonth,
  getCurrentYear,
  getMonthOptions,
  getYearOptions,
} from "@/shared/lib/date.utils"
import {
  notifyCreated,
  notifyDeleted,
  notifyError,
  notifyUpdated,
} from "@/shared/lib/notify"

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleString()
}

function getItemName(expense) {
  if (expense.ItemId?.Name) return expense.ItemId.Name
  return "Unknown item"
}

export function ExpenseManagementTab() {
  const [items, setItems] = useState([])
  const [allExpenses, setAllExpenses] = useState([])
  const [filterYear, setFilterYear] = useState(String(getCurrentYear()))
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth())
  const [filterItemId, setFilterItemId] = useState("")
  const [loading, setLoading] = useState(true)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const itemsForPeriod = useMemo(
    () => filterItemsByMonthYear(items, filterYear, filterMonth),
    [items, filterYear, filterMonth]
  )

  const yearOptions = useMemo(
    () => getYearOptions(items).map((year) => ({ value: String(year), label: String(year) })),
    [items]
  )

  const monthOptions = useMemo(
    () => getMonthOptions().map((m) => ({ value: m.value, label: m.label })),
    []
  )

  const expenses = useMemo(() => {
    return allExpenses.filter((expense) => {
      if (!expenseMatchesPeriod(expense, filterYear, filterMonth)) return false
      if (filterItemId && expense.ItemId?._id !== filterItemId && expense.ItemId !== filterItemId) {
        return false
      }
      return true
    })
  }, [allExpenses, filterYear, filterMonth, filterItemId])

  const fetchItems = useCallback(async () => {
    try {
      const res = await getItems()
      setItems(res.items || [])
    } catch (err) {
      notifyError(err.message)
    }
  }, [])

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getHistoryExpenses(filterItemId || undefined)
      setAllExpenses(res.data || [])
    } catch (err) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filterItemId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  useEffect(() => {
    if (!filterItemId) return
    const stillValid = itemsForPeriod.some((item) => item._id === filterItemId)
    if (!stillValid) setFilterItemId("")
  }, [filterItemId, itemsForPeriod])

  const handleClearFilters = () => {
    setFilterYear(String(getCurrentYear()))
    setFilterMonth(getCurrentMonth())
    setFilterItemId("")
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
      fetchItems()
    } catch (err) {
      notifyError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const hasCustomFilters =
    filterYear !== String(getCurrentYear()) ||
    filterMonth !== getCurrentMonth() ||
    filterItemId !== ""

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)]">
            Expense Management
          </h2>
          <p className="text-sm text-muted-foreground">
            View and manage expense entries by year, month, and item.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setItemDialogOpen(true)}>
            <Plus className="size-4" />
            Create new
          </Button>
          <Button onClick={handleAddExpense} disabled={itemsForPeriod.length === 0}>
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
        <ItemSelect
          items={itemsForPeriod}
          value={filterItemId}
          onChange={setFilterItemId}
          label="Filter by item"
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
            {itemsForPeriod.length === 0
              ? "No items for this month. Create an item or change the year/month filters."
              : "No expenses found for this filter."}
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/50 text-left">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id} className="border-b last:border-0">
                  <td className="px-4 py-3">{getItemName(expense)}</td>
                  <td className="px-4 py-3">
                    <AmountDisplay value={expense.Amount} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(expense.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditExpense(expense)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteTarget(expense)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ItemFormDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        onSuccess={() => {
          notifyCreated("Item created")
          fetchItems()
        }}
        onError={notifyError}
      />

      <ExpenseFormDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        items={itemsForPeriod}
        expense={editingExpense}
        onSuccess={() => {
          if (editingExpense) {
            notifyUpdated("Expense updated")
          } else {
            notifyCreated("Expense added")
          }
          fetchExpenses()
          fetchItems()
        }}
        onError={notifyError}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete expense"
        description="Delete this expense? The item total will be adjusted. This cannot be undone."
        confirmLabel="Delete expense"
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
