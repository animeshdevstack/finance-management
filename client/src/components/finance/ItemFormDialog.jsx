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
import { createItem, getCurrentMonthYear, updateItem } from "@/shared/api/item.api"

export function ItemFormDialog({ open, onOpenChange, item, onSuccess, onError }) {
  const isEdit = Boolean(item)
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setName(item?.Name || "")
      setAmount("")
    }
  }, [open, item])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await updateItem(item._id, { Name: name, MonthYear: item.MonthYear })
      } else {
        await createItem({
          Name: name,
          MonthYear: getCurrentMonthYear(),
          Amount: amount,
        })
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
            <DialogTitle>{isEdit ? "Edit Item" : "Create Item"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the item name. Total is calculated from expenses."
                : "Add a new tracking item. You can optionally set an initial amount."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Breakfast"
                required
              />
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="item-amount">Initial amount (optional)</Label>
                <Input
                  id="item-amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 35"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save changes" : "Create item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
