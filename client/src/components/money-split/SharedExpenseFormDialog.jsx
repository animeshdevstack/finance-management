import { useEffect, useMemo, useState } from "react"

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
import { createGroupExpense } from "@/shared/api/group.api"

const AMOUNT_INPUT_PATTERN = /^-?\d*\.?\d*$/

export function SharedExpenseFormDialog({
  open,
  onOpenChange,
  groupId,
  members = [],
  currentUserId,
  onSuccess,
  onError,
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [paidByUserId, setPaidByUserId] = useState("")
  const [participantUserIds, setParticipantUserIds] = useState([])
  const [loading, setLoading] = useState(false)

  const memberOptions = useMemo(
    () => members.map((member) => ({ value: member.userId, label: member.Name })),
    [members]
  )

  useEffect(() => {
    if (!open) {
      setTitle("")
      setDescription("")
      setAmount("")
      setPaidByUserId(currentUserId || "")
      setParticipantUserIds(members.map((member) => member.userId))
      setLoading(false)
      return
    }

    setPaidByUserId(currentUserId || members[0]?.userId || "")
    setParticipantUserIds(members.map((member) => member.userId))
  }, [open, members, currentUserId])

  const toggleParticipant = (userId) => {
    setParticipantUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const parsedAmount = Number(amount)
    if (!title.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      onError?.(new Error("Enter a valid title and amount."))
      return
    }
    if (participantUserIds.length === 0) {
      onError?.(new Error("Select at least one participant."))
      return
    }

    setLoading(true)
    try {
      const result = await createGroupExpense(groupId, {
        title: title.trim(),
        description: description.trim(),
        totalAmount: parsedAmount,
        paidByUserId,
        participantUserIds,
      })
      onSuccess?.(result.expense)
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
            <DialogTitle>Add shared expense</DialogTitle>
            <DialogDescription>
              Split equally among selected participants.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="expense-title">Title</Label>
              <Input
                id="expense-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-description">Description</Label>
              <Input
                id="expense-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(event) => {
                  const { value } = event.target
                  if (value === "" || AMOUNT_INPUT_PATTERN.test(value)) {
                    setAmount(value)
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-payer">Paid by</Label>
              <select
                id="expense-payer"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={paidByUserId}
                onChange={(event) => setPaidByUserId(event.target.value)}
                required
              >
                {memberOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Split equally between</Label>
              <div className="space-y-2 rounded-md border p-3">
                {memberOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={participantUserIds.includes(option.value)}
                      onChange={() => toggleParticipant(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
