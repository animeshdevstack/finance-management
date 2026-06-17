import { get, post, put, remove } from "@/shared/api/http"

export function getHistoryExpenses(categoryId) {
  const query = categoryId ? `?categoryId=${categoryId}` : ""
  return get(`/history-expenses${query}`)
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
