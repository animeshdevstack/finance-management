import { Pencil, Trash2 } from "lucide-react"

import { AmountDisplay } from "@/components/finance/AmountDisplay"
import { Button } from "@/components/ui/button"
import { formatExpenseTime, getExpenseDate } from "@/shared/lib/date.utils"

function getCategoryName(expense) {
  if (expense.CategoryId?.Name) return expense.CategoryId.Name
  return "Unknown category"
}

function getExpenseLabel(expense) {
  const category = getCategoryName(expense)
  const description = expense.Description?.trim()
  return description ? `${category} · ${description}` : category
}

export function ExpenseStatementList({ groups, onEdit, onDelete, readOnly = false }) {
  return (
    <div className="rounded-xl border overflow-hidden">
      {groups.map((group, groupIndex) => (
        <div key={group.dateKey}>
          <div className="flex items-center justify-between gap-4 border-b bg-secondary/50 px-4 py-3">
            <span className="text-sm font-semibold">{group.label}</span>
            <AmountDisplay value={group.total} className="text-sm" />
          </div>

          {group.expenses.map((expense, expenseIndex) => {
            const isLastInGroup = expenseIndex === group.expenses.length - 1
            const isLastGroup = groupIndex === groups.length - 1

            return (
              <div
                key={expense._id}
                className={`flex items-center gap-4 px-4 py-3 ${
                  !isLastInGroup || !isLastGroup ? "border-b" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{getExpenseLabel(expense)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatExpenseTime(getExpenseDate(expense))}
                  </p>
                </div>

                <AmountDisplay value={expense.Amount} className="shrink-0 text-sm" />

                {!readOnly && (
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(expense)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDelete(expense)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
