import { get, post, remove } from "@/shared/api/http"

export function getGroups() {
  return get("/groups")
}

export function getGroup(id) {
  return get(`/groups/${id}`)
}

export function getGroupBalances(id) {
  return get(`/groups/${id}/balances`)
}

export function createGroup(payload) {
  return post("/groups", payload)
}

export function getGroupExpenses(groupId) {
  return get(`/groups/${groupId}/expenses`)
}

export function createGroupExpense(groupId, payload) {
  return post(`/groups/${groupId}/expenses`, payload)
}

export function deleteGroupExpense(groupId, expenseId) {
  return remove(`/groups/${groupId}/expenses/${expenseId}`)
}
