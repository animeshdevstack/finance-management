import { Navigate } from "react-router-dom"

import { useAuth } from "@/shared/hooks/useAuth"

export function GuestRoute({ children }) {
  const { authenticated } = useAuth()

  if (authenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
