import { post, postFormData } from "@/shared/api/http"

export function parseStatementPdf(file) {
  const formData = new FormData()
  formData.append("statement", file)
  return postFormData("/statement-import/parse", formData)
}

export function confirmStatementImport(transactions) {
  return post("/statement-import/confirm", { transactions })
}
