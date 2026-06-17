import { getToken, handleUnauthorized } from "@/shared/lib/storage"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))

  if (response.status === 401) {
    handleUnauthorized()
    throw new ApiError(data.message || "Session expired", 401)
  }

  if (!response.ok) {
    throw new ApiError(
      data.Error || data.error || data.message || "Something went wrong",
      response.status
    )
  }

  if (data.success === false) {
    throw new ApiError(data.Error || data.error || data.message || "Request failed", response.status)
  }

  return data
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  })

  return parseResponse(response)
}

export async function get(path) {
  return request(path, { method: "GET" })
}

export async function post(path, body) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function put(path, body) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export async function remove(path) {
  return request(path, { method: "DELETE" })
}
