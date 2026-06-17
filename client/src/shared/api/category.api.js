import { get, post, put, remove } from "@/shared/api/http"

export function getCurrentMonthYear() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

export function getCategories(monthYear = getCurrentMonthYear()) {
  const query = monthYear ? `?monthYear=${encodeURIComponent(monthYear)}` : ""
  return get(`/categories${query}`)
}

export function getCategory(id) {
  return get(`/categories/${id}`)
}

export function createCategory({ Name }) {
  return post("/categories", { Name })
}

export function updateCategory(id, { Name }) {
  return put(`/categories/${id}`, { Name })
}

export function deleteCategory(id) {
  return remove(`/categories/${id}`)
}
