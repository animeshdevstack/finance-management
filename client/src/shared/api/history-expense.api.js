import { get, post, put, remove } from "@/shared/api/http"

export function getHistoryExpenses(itemId) {
  const query = itemId ? `?itemId=${itemId}` : ""
  return get(`/history-expenses${query}`)
}

export function getHistoryExpense(id) {
  return get(`/history-expenses/${id}`)
}

export function createHistoryExpense({ itemId, amount }) {
  return post("/history-expenses", { itemId, amount: Number(amount) })
}

export function updateHistoryExpense(id, { Amount }) {
  return put(`/history-expenses/${id}`, { Amount: Number(Amount) })
}

export function deleteHistoryExpense(id) {
  return remove(`/history-expenses/${id}`)
}
