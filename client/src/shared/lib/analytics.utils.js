function getCategoryId(expense) {
  return expense.CategoryId?._id || expense.CategoryId || "unknown"
}

function getCategoryName(expense) {
  if (expense.CategoryId?.Name) return expense.CategoryId.Name
  return "Unknown category"
}

export function aggregateByCategory(expenses) {
  const map = new Map()

  for (const expense of expenses) {
    const categoryId = getCategoryId(expense)
    const name = getCategoryName(expense)
    const amount = Number(expense.Amount) || 0

    if (!map.has(categoryId)) {
      map.set(categoryId, { categoryId, name, total: 0, count: 0 })
    }

    const entry = map.get(categoryId)
    entry.total += amount
    entry.count += 1
  }

  return [...map.values()]
    .filter((entry) => entry.total !== 0)
    .sort((a, b) => b.total - a.total)
}

export function getAnalyticsSummary(expenses) {
  const totalSpend = expenses.reduce(
    (sum, expense) => sum + (Number(expense.Amount) || 0),
    0
  )
  const transactionCount = expenses.length
  const byCategory = aggregateByCategory(expenses)
  const topCategory = byCategory[0] ?? null

  return {
    totalSpend,
    transactionCount,
    topCategory,
  }
}
