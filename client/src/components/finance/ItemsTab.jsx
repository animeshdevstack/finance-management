import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Receipt, Trash2 } from "lucide-react"

import { AmountDisplay } from "@/components/finance/AmountDisplay"
import { ConfirmDialog } from "@/components/finance/ConfirmDialog"
import { ExpenseFormDialog } from "@/components/finance/ExpenseFormDialog"
import { ItemFormDialog } from "@/components/finance/ItemFormDialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { deleteItem, getItems } from "@/shared/api/item.api"
import {
  notifyCreated,
  notifyDeleted,
  notifyError,
  notifyUpdated,
} from "@/shared/lib/notify"

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString()
}

export function ItemsTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [expenseItemId, setExpenseItemId] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getItems()
      setItems(res.items || [])
    } catch (err) {
      notifyError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleCreate = () => {
    setEditingItem(null)
    setItemDialogOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setItemDialogOpen(true)
  }

  const handleAddExpense = (item) => {
    setExpenseItemId(item._id)
    setExpenseDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteItem(deleteTarget._id)
      notifyDeleted(`"${deleteTarget.Name}" deleted`)
      setDeleteTarget(null)
      fetchItems()
    } catch (err) {
      notifyError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)]">Items</h2>
          <p className="text-sm text-muted-foreground">
            Create budget items and track their running totals.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4" />
          Create item
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading items...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No items yet. Create your first item to start tracking expenses.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item._id}>
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>{item.Name}</CardTitle>
                  <CardDescription>
                    {item.MonthYear} · Updated {formatDate(item.updatedAt)}
                  </CardDescription>
                </div>
                <AmountDisplay value={item.TotalAmount} className="text-lg" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleAddExpense(item)}>
                  <Receipt className="size-4" />
                  Add expense
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDeleteTarget(item)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ItemFormDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        item={editingItem}
        onSuccess={() => {
          if (editingItem) {
            notifyUpdated("Item updated")
          } else {
            notifyCreated("Item created")
          }
          fetchItems()
        }}
        onError={notifyError}
      />

      <ExpenseFormDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        items={items}
        defaultItemId={expenseItemId}
        onSuccess={() => {
          notifyCreated("Expense added")
          fetchItems()
        }}
        onError={notifyError}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete item"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.Name}" and all its expenses? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete item"
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
