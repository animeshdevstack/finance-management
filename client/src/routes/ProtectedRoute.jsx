import { Navigate } from "react-router-dom"

import { AppShell } from "@/components/layout/AppShell"
import { useAuth } from "@/shared/hooks/useAuth"

export function ProtectedRoute({ children }) {
  const { authenticated } = useAuth()

  if (!authenticated) {
    return <Navigate to="/auth" replace />
  }

  return <AppShell>{children}</AppShell>
}
