import { Link, NavLink, Outlet } from "react-router-dom"
import { LayoutDashboard, LogOut, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/shared/hooks/useAuth"

import "./AppShell.css"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/money-split", label: "Money Split" },
  { to: "/finance-tracking", label: "Finance Tracking" },
]

export function AppShell({ children }) {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <Link to="/dashboard" className="app-shell__logo">
          <Wallet className="size-6" />
          Money Split
        </Link>

        <nav className="app-shell__nav">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `app-shell__nav-link${isActive ? " app-shell__nav-link--active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="app-shell__actions">
          <span className="app-shell__user">{user?.Name || "User"}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="app-shell__main">{children ?? <Outlet />}</main>
    </div>
  )
}
