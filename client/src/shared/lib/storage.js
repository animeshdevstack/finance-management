export const STORAGE_KEYS = {
  TOKEN: "money_split_token",
  REFRESH_TOKEN: "money_split_refresh_token",
  USER: "money_split_user",
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

export function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

export function getUserRaw() {
  return localStorage.getItem(STORAGE_KEYS.USER)
}

export function getUser() {
  const raw = getUserRaw()
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setAuthSession({ token, refreshToken, userDetails }) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userDetails))
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

export function isAuthenticated() {
  return Boolean(getToken())
}
