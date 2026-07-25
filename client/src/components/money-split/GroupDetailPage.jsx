import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Plus } from "lucide-react"

import { BalanceSummary } from "@/components/money-split/BalanceSummary"
import { ConfirmDialog } from "@/components/finance/ConfirmDialog"
import { MemberList } from "@/components/money-split/MemberList"
import { SharedExpenseFormDialog } from "@/components/money-split/SharedExpenseFormDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  deleteGroupExpense,
  getGroup,
  getGroupBalances,
  getGroupExpenses,
} from "@/shared/api/group.api"
import { useAuth } from "@/shared/hooks/useAuth"
import { notifyDeleted, notifyError, notifyCreated } from "@/shared/lib/notify"

export function GroupDetailPage() {
  const { user } = useAuth()
  const { groupId } = useParams()

  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState({ memberBalances: [], settlements: [] })
  const [loading, setLoading] = useState(true)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        getGroup(groupId),
        getGroupExpenses(groupId),
        getGroupBalances(groupId),
      ])
      setGroup(groupRes.group)
      setExpenses(expensesRes.expenses || [])
      setBalances({
        memberBalances: balancesRes.memberBalances || [],
        settlements: balancesRes.settlements || [],
      })
    } catch (err) {
      notifyError(err)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleDeleteExpense = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteGroupExpense(groupId, deleteTarget._id)
      notifyDeleted("Expense deleted")
      setDeleteTarget(null)
      fetchAll()
    } catch (err) {
      notifyError(err)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading group...</p>
  }

  if (!group) {
    return <p className="text-sm text-muted-foreground">Group not found.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 px-0">
            <Link to="/money-split">
              <ArrowLeft className="size-4" />
              Back to groups
            </Link>
          </Button>
          <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)]">
            {group.name}
          </h2>
          <p className="text-sm text-muted-foreground capitalize">{group.type} split</p>
        </div>
        <Button onClick={() => setExpenseDialogOpen(true)}>
          <Plus className="size-4" />
          Add expense
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberList members={group.members || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceSummary
              memberBalances={balances.memberBalances}
              settlements={balances.settlements}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses yet.</p>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense._id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-md border px-3 py-3"
              >
                <div>
                  <p className="font-medium">{expense.title}</p>
                  {expense.description && (
                    <p className="text-sm text-muted-foreground">{expense.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Paid by {expense.paidByName} ·{" "}
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">₹{Number(expense.totalAmount).toFixed(2)}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(expense)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <SharedExpenseFormDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        groupId={groupId}
        members={group.members || []}
        currentUserId={user?._id}
        onSuccess={() => {
          notifyCreated("Expense added")
          fetchAll()
        }}
        onError={notifyError}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete expense"
        description="Delete this shared expense? Balances will be recalculated."
        confirmLabel="Delete expense"
        onConfirm={handleDeleteExpense}
        loading={deleteLoading}
      />
    </div>
  )
}
