import { post, postFormData } from "@/shared/api/http"

export function parseStatementPdf(file, { bank, password } = {}) {
  const formData = new FormData()
  formData.append("statement", file)
  formData.append("bank", bank)
  if (password) {
    formData.append("password", password)
  }
  return postFormData("/statement-import/parse", formData)
}

export function confirmStatementImport(transactions) {
  return post("/statement-import/confirm", { transactions })
}
