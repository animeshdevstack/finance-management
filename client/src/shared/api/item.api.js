import { get, post, put, remove } from "@/shared/api/http"

export function getItems() {
  return get("/items")
}

export function getItem(id) {
  return get(`/items/${id}`)
}

export function createItem({ Name, MonthYear, Amount }) {
  const body = { Name, MonthYear }
  if (Amount != null && Amount !== "") {
    body.Amount = Number(Amount)
  }
  return post("/items", body)
}

export function updateItem(id, { Name, MonthYear }) {
  return put(`/items/${id}`, { Name, MonthYear })
}

export function deleteItem(id) {
  return remove(`/items/${id}`)
}

export function getCurrentMonthYear() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}
