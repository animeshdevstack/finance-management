import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Receipt, Trash2 } from "lucide-react"

import { AmountDisplay } from "@/components/finance/AmountDisplay"
import { CategoryFormDialog } from "@/components/finance/CategoryFormDialog"
import { ConfirmDialog } from "@/components/finance/ConfirmDialog"
import { ExpenseFormDialog } from "@/components/finance/ExpenseFormDialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { deleteCategory, getCategories, getCurrentMonthYear } from "@/shared/api/category.api"
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

export function CategoriesTab() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [expenseCategoryId, setExpenseCategoryId] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCategories(getCurrentMonthYear())
      setCategories(res.categories || [])
    } catch (err) {
      notifyError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreate = () => {
    setEditingCategory(null)
    setCategoryDialogOpen(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setCategoryDialogOpen(true)
  }

  const handleAddExpense = (category) => {
    setExpenseCategoryId(category._id)
    setExpenseDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteCategory(deleteTarget._id)
      notifyDeleted(`"${deleteTarget.Name}" deleted`)
      setDeleteTarget(null)
      fetchCategories()
    } catch (err) {
      notifyError(err)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)]">
            Categories
          </h2>
          <p className="text-sm text-muted-foreground">
            Track spending by category for the current month.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4" />
          Create category
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading categories...</p>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No categories yet. Create your first category to start tracking expenses.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category._id}>
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>{category.Name}</CardTitle>
                  <CardDescription>
                    {category.lastActivity
                      ? `Last activity ${formatDate(category.lastActivity)}`
                      : "No activity this month"}
                  </CardDescription>
                </div>
                <AmountDisplay value={category.monthTotal ?? 0} className="text-lg" />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleAddExpense(category)}>
                  <Receipt className="size-4" />
                  Add expense
                </Button>
                {!category.isDefault && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDeleteTarget(category)}>
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSuccess={() => {
          if (editingCategory) {
            notifyUpdated("Category updated")
          } else {
            notifyCreated("Category created")
          }
          fetchCategories()
        }}
        onError={notifyError}
      />

      <ExpenseFormDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        categories={categories}
        defaultCategoryId={expenseCategoryId}
        onSuccess={() => {
          notifyCreated("Expense added")
          fetchCategories()
        }}
        onError={notifyError}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete category"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.Name}" and all its expenses? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete category"
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
