import { useCallback, useMemo, useSyncExternalStore } from "react"

import {
  clearAuthSession,
  getUserRaw,
  isAuthenticated,
  setAuthSession,
  STORAGE_KEYS,
} from "@/shared/lib/storage"

function subscribe(callback) {
  window.addEventListener("storage", callback)
  window.addEventListener("auth-change", callback)

  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener("auth-change", callback)
  }
}

function notifyAuthChange() {
  window.dispatchEvent(new Event("auth-change"))
}

function getTokenSnapshot() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

export function useAuth() {
  const authenticated = useSyncExternalStore(
    subscribe,
    isAuthenticated,
    () => false
  )

  const userRaw = useSyncExternalStore(subscribe, getUserRaw, () => null)
  const user = useMemo(() => {
    if (!userRaw) return null
    try {
      return JSON.parse(userRaw)
    } catch {
      return null
    }
  }, [userRaw])

  const token = useSyncExternalStore(subscribe, getTokenSnapshot, () => null)

  const login = useCallback((session) => {
    setAuthSession(session)
    notifyAuthChange()
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    notifyAuthChange()
  }, [])

  return {
    authenticated,
    user,
    token,
    login,
    logout,
  }
}
