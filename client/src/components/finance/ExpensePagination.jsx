import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/shared/lib/utils"

export const EXPENSE_PAGE_SIZE_OPTIONS = [20, 50, 100]

function getPageItems(page, totalPages, siblingCount = 1) {
  if (totalPages <= 1) return [1]

  const pages = new Set([1, totalPages])

  for (let i = page - siblingCount; i <= page + siblingCount; i += 1) {
    if (i >= 1 && i <= totalPages) {
      pages.add(i)
    }
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const items = []

  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      items.push("ellipsis")
    }
    items.push(sorted[i])
  }

  return items
}

export function ExpensePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  loading = false,
}) {
  if (total === 0) return null

  const pageItems = getPageItems(page, totalPages)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
      <select
        id="expense-page-size"
        aria-label="Items per page"
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={String(limit)}
        disabled={loading}
        onChange={(event) => onLimitChange(Number(event.target.value))}
      >
        {EXPENSE_PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={String(size)}>
            {size} per page
          </option>
        ))}
      </select>

      {totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center gap-1"
          aria-label="Expense pagination"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>

          {pageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? "default" : "outline"}
                size="sm"
                className={cn("min-w-8 px-2")}
                disabled={loading || item === page}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </Button>
            )
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </nav>
      )}
    </div>
  )
}
