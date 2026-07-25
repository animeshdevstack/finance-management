import { get, post } from "@/shared/api/http"

export function getContacts() {
  return get("/contacts")
}

export function addContact({ phone, displayName }) {
  return post("/contacts", { phone, displayName })
}
