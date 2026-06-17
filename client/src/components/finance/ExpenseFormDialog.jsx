import { useEffect, useState } from "react"

import { CategorySelect } from "@/components/finance/CategorySelect"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createHistoryExpense,
  updateHistoryExpense,
} from "@/shared/api/history-expense.api"

export function ExpenseFormDialog({
  open,
  onOpenChange,
  categories,
  expense,
  defaultCategoryId,
  onSuccess,
  onError,
}) {
  const isEdit = Boolean(expense)
  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setCategoryId(
        expense?.CategoryId?._id || expense?.CategoryId || defaultCategoryId || ""
      )
      setAmount(expense?.Amount != null ? String(expense.Amount) : "")
      setDescription(expense?.Description || "")
    }
  }, [open, expense, defaultCategoryId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await updateHistoryExpense(expense._id, { Amount: amount, Description: description })
      } else {
        await createHistoryExpense({ categoryId, amount, description })
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Expense" : "Add Expense"}</DialogTitle>
            <DialogDescription>
              Enter the amount and a short description for this expense.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isEdit && (
              <CategorySelect
                categories={categories}
                value={categoryId}
                onChange={setCategoryId}
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 35 or -10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-description">Description</Label>
              <Input
                id="expense-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lunch at cafe"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!isEdit && !categoryId)}>
              {loading ? "Saving..." : isEdit ? "Save changes" : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
