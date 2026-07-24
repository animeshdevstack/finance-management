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

const AMOUNT_INPUT_PATTERN = /^-?\d*\.?\d*$/

function parseAmount(value) {
  const trimmed = value.trim()
  const parsed = Number(trimmed)

  if (!trimmed || trimmed === "-" || trimmed === "." || Number.isNaN(parsed)) {
    return null
  }

  return parsed
}

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

  const handleAmountChange = (event) => {
    const { value } = event.target
    if (value === "" || AMOUNT_INPUT_PATTERN.test(value)) {
      setAmount(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const parsedAmount = parseAmount(amount)
    if (parsedAmount == null) {
      onError?.(new Error("Enter a valid amount."))
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await updateHistoryExpense(expense._id, {
          Amount: parsedAmount,
          Description: description,
        })
      } else {
        await createHistoryExpense({
          categoryId,
          amount: parsedAmount,
          description,
        })
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
              Enter the amount and a short description. Use a negative amount for
              refunds or credits.
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
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                onChange={handleAmountChange}
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
