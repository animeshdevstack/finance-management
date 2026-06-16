import { useEffect, useState } from "react"

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
import { ItemSelect } from "@/components/finance/ItemSelect"
import {
  createHistoryExpense,
  updateHistoryExpense,
} from "@/shared/api/history-expense.api"

export function ExpenseFormDialog({
  open,
  onOpenChange,
  items,
  expense,
  defaultItemId,
  onSuccess,
  onError,
}) {
  const isEdit = Boolean(expense)
  const [itemId, setItemId] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setItemId(expense?.ItemId?._id || expense?.ItemId || defaultItemId || "")
      setAmount(expense?.Amount != null ? String(expense.Amount) : "")
    }
  }, [open, expense, defaultItemId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await updateHistoryExpense(expense._id, { Amount: amount })
      } else {
        await createHistoryExpense({ itemId, amount })
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      onError?.(err.message)
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
              Enter a positive or negative amount. Negative values reduce the item total.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isEdit && (
              <ItemSelect items={items} value={itemId} onChange={setItemId} />
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!isEdit && !itemId)}>
              {loading ? "Saving..." : isEdit ? "Save changes" : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
