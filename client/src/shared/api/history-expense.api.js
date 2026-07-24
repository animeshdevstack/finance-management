import { get, post, put, remove } from "@/shared/api/http"

export function getHistoryExpenses({
  categoryId,
  year,
  month,
  page = 1,
  limit = 20,
} = {}) {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
    page: String(page),
    limit: String(limit),
  })
  if (categoryId) {
    params.set("categoryId", categoryId)
  }
  return get(`/history-expenses?${params.toString()}`)
}

export function getHistoryExpenseAnalytics({ categoryId, start, end } = {}) {
  const params = new URLSearchParams({
    start: start instanceof Date ? start.toISOString() : String(start),
    end: end instanceof Date ? end.toISOString() : String(end),
  })
  if (categoryId) {
    params.set("categoryId", categoryId)
  }
  return get(`/history-expenses/analytics?${params.toString()}`)
}

export function getHistoryExpense(id) {
  return get(`/history-expenses/${id}`)
}

export function createHistoryExpense({ categoryId, amount, description }) {
  return post("/history-expenses", {
    categoryId,
    amount: Number(amount),
    description,
  })
}

export function updateHistoryExpense(id, { Amount, Description }) {
  const body = {}
  if (Amount != null) body.Amount = Number(Amount)
  if (Description != null) body.Description = Description
  return put(`/history-expenses/${id}`, body)
}

export function deleteHistoryExpense(id) {
  return remove(`/history-expenses/${id}`)
}
