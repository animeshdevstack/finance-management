import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Auth from "@/pages/Auth/Auth"
import Dashboard from "@/pages/Dashboard/Dashboard"
import FinanceTracking from "@/pages/FinanceTracking/FinanceTracking"
import Home from "@/pages/Home/Home"
import MoneySplit from "@/pages/MoneySplit/MoneySplit"
import { GuestRoute } from "@/routes/GuestRoute"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { useAuth } from "@/shared/hooks/useAuth"

function CatchAllRedirect() {
  const { authenticated } = useAuth()
  return <Navigate to={authenticated ? "/dashboard" : "/"} replace />
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/auth"
          element={
            <GuestRoute>
              <Auth />
            </GuestRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/money-split/*"
          element={
            <ProtectedRoute>
              <MoneySplit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance-tracking"
          element={
            <ProtectedRoute>
              <FinanceTracking />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<CatchAllRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
